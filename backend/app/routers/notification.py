from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from ..database import get_db
from ..models.notification import Notification
from ..schemas.notification import NotificationResponse

router = APIRouter()

# GET NOTIFICATIONS FOR CURRENT USER (by staff_id)
@router.get("/staff/{staff_id}", response_model=List[NotificationResponse])
async def get_notifications(staff_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification)
        .where(Notification.staff_id == staff_id)
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()

# MARK NOTIFICATION AS READ
@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    await db.commit()
    
    return {"message": "Notification marked as read"}

# MARK ALL NOTIFICATIONS AS READ
@router.patch("/staff/{staff_id}/read-all")
async def mark_all_as_read(staff_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Notification)
        .where(Notification.staff_id == staff_id)
        .values(is_read=True)
    )
    await db.commit()
    
    return {"message": "All notifications marked as read"}

# GET UNREAD COUNT
@router.get("/staff/{staff_id}/unread-count")
async def get_unread_count(staff_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification)
        .where(Notification.staff_id == staff_id)
        .where(Notification.is_read == False)
    )
    count = len(result.scalars().all())
    
    return {"unread_count": count}