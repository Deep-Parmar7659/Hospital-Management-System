from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models.staff import Staff
from ..schemas.staff import StaffCreate, StaffResponse

router = APIRouter()

# GET ALL STAFF
@router.get("/", response_model=List[StaffResponse])
async def get_all_staff(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Staff))
    staff_list = result.scalars().all()
    return staff_list

# ADD NEW STAFF
@router.post("/", response_model=StaffResponse, status_code=201)
async def add_staff(staff: StaffCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(Staff).where(Staff.email == staff.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered in staff directory")

    new_staff = Staff(**staff.dict())
    db.add(new_staff)
    await db.commit()
    await db.refresh(new_staff)
    return new_staff