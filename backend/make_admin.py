"""
This script updates your specific user account to have the 'admin' role.
"""
from sqlalchemy import text, create_engine
import os

DATABASE_URL = "postgresql://hmsuser:iJZ3I12mbF1WHT8U4PanrPnXHIqAqmeh@dpg-d9m5grflk1mc739q3mgg-a.oregon-postgres.render.com/neondb_t71t" 

def make_user_admin():
    print("🔧 Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            user_email = "parmardeep7659@gmail.com" 
            
            print(f"✅ Connected! Updating role for {user_email} to 'admin'...")
            result = conn.execute(text("""
                UPDATE users 
                SET role = 'admin' 
                WHERE email = :email
            """), {"email": user_email})
            
            conn.commit()
            
            if result.rowcount > 0:
                print(f"🎉 SUCCESS! {user_email} is now an Admin!")
            else:
                print(f"⚠️ No user found with email: {user_email}. Check the email address.")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        engine.dispose()

if __name__ == "__main__":
    make_user_admin()