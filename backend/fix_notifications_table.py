import asyncio
import os
import sys
from dotenv import load_dotenv # type: ignore
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Fix for Windows
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def fix_notifications_table():
    print("🔄 Connecting to database...")
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    try:
        async with engine.connect() as conn:
            # 1. DROP the old table (if it exists)
            print("🗑️ Dropping old notifications table...")
            await conn.execute(text("DROP TABLE IF EXISTS notifications CASCADE"))
            await conn.commit()
            
            # 2. CREATE the new table with correct structure
            print("📝 Creating new notifications table...")
            await conn.execute(text("""
                CREATE TABLE notifications (
                    id SERIAL PRIMARY KEY,
                    staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            await conn.commit()
            
            print("✅ Notifications table fixed successfully!")
            print("✅ You can now request leaves!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_notifications_table())