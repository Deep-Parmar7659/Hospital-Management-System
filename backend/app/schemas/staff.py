from pydantic import BaseModel, EmailStr # type: ignore # type : ignore
from typing import Optional
from ..models.staff import ShiftType, StaffStatus

class StaffCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    department: str
    designation: str
    shift: str
    status: str

class StaffResponse(BaseModel):
    id: int
    full_name: str
    email: str
    department: str
    designation: str
    shift: str
    status: str

    class Config:
        from_attributes = True