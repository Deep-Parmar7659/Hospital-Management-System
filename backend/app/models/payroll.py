from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class Payroll(Base):
    __tablename__ = "payrolls"
    
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    month = Column(String, nullable=False) # e.g., "July"
    year = Column(Integer, nullable=False) # e.g., 2026
    
    base_salary = Column(Float, nullable=False)
    overtime_pay = Column(Float, default=0.0)
    leave_deduction = Column(Float, default=0.0)
    net_salary = Column(Float, nullable=False)
    
    status = Column(String, default="Pending") # Pending, Paid
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    staff = relationship("Staff", backref="payrolls")