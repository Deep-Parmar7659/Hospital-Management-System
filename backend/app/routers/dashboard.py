# pyright: reportMissingImports=false
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..database import get_db
from ..models.user import User
from ..models.staff import Staff  # Adjust import based on your actual models
from ..models.attendance import Attendance
from ..models.leave import Leave
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get real-time dashboard statistics"""
    
    # Get total staff count
    staff_result = await db.execute(select(func.count(Staff.id)))
    total_staff = staff_result.scalar() or 0
    
    # Get on-duty staff (you'll need to define what "on-duty" means)
    on_duty_result = await db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.date == datetime.now().date(),
            Attendance.status == "present"
        )
    )
    on_duty_staff = on_duty_result.scalar() or 0
    
    # Get pending leaves
    pending_leaves_result = await db.execute(
        select(func.count(Leave.id)).where(
            Leave.status == "pending"
        )
    )
    pending_leaves = pending_leaves_result.scalar() or 0
    
    # Get active beds (you'll need a Bed model or define this)
    total_beds = 200  # You can make this dynamic later
    occupied_beds = 142  # Fetch from your Patient model
    
    return {
        "total_staff": total_staff,
        "on_duty_staff": on_duty_staff,
        "pending_leaves": pending_leaves,
        "active_beds": occupied_beds,
        "total_beds": total_beds,
        "icu_status": "85% Full"  # Calculate from ICU patients
    }

@router.get("/metrics")
async def get_weekly_metrics(
    db: AsyncSession = Depends(get_db)
):
    """Get weekly metrics for the chart"""
    # This will fetch real data for the last 7 days
    # You'll need to implement based on your actual models
    return {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "admissions": [24, 28, 45, 32, 52, 38, 25],  # Replace with real data
        "discharges": [20, 25, 38, 30, 45, 35, 22]   # Replace with real data
    }