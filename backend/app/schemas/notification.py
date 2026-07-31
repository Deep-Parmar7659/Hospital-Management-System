from pydantic import BaseModel
from datetime import datetime

class NotificationCreate(BaseModel):
    title: str
    message: str

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True