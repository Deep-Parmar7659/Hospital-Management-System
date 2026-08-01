import asyncio
from sqlalchemy import text
from app.database import engine

async def add_is_active_column():
    async with engine.begin() as conn:
        await conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
        """))
        print("✅ Added is_active column to users table")

if __name__ == "__main__":
    asyncio.run(add_is_active_column())