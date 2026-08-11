from pydantic import BaseModel # type: ignore
from typing import Optional
from datetime import date, datetime
from ..models.leave import LeaveType, LeaveStatus

class LeaveCreate(BaseModel):
    staff_id: int
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str

class LeaveStatusUpdate(BaseModel):
    status: LeaveStatus
    updated_by_role: str 

class LeaveResponse(BaseModel):
    id: int
    staff_id: int
    staff_name: str
    staff_department: str
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str
    status: LeaveStatus
    created_at: datetime

    class Config:
        from_attributes = True