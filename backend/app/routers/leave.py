from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from ..database import get_db
from ..models.leave import LeaveRequest, LeaveStatus
from ..models.staff import Staff
from ..models.user import User # To find Admins/HR
from ..models.notification import Notification # Import Notification model
from ..schemas.leave import LeaveCreate, LeaveStatusUpdate, LeaveResponse

router = APIRouter()

# CREATE LEAVE REQUEST
@router.post("/", response_model=LeaveResponse, status_code=201)
async def create_leave_request(leave: LeaveCreate, db: AsyncSession = Depends(get_db)):
    # 1. Verify staff exists
    staff_result = await db.execute(select(Staff).where(Staff.id == leave.staff_id))
    staff = staff_result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    # 2. Create the leave request
    new_leave = LeaveRequest(**leave.model_dump())
    db.add(new_leave)
    
    # 3. TRIGGER: Notify all Admins and HR about the new request
    admins_hr_result = await db.execute(
        select(User).where(User.role.in_(["admin", "hr"]))
    )
    admins_hr = admins_hr_result.scalars().all()
    
    for admin_hr in admins_hr:
        # Find their staff_id to link the notification (if they are in the staff table)
        staff_user = await db.execute(select(Staff).where(Staff.email == admin_hr.email))
        staff_record = staff_user.scalar_one_or_none()
        target_staff_id = staff_record.id if staff_record else None
        
        if target_staff_id:
            notification = Notification(
                staff_id=target_staff_id,
                message=f"New {leave.leave_type} leave request from {staff.full_name} ({staff.department}).",
                is_read=False
            )
            db.add(notification)
    
    await db.commit()
    await db.refresh(new_leave)

    return LeaveResponse(
        id=new_leave.id,
        staff_id=new_leave.staff_id,
        staff_name=staff.full_name,
        staff_department=staff.department,
        leave_type=new_leave.leave_type,
        start_date=new_leave.start_date,
        end_date=new_leave.end_date,
        reason=new_leave.reason,
        status=new_leave.status,
        created_at=new_leave.created_at
    )

# GET ALL LEAVE REQUESTS
@router.get("/", response_model=List[LeaveResponse])
async def get_all_leave_requests(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LeaveRequest, Staff)
        .join(Staff)
        .order_by(LeaveRequest.created_at.desc())
    )
    
    leaves = []
    for leave, staff in result.all():
        leaves.append(LeaveResponse(
            id=leave.id,
            staff_id=leave.staff_id,
            staff_name=staff.full_name,
            staff_department=staff.department,
            leave_type=leave.leave_type,
            start_date=leave.start_date,
            end_date=leave.end_date,
            reason=leave.reason,
            status=leave.status,
            created_at=leave.created_at
        ))
    return leaves

# UPDATE LEAVE STATUS (Approve/Reject)
@router.patch("/{leave_id}/status", response_model=LeaveResponse)
async def update_leave_status(
    leave_id: int, 
    status_update: LeaveStatusUpdate, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == leave_id))
    leave = result.scalar_one_or_none()
    
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    leave.status = status_update.status
    await db.commit()
    await db.refresh(leave)

    staff_result = await db.execute(select(Staff).where(Staff.id == leave.staff_id))
    staff = staff_result.scalar_one()

    # 4. TRIGGER: Notify the staff member about the decision
    notification = Notification(
        staff_id=leave.staff_id,
        message=f"Your {leave.leave_type} leave request has been {status_update.status.lower()}.",
        is_read=False
    )
    db.add(notification)
    await db.commit()

    return LeaveResponse(
        id=leave.id,
        staff_id=leave.staff_id,
        staff_name=staff.full_name,
        staff_department=staff.department,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        status=leave.status,
        created_at=leave.created_at
    )