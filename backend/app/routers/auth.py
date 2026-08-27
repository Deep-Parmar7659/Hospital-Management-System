from fastapi import APIRouter, Depends, HTTPException, status # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..models.staff import Staff
from ..schemas.user import UserCreate, UserLogin, Token, UserResponse
from ..core.security import get_password_hash, verify_password, create_access_token
from ..config import settings
from datetime import timedelta

router = APIRouter()

# --- REGISTER ENDPOINT ---
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role if hasattr(user, 'role') else "staff",
        is_active=True  # <-- ADDED THIS LINE
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

# --- LOGIN ENDPOINT ---
@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user by email
    result = await db.execute(select(User).where(User.email == user_credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    staff_result = await db.execute(select(Staff).where(Staff.email == user.email))
    staff_record = staff_result.scalar_one_or_none()
    
    # If no staff record exists, create one automatically
    if not staff_record:
        print(f"⚠️ No staff record found for {user.email}, creating one...")
        staff_record = Staff(
            full_name=user.full_name,
            email=user.email,
            department="Administration" if user.role == "admin" else "Human Resources",
            designation=user.role.capitalize(),
            shift="Morning",
            status="Active",
            hashed_password=user.hashed_password
        )
        db.add(staff_record)
        await db.commit()
        await db.refresh(staff_record)
        print(f"✅ Created staff record with ID: {staff_record.id}")
    
    staff_id = staff_record.id
    
    # Generate JWT Token with STAFF ID included
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email, 
            "role": user.role,
            "full_name": user.full_name,
            "staff_id": staff_id
        },
        expires_delta=access_token_expires
    )
    
    print(f"🔑 Login successful for {user.email} with staff_id: {staff_id}")
    
    return {"access_token": access_token, "token_type": "bearer"}