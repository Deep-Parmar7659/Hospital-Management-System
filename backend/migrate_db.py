"""
This script adds the is_active column to the users table.
Run this ONCE to fix the database schema.
"""
import asyncio
from sqlalchemy import text, create_engine
from sqlalchemy.orm import Session

# Replace this with your actual DATABASE_URL from Render
DATABASE_URL = "postgresql://hmsuser:iJZ3I12mbF1WHT8U4PanrPnXHIqAqmeh@dpg-d9m5grflk1mc739q3mgg-a.oregon-postgres.render.com/neondb_t71t"

def add_is_active_column(): 
    print("🔧 Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            print("✅ Connected! Adding is_active column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
            """))
            conn.commit()
            print("✅ SUCCESS! Column 'is_active' added to users table")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        engine.dispose()

if __name__ == "__main__":
    add_is_active_column()