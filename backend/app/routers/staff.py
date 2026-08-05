from fastapi import APIRouter, Depends, HTTPException, status
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
    return result.scalars().all()

# ADD NEW STAFF
@router.post("/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(staff_data: StaffCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(Staff).where(Staff.email == staff_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_staff = Staff(
        full_name=staff_data.full_name,
        email=staff_data.email,
        department=staff_data.department,
        role=staff_data.role,
        phone=staff_data.phone
    )
    db.add(new_staff)
    await db.commit()
    await db.refresh(new_staff)
    return new_staff