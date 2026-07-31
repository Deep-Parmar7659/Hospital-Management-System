from pydantic import BaseModel, EmailStr
from typing import Optional
from ..models.staff import ShiftType, StaffStatus

class StaffCreate(BaseModel):
    full_name: str
    email: EmailStr
    department: str
    designation: str
    shift: ShiftType = ShiftType.MORNING
    status: StaffStatus = StaffStatus.ACTIVE

class StaffResponse(BaseModel):
    id: int
    full_name: str
    email: str
    department: str
    designation: str
    shift: ShiftType
    status: StaffStatus

    class Config:
        from_attributes = True