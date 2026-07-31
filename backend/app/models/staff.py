from sqlalchemy import Column, Integer, String, Enum
from ..database import Base
import enum

class ShiftType(str, enum.Enum):
    MORNING = "Morning"
    EVENING = "Evening"
    NIGHT = "Night"

class StaffStatus(str, enum.Enum):
    ACTIVE = "Active"
    ON_LEAVE = "On Leave"
    OFF_DUTY = "Off Duty"

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False) # e.g., Cardiology, Neurology
    designation = Column(String, nullable=False) # e.g., Senior Doctor, Nurse
    shift = Column(Enum(ShiftType), default=ShiftType.MORNING)
    status = Column(Enum(StaffStatus), default=StaffStatus.ACTIVE)