from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models.notification import Notification

router = APIRouter()

@router.get("/{staff_id}")
async def get_notifications(staff_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification)
        .where(Notification.staff_id == staff_id)
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalar_one_or_none()
    if notification:
        notification.is_read = True
        await db.commit()
    return {"message": "Notification marked as read"}