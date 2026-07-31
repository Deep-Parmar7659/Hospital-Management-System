from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth # <-- ADD THIS LINE
from .routers import staff
from .routers import attendance
from .routers import leave
from .routers import payroll
from .routers import notification
from .routers import reports
from .routers import shift
app = FastAPI(
    title="Futuristic HMS API", 
    version="1.0.0",
    description="Next-Gen Hospital Management System Backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the auth router
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(staff.router, prefix="/api/v1/staff", tags=["Staff Management"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["Attendance"])
app.include_router(leave.router, prefix="/api/v1/leaves", tags=["Leave Management"])
app.include_router(payroll.router, prefix="/api/v1/payroll", tags=["Payroll System"])
app.include_router(notification.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports & Analytics"])
app.include_router(shift.router, prefix="/api/v1/shifts", tags=["Shift Scheduling"])

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "HMS API is online and futuristic 🚀", "status": "healthy"}