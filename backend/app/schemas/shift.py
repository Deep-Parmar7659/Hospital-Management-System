from pydantic import BaseModel
from typing import Optional
from datetime import date
from ..models.shift import ShiftType

class ShiftCreate(BaseModel):
    staff_id: int
    date: date
    shift_type: ShiftType

class ShiftUpdate(BaseModel):
    shift_type: ShiftType

class ShiftResponse(BaseModel):
    id: int
    staff_id: int
    staff_name: str
    staff_department: str
    date: date
    shift_type: ShiftType

    class Config:
        from_attributes = True

class WeeklyShiftsResponse(BaseModel):
    week_start: date
    shifts: list[ShiftResponse]