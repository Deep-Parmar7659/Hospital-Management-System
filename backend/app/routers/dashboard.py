from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from typing import List
from ..database import get_db
from ..models.staff import Staff
from ..models.leave import LeaveRequest, LeaveStatus
from ..models.shift import ShiftSchedule

router = APIRouter()

# GET WEEKLY METRICS (Admissions/Discharges simulation)
@router.get("/weekly-metrics")
async def get_weekly_metrics(db: AsyncSession = Depends(get_db)):
    # Get the last 7 days
    today = datetime.now().date()
    week_start = today - timedelta(days=6)
    
    # For now, we'll simulate admissions/discharges from shifts
    # In a real app, you'd have Patient admissions/discharges tables
    result = await db.execute(
        select(ShiftSchedule.date, func.count(ShiftSchedule.id))
        .where(and_(ShiftSchedule.date >= week_start, ShiftSchedule.date <= today))
        .group_by(ShiftSchedule.date)
    )
    
    shift_data = {row[0]: row[1] for row in result.all()}
    
    # Generate weekly data
    weekly_data = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    for i in range(7):
        current_date = week_start + timedelta(days=i)
        count = shift_data.get(current_date, 0)
        
        weekly_data.append({
            "day": days[i],
            "admissions": count + 10,  # Simulated admissions
            "discharges": count + 5,   # Simulated discharges
        })
    
    return weekly_data

# GET STAFF BY DEPARTMENT
@router.get("/staff-by-department")
async def get_staff_by_department(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Staff.department, func.count(Staff.id))
        .group_by(Staff.department)
    )
    
    return [
        {"name": dept, "staff": count}
        for dept, count in result.all()
    ]

# GET LEAVE STATUS DISTRIBUTION
@router.get("/leave-distribution")
async def get_leave_distribution(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LeaveRequest.status, func.count(LeaveRequest.id))
        .group_by(LeaveRequest.status)
    )
    
    status_data = {status: count for status, count in result.all()}
    
    # Map status to colors
    colors = {
        "Pending": "#fbbf24",
        "Approved": "#10b981",
        "Rejected": "#ef4444",
    }
    
    return [
        {
            "name": status,
            "value": count,
            "color": colors.get(status, "#6b7280")
        }
        for status, count in status_data.items()
    ]

# GET DASHBOARD STATS
@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Total beds (you can make this dynamic)
    total_beds = 200
    
    # Active beds (staff on duty)
    on_duty_result = await db.execute(
        select(func.count(ShiftSchedule.id))
        .where(ShiftSchedule.date == datetime.now().date())
    )
    on_duty_staff = on_duty_result.scalar() or 0
    
    # Pending leaves
    pending_leaves_result = await db.execute(
        select(func.count(LeaveRequest.id))
        .where(LeaveRequest.status == LeaveStatus.PENDING)
    )
    pending_leaves = pending_leaves_result.scalar() or 0
    
    # Total staff
    total_staff_result = await db.execute(select(func.count(Staff.id)))
    total_staff = total_staff_result.scalar() or 0
    
    return {
        "active_beds": on_duty_staff,
        "total_beds": total_beds,
        "on_duty_staff": on_duty_staff,
        "icu_status": f"{int((on_duty_staff / total_staff * 100) if total_staff > 0 else 0)}% Full",
        "pending_leaves": pending_leaves,
    }