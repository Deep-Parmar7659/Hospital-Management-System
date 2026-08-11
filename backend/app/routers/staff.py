from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select
from typing import List
from ..database import get_db
from ..models.staff import Staff
from ..schemas.staff import StaffCreate, StaffResponse
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

# ADD NEW STAFF
@router.post("/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(staff_data: StaffCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(Staff).where(Staff.email == staff_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new staff with CORRECT fields matching your schema
    new_staff = Staff(
        full_name=staff_data.full_name,
        email=staff_data.email,
        department=staff_data.department,
        designation=staff_data.designation,
        shift=staff_data.shift,
        status=staff_data.status
    )
    
    db.add(new_staff)
    await db.commit()
    await db.refresh(new_staff)
    
    return new_staff

# DELETE STAFF MEMBER
@router.delete("/{staff_id}", status_code=200)
async def delete_staff(staff_id: int, db: AsyncSession = Depends(get_db)):
    try:
        # Check if staff exists
        result = await db.execute(select(Staff).where(Staff.id == staff_id))
        staff = result.scalar_one_or_none()
        
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        # Delete related records first to avoid foreign key conflicts
        # Delete attendance records
        await db.execute(delete(Attendance).where(Attendance.staff_id == staff_id))
        
        # Delete leave requests
        await db.execute(delete(LeaveRequest).where(LeaveRequest.staff_id == staff_id))
        
        # Delete payroll records
        await db.execute(delete(Payroll).where(Payroll.staff_id == staff_id))
        
        # Delete shift schedules
        await db.execute(delete(ShiftSchedule).where(ShiftSchedule.staff_id == staff_id))
        
        # Now delete the staff member
        await db.delete(staff)
        await db.commit()
        
        return {"message": "Staff member deleted successfully", "staff_id": staff_id}
        
    except Exception as e:
        await db.rollback()
        print(f"Error deleting staff: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete staff: {str(e)}")