import os
from sqlalchemy import create_engine, text

# 1. Paste your Railway URL here! 
# (Make sure it starts with mysql+pymysql:// and ends with /railway)
RAILWAY_URL = "mysql+pymysql://root:phdFUhTDbMeCXFARJJdFzRXvbpTpNHHb@tramway.proxy.rlwy.net:34990/railway"
def deploy_schema():
    print("🚀 Connecting to Railway Cloud Database...")
    engine = create_engine(RAILWAY_URL)
    
    try:
        with engine.connect() as conn:
            # Read your schema file
            with open('schema.sql', 'r') as file:
                sql_script = file.read()
            
            # Split the script by semicolon and execute each block
            statements = sql_script.split(';')
            
            print(f"📦 Found {len(statements)} SQL commands. Injecting now...")
            for statement in statements:
                if statement.strip():
                    # We skip the "CREATE DATABASE" and "USE" commands because 
                    # Railway already creates the 'railway' database for us.
                    if "CREATE DATABASE" in statement or "USE " in statement:
                        continue
                        
                    conn.execute(text(statement))
            
            conn.commit()
            print("✅ SUCCESS: Tri-Pillar Schema and Dummy Data injected into production!")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    deploy_schema()