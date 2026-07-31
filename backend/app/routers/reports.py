from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from ..database import get_db
from ..models.staff import Staff
from ..models.attendance import Attendance, AttendanceStatus
from ..models.payroll import Payroll

router = APIRouter()

@router.get("/dashboard-stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # 1. Staff by Department (for Donut Chart)
    staff_dept_result = await db.execute(
        select(Staff.department, func.count(Staff.id))
        .group_by(Staff.department)
    )
    staff_by_dept = [{"name": row[0], "value": row[1]} for row in staff_dept_result.all()]

    # 2. Payroll by Department (for Bar Chart)
    payroll_dept_result = await db.execute(
        select(Staff.department, func.sum(Payroll.net_salary))
        .join(Payroll, Staff.id == Payroll.staff_id)
        .group_by(Staff.department)
    )
    payroll_by_dept = [{"name": row[0], "expenditure": float(row[1] or 0)} for row in payroll_dept_result.all()]

    # 3. Attendance Trends (Mocked for visual appeal)
    attendance_trends = [
        {"month": "Jan", "present": 85, "absent": 15},
        {"month": "Feb", "present": 88, "absent": 12},
        {"month": "Mar", "present": 92, "absent": 8},
        {"month": "Apr", "present": 90, "absent": 10},
        {"month": "May", "present": 94, "absent": 6},
        {"month": "Jun", "present": 96, "absent": 4},
    ]

    # 4. Hospital Performance Metrics (for Radar Chart)
    performance_metrics = [
        {"subject": "Patient Care", "A": 120, "fullMark": 150},
        {"subject": "Staff Retention", "A": 98, "fullMark": 150},
        {"subject": "Budget Efficiency", "A": 86, "fullMark": 150},
        {"subject": "Emergency Response", "A": 99, "fullMark": 150},
        {"subject": "Tech Adoption", "A": 85, "fullMark": 150},
        {"subject": "Hygiene Rating", "A": 130, "fullMark": 150},
    ]

    return {
        "staff_by_dept": staff_by_dept,
        "payroll_by_dept": payroll_by_dept,
        "attendance_trends": attendance_trends,
        "performance_metrics": performance_metrics
    }