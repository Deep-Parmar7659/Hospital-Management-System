from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime  # <-- ADDED THIS IMPORT
from ..database import get_db
from ..models.shift import ShiftSchedule, ShiftType
from ..models.staff import Staff
from ..schemas.shift import ShiftCreate, ShiftUpdate, ShiftResponse

router = APIRouter()

# GET SHIFTS FOR A WEEK
@router.get("/week", response_model=List[ShiftResponse])
async def get_weekly_shifts(
    start_date: str = Query(..., description="YYYY-MM-DD"),
    end_date: str = Query(..., description="YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db)
):
    # FIX: Convert string dates to Python date objects for PostgreSQL comparison
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    result = await db.execute(
        select(ShiftSchedule, Staff)
        .join(Staff)
        .where(ShiftSchedule.date >= start, ShiftSchedule.date <= end)
        .order_by(ShiftSchedule.date, Staff.full_name)
    )
    
    shifts = []
    for shift, staff in result.all():
        shifts.append(ShiftResponse(
            id=shift.id,
            staff_id=shift.staff_id,
            staff_name=staff.full_name,
            staff_department=staff.department,
            date=shift.date,
            shift_type=shift.shift_type
        ))
    
    return shifts

# ASSIGN SHIFT
@router.post("/", response_model=ShiftResponse, status_code=201)
async def assign_shift(shift_data: ShiftCreate, db: AsyncSession = Depends(get_db)):
    # Convert date to Python date object just in case the schema passes it as a string
    target_date = shift_data.date
    if isinstance(target_date, str):
        target_date = datetime.strptime(target_date, "%Y-%m-%d").date()

    # Check if shift already exists for this date and staff
    result = await db.execute(
        select(ShiftSchedule).where(
            ShiftSchedule.staff_id == shift_data.staff_id,
            ShiftSchedule.date == target_date
        )
    )
    existing_shift = result.scalar_one_or_none()
    
    if existing_shift:
        # Update existing shift
        existing_shift.shift_type = shift_data.shift_type
        await db.commit()
        await db.refresh(existing_shift)
        shift = existing_shift
    else:
        # Create new shift
        new_shift = ShiftSchedule(
            staff_id=shift_data.staff_id,
            date=target_date,
            shift_type=shift_data.shift_type
        )
        db.add(new_shift)
        await db.commit()
        await db.refresh(new_shift)
        shift = new_shift
    
    # Get staff info
    staff_result = await db.execute(select(Staff).where(Staff.id == shift.staff_id))
    staff = staff_result.scalar_one()
    
    return ShiftResponse(
        id=shift.id,
        staff_id=shift.staff_id,
        staff_name=staff.full_name,
        staff_department=staff.department,
        date=shift.date,
        shift_type=shift.shift_type
    )

# UPDATE SHIFT
@router.patch("/{shift_id}", response_model=ShiftResponse)
async def update_shift(shift_id: int, shift_data: ShiftUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShiftSchedule).where(ShiftSchedule.id == shift_id))
    shift = result.scalar_one_or_none()
    
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    shift.shift_type = shift_data.shift_type
    await db.commit()
    await db.refresh(shift)
    
    # Get staff info
    staff_result = await db.execute(select(Staff).where(Staff.id == shift.staff_id))
    staff = staff_result.scalar_one()
    
    return ShiftResponse(
        id=shift.id,
        staff_id=shift.staff_id,
        staff_name=staff.full_name,
        staff_department=staff.department,
        date=shift.date,
        shift_type=shift.shift_type
    )

# GET ALL STAFF FOR DROPDOWN
@router.get("/staff-list")
async def get_staff_list(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Staff))
    staff_list = result.scalars().all()
    return [{"id": s.id, "name": s.full_name, "department": s.department} for s in staff_list]