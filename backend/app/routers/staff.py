from fastapi import APIRouter, Depends, HTTPException, status # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select
from typing import List
from ..database import get_db
from ..models.staff import Staff
from ..models.user import User
from ..schemas.staff import StaffCreate, StaffResponse
from ..core.security import get_password_hash
from ..models.attendance import Attendance
from ..models.leave import LeaveRequest
from ..models.payroll import Payroll
from ..models.shift import ShiftSchedule

router = APIRouter()

# GET ALL STAFF
@router.get("/", response_model=List[StaffResponse])
async def get_all_staff(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Staff))
    return result.scalars().all()

# ADD NEW STAFF (Now creates BOTH Staff and User records automatically)
@router.post("/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(staff_data: StaffCreate, db: AsyncSession = Depends(get_db)):
    # 1. Check if email already exists in Staff table
    result = await db.execute(select(Staff).where(Staff.email == staff_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered in Staff")
    
    # 2. Check if email already exists in User table
    result_user = await db.execute(select(User).where(User.email == staff_data.email))
    if result_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered as User")
    
    # 3. Hash the password using your app's correct, built-in security function
    hashed_password = get_password_hash(staff_data.password)
    
    # 4. Create the Staff record
    new_staff = Staff(
        full_name=staff_data.full_name,
        email=staff_data.email,
        department=staff_data.department,
        designation=staff_data.designation,
        shift=staff_data.shift,
        status=staff_data.status,
        hashed_password=hashed_password
    )
    db.add(new_staff)
    
    # 5. Automatically create the User login record
    new_user = User(
        full_name=staff_data.full_name,
        email=staff_data.email,
        hashed_password=hashed_password,
        role=staff_data.designation.lower(), # e.g., "doctor", "nurse", "receptionist"
        is_active=True
    )
    db.add(new_user)
    
    # 6. Commit BOTH records to the database at the same time
    await db.commit()
    await db.refresh(new_staff)
    
    return new_staff

# DELETE STAFF MEMBER
@router.delete("/{staff_id}", status_code=200)
async def delete_staff(staff_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Staff).where(Staff.id == staff_id))
        staff = result.scalar_one_or_none()
        
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        # Delete related records first
        await db.execute(delete(Attendance).where(Attendance.staff_id == staff_id))
        await db.execute(delete(LeaveRequest).where(LeaveRequest.staff_id == staff_id))
        await db.execute(delete(Payroll).where(Payroll.staff_id == staff_id))
        await db.execute(delete(ShiftSchedule).where(ShiftSchedule.staff_id == staff_id))
        
        # Delete the User login record
        await db.execute(delete(User).where(User.email == staff.email))
        
        # Now delete the staff member
        await db.delete(staff)
        await db.commit()
        
        return {"message": "Staff member deleted successfully", "staff_id": staff_id}
        
    except Exception as e:
        await db.rollback()
        print(f"Error deleting staff: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete staff: {str(e)}")