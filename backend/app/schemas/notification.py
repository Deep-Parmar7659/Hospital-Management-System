from pydantic import BaseModel  # type: ignore
from datetime import datetime
from typing import Optional

class NotificationResponse(BaseModel):
    id: int
    staff_id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True