from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models.payroll import Payroll
from ..models.staff import Staff
from ..schemas.payroll import PayrollGenerate, PayrollResponse

router = APIRouter()

# GENERATE PAYSLIP
@router.post("/generate", response_model=PayrollResponse, status_code=201)
async def generate_payslip(data: PayrollGenerate, db: AsyncSession = Depends(get_db)):
    # Check if payslip already exists for this month/year
    result = await db.execute(
        select(Payroll).where(
            Payroll.staff_id == data.staff_id,
            Payroll.month == data.month,
            Payroll.year == data.year
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Payslip already generated for this month")

    # Fetch staff
    staff_result = await db.execute(select(Staff).where(Staff.id == data.staff_id))
    staff = staff_result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    # --- PAYROLL CALCULATION LOGIC ---
    overtime_rate = 50.0  # $50 per overtime hour
    leave_deduction_rate = 100.0 # $100 deducted per leave day
    
    overtime_pay = data.overtime_hours * overtime_rate
    leave_deduction = data.leave_days * leave_deduction_rate
    net_salary = data.base_salary + overtime_pay - leave_deduction

    new_payroll = Payroll(
        staff_id=data.staff_id,
        month=data.month,
        year=data.year,
        base_salary=data.base_salary,
        overtime_pay=overtime_pay,
        leave_deduction=leave_deduction,
        net_salary=net_salary
    )
    
    db.add(new_payroll)
    await db.commit()
    await db.refresh(new_payroll)

    return PayrollResponse(
        id=new_payroll.id,
        staff_id=new_payroll.staff_id,
        staff_name=staff.full_name,
        staff_department=staff.department,
        month=new_payroll.month,
        year=new_payroll.year,
        base_salary=new_payroll.base_salary,
        overtime_pay=new_payroll.overtime_pay,
        leave_deduction=new_payroll.leave_deduction,
        net_salary=new_payroll.net_salary,
        status=new_payroll.status,
        generated_at=new_payroll.generated_at
    )

# GET ALL PAYROLLS
@router.get("/", response_model=List[PayrollResponse])
async def get_all_payrolls(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Payroll, Staff)
        .join(Staff)
        .order_by(Payroll.generated_at.desc())
    )
    
    payrolls = []
    for payroll, staff in result.all():
        payrolls.append(PayrollResponse(
            id=payroll.id,
            staff_id=payroll.staff_id,
            staff_name=staff.full_name,
            staff_department=staff.department,
            month=payroll.month,
            year=payroll.year,
            base_salary=payroll.base_salary,
            overtime_pay=payroll.overtime_pay,
            leave_deduction=payroll.leave_deduction,
            net_salary=payroll.net_salary,
            status=payroll.status,
            generated_at=payroll.generated_at
        ))
    return payrolls