from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..database import Base
import enum
from datetime import datetime

class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    LATE = "Late"
    ABSENT = "Absent"
    ON_LEAVE = "On Leave"

class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.PRESENT)
    
    # Relationship to Staff
    staff = relationship("Staff", backref="attendance_records")