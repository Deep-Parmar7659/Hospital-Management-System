from sqlalchemy import Column, Integer, String, Date, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
import enum
from datetime import datetime

class LeaveType(str, enum.Enum):
    CASUAL = "Casual"
    SICK = "Sick"
    EMERGENCY = "Emergency"
    MATERNITY = "Maternity"

class LeaveStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to Staff
    staff = relationship("Staff", backref="leave_requests")