from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PayrollGenerate(BaseModel):
    staff_id: int
    month: str
    year: int
    base_salary: float
    overtime_hours: float = 0.0
    leave_days: int = 0

class PayrollResponse(BaseModel):
    id: int
    staff_id: int
    staff_name: str
    staff_department: str
    month: str
    year: int
    base_salary: float
    overtime_pay: float
    leave_deduction: float
    net_salary: float
    status: str
    generated_at: datetime

    class Config:
        from_attributes = True