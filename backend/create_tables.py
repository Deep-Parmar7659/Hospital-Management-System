import asyncio
import sys
import selectors

# 🔧 FIX FOR WINDOWS: Force SelectorEventLoop for async database drivers
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.database import engine, Base
from app.models import user, staff, attendance, leave, payroll, notification, shift

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(create_tables())
    print("✅ All tables created successfully!")