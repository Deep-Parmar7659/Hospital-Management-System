from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum, Index
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
    # Notice the lowercase 'index=True' here:
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    shift_type = Column(Enum(ShiftType), default=ShiftType.MORNING)
    
    # Relationships
    staff = relationship("Staff", backref="shift_schedules")
    
    # Compound index for super-fast weekly lookups
    __table_args__ = (Index('ix_shift_staff_date', 'staff_id', 'date'),)