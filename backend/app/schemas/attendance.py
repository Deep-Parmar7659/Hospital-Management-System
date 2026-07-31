from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.attendance import AttendanceStatus

class AttendanceCheckIn(BaseModel):
    staff_id: int

class AttendanceCheckOut(BaseModel):
    staff_id: int

class AttendanceResponse(BaseModel):
    id: int
    staff_id: int
    staff_name: str
    staff_department: str
    date: datetime
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    status: AttendanceStatus

    class Config:
        from_attributes = True

class TodayAttendanceResponse(BaseModel):
    staff_id: int
    staff_name: str
    staff_email: str
    staff_department: str
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    status: AttendanceStatus
    is_checked_in: bool