from sqlalchemy import Column, Integer, String, Boolean, Index
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="staff")
    is_active = Column(Boolean, default=True)  # <-- ADDED THIS LINE

    # Unique index for faster login lookups
    __table_args__ = (Index('ix_user_email_unique', 'email', unique=True),)