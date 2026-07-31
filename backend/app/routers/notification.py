from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from ..database import get_db
from ..models.notification import Notification
from ..schemas.notification import NotificationCreate, NotificationResponse

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).order_by(desc(Notification.created_at)))
    return result.scalars().all()

@router.post("/", response_model=NotificationResponse, status_code=201)
async def create_notification(data: NotificationCreate, db: AsyncSession = Depends(get_db)):
    new_notif = Notification(**data.dict())
    db.add(new_notif)
    await db.commit()
    await db.refresh(new_notif)
    return new_notif

@router.patch("/{notif_id}/read")
async def mark_as_read(notif_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.id == notif_id))
    notif = result.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"status": "success"}