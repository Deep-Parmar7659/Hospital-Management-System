from sqlalchemy import Column, Integer, String, Index
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    # Notice the lowercase 'index=True' here:
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="staff")

    # Add this line to create a unique index for faster login lookups
    __table_args__ = (Index('ix_user_email_unique', 'email', unique=True),)