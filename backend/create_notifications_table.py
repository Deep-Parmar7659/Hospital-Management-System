import asyncio
import os
import sys
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# ✅ FIX FOR WINDOWS: Use SelectorEventLoop instead of ProactorEventLoop
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# 1. Load environment variables from your .env file
load_dotenv()

# 2. Get the actual DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in your .env file!")
    print("Please make sure your .env file has the correct Render database URL.")
    exit(1)

async def create_notifications_table():
    print("🔄 Connecting to database...")
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    try:
        async with engine.connect() as conn:
            # 3. Create the table if it doesn't exist
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            await conn.commit()
            print("✅ Notifications table created successfully!")
    except Exception as e:
        print(f"❌ Error creating table: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_notifications_table())