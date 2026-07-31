from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class ShiftType(str, enum.Enum):
    MORNING = "Morning"
    EVENING = "Evening"
    NIGHT = "Night"
    OFF = "Off"

class ShiftSchedule(Base):
    __tablename__ = "shift_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    date = Column(Date, nullable=False)
    shift_type = Column(Enum(ShiftType), default=ShiftType.MORNING)
    
    # Relationships
    staff = relationship("Staff", backref="shift_schedules")