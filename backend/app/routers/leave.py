from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_  # ✅ Added or_ for querying multiple designations
from typing import List
from ..database import get_db
from ..models.leave import LeaveRequest, LeaveStatus
from ..models.staff import Staff
from ..models.notification import Notification  # ✅ NEW: Import Notification model
from ..schemas.leave import LeaveCreate, LeaveStatusUpdate, LeaveResponse

router = APIRouter()

# CREATE LEAVE REQUEST
@router.post("/", response_model=LeaveResponse, status_code=201)
async def create_leave_request(leave: LeaveCreate, db: AsyncSession = Depends(get_db)):
    # Verify staff exists
    staff_result = await db.execute(select(Staff).where(Staff.id == leave.staff_id))
    staff = staff_result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    new_leave = LeaveRequest(**leave.model_dump())
    db.add(new_leave)
    
    # ✅ NEW: Notify all HR and Admin staff about the new request
    managers_result = await db.execute(
        select(Staff).where(or_(Staff.designation == "HR", Staff.designation == "Admin"))
    )
    managers = managers_result.scalars().all()
    
    for manager in managers:
        notification = Notification(
            staff_id=manager.id,
            message=f"New leave request from {staff.full_name} ({staff.department}) for {leave.leave_type}.",
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

# UPDATE LEAVE STATUS (Approve/Reject with Admin Override)
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
    
    # ✅ REMOVED: The check that prevented updating non-pending requests. 
    # This allows Admin to override HR's approval (e.g., change "Approved" to "Rejected").

    leave.status = status_update.status
    await db.commit()
    await db.refresh(leave)

    # Fetch staff info for response and notification
    staff_result = await db.execute(select(Staff).where(Staff.id == leave.staff_id))
    staff = staff_result.scalar_one()

    # ✅ NEW: Notify the staff member about the final decision
    notification = Notification(
        staff_id=leave.staff_id,
        message=f"Your {leave.leave_type} leave request has been {status_update.status.lower()} by {status_update.updated_by_role.upper()}.",
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