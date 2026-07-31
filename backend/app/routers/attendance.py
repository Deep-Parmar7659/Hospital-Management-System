from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from typing import List
from datetime import datetime, date
from ..database import get_db
from ..models.attendance import Attendance, AttendanceStatus
from ..models.staff import Staff
from ..schemas.attendance import (
    AttendanceCheckIn, 
    AttendanceCheckOut, 
    AttendanceResponse,
    TodayAttendanceResponse
)

router = APIRouter()

# CHECK-IN ENDPOINT
@router.post("/check-in", response_model=AttendanceResponse)
async def check_in(attendance_data: AttendanceCheckIn, db: AsyncSession = Depends(get_db)):
    # Check if staff already checked in today
    today = date.today()
    result = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.staff_id == attendance_data.staff_id,
                Attendance.date >= datetime.combine(today, datetime.min.time()),
                Attendance.date <= datetime.combine(today, datetime.max.time())
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing and existing.check_in:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    # Determine if late (after 9:00 AM)
    current_time = datetime.now()
    status = AttendanceStatus.LATE if current_time.hour >= 9 else AttendanceStatus.PRESENT
    
    if existing:
        existing.check_in = current_time
        existing.status = status
        await db.commit()
        await db.refresh(existing)
        attendance_record = existing
    else:
        new_attendance = Attendance(
            staff_id=attendance_data.staff_id,
            check_in=current_time,
            status=status
        )
        db.add(new_attendance)
        await db.commit()
        await db.refresh(new_attendance)
        attendance_record = new_attendance
    
    # Get staff info
    staff_result = await db.execute(select(Staff).where(Staff.id == attendance_data.staff_id))
    staff = staff_result.scalar_one()
    
    return AttendanceResponse(
        id=attendance_record.id,
        staff_id=attendance_record.staff_id,
        staff_name=staff.full_name,
        staff_department=staff.department,
        date=attendance_record.date,
        check_in=attendance_record.check_in,
        check_out=attendance_record.check_out,
        status=attendance_record.status
    )

# CHECK-OUT ENDPOINT
@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(attendance_data: AttendanceCheckOut, db: AsyncSession = Depends(get_db)):
    today = date.today()
    result = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.staff_id == attendance_data.staff_id,
                Attendance.date >= datetime.combine(today, datetime.min.time()),
                Attendance.date <= datetime.combine(today, datetime.max.time())
            )
        )
    )
    attendance_record = result.scalar_one_or_none()
    
    if not attendance_record or not attendance_record.check_in:
        raise HTTPException(status_code=400, detail="No check-in record found for today")
    
    if attendance_record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out today")
    
    attendance_record.check_out = datetime.now()
    await db.commit()
    await db.refresh(attendance_record)
    
    # Get staff info
    staff_result = await db.execute(select(Staff).where(Staff.id == attendance_data.staff_id))
    staff = staff_result.scalar_one()
    
    return AttendanceResponse(
        id=attendance_record.id,
        staff_id=attendance_record.staff_id,
        staff_name=staff.full_name,
        staff_department=staff.department,
        date=attendance_record.date,
        check_in=attendance_record.check_in,
        check_out=attendance_record.check_out,
        status=attendance_record.status
    )

# GET TODAY'S ATTENDANCE
@router.get("/today", response_model=List[TodayAttendanceResponse])
async def get_today_attendance(db: AsyncSession = Depends(get_db)):
    today = date.today()
    result = await db.execute(
        select(Attendance, Staff)
        .join(Staff)
        .where(
            Attendance.date >= datetime.combine(today, datetime.min.time())
        )
        .order_by(Attendance.check_in.desc())
    )
    
    records = result.all()
    
    attendance_list = []
    for attendance, staff in records:
        attendance_list.append(TodayAttendanceResponse(
            staff_id=staff.id,
            staff_name=staff.full_name,
            staff_email=staff.email,
            staff_department=staff.department,
            check_in=attendance.check_in,
            check_out=attendance.check_out,
            status=attendance.status,
            is_checked_in=attendance.check_in is not None and attendance.check_out is None
        ))
    
    return attendance_list

# GET ATTENDANCE HISTORY (Last 7 days)
@router.get("/history", response_model=List[AttendanceResponse])
async def get_attendance_history(db: AsyncSession = Depends(get_db)):
    from datetime import timedelta
    seven_days_ago = datetime.now() - timedelta(days=7)
    
    result = await db.execute(
        select(Attendance, Staff)
        .join(Staff)
        .where(Attendance.date >= seven_days_ago)
        .order_by(Attendance.date.desc())
    )
    
    records = result.all()
    
    attendance_list = []
    for attendance, staff in records:
        attendance_list.append(AttendanceResponse(
            id=attendance.id,
            staff_id=attendance.staff_id,
            staff_name=staff.full_name,
            staff_department=staff.department,
            date=attendance.date,
            check_in=attendance.check_in,
            check_out=attendance.check_out,
            status=attendance.status
        ))
    
    return attendance_list