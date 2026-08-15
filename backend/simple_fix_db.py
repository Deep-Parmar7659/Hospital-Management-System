import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
db_url = os.getenv("DATABASE_URL")

if not db_url:
    print("❌ Error: DATABASE_URL not found in .env file")
    exit()

# ✅ FIX: Clean the URL for psycopg2 by removing SQLAlchemy prefixes
clean_db_url = db_url.replace("postgresql+psycopg://", "postgresql://").replace("postgresql+asyncpg://", "postgresql://")

print("🔄 Connecting to database...")

try:
    # Connect using the cleaned URL
    conn = psycopg2.connect(clean_db_url)
    cursor = conn.cursor()

    print("🗑️ Dropping old 'notifications' table...")
    cursor.execute("DROP TABLE IF EXISTS notifications CASCADE")
    
    print("📝 Creating new 'notifications' table...")
    cursor.execute("""
        CREATE TABLE notifications (
            id SERIAL PRIMARY KEY,
            staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    print("✅ SUCCESS! Database table fixed.")
    print("✅ You can now request leaves without errors!")

except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()