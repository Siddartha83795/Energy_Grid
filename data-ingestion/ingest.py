import sqlite3
import pandas as pd
import os
import yaml
from pathlib import Path

def get_db_connection(db_path="energy_advisor.db"):
    return sqlite3.connect(db_path)

def initialize_database(db_path="energy_advisor.db"):
    print(f"Initializing database at: {db_path}")
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    
    # 1. Create energy_readings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS energy_readings (
        machine_id TEXT,
        timestamp TEXT,
        kwh REAL,
        kw_demand REAL,
        power_factor REAL,
        PRIMARY KEY (machine_id, timestamp)
    )
    """)
    
    # 2. Create shifts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shifts (
        shift_name TEXT,
        date TEXT,
        start_time TEXT,
        end_time TEXT,
        line_id TEXT,
        headcount INTEGER
    )
    """)
    
    # 3. Create machine_schedules table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS machine_schedules (
        machine_id TEXT,
        start TEXT,
        end TEXT,
        schedule_type TEXT
    )
    """)
    
    # 4. Create production_logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS production_logs (
        machine_id TEXT,
        timestamp TEXT,
        units_produced INTEGER,
        cycle_time_min REAL,
        utilization_pct REAL,
        order_backlog_hours INTEGER,
        PRIMARY KEY (machine_id, timestamp)
    )
    """)
    
    # 5. Create sensor_readings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        machine_id TEXT,
        timestamp TEXT,
        temperature REAL,
        acoustic_vibration REAL,
        PRIMARY KEY (machine_id, timestamp)
    )
    """)
    
    # 6. Create action_log table for Agentic Actions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS action_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        machine_id TEXT,
        agent TEXT,
        action_type TEXT,
        description TEXT,
        impact_kwh REAL,
        impact_cost_inr REAL,
        status TEXT,  -- 'pending_approval', 'approved', 'rejected', 'executed'
        approved_by TEXT,
        notes TEXT
    )
    """)
    
    # 7. Create model_feedback table for tracking recommendation adoptions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS model_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        recommendation_id TEXT,
        machine_id TEXT,
        status TEXT, -- 'Accepted', 'Rejected', 'Implemented'
        feedback TEXT
    )
    """)
    
    conn.commit()
    conn.close()
    print("Database schema initialized successfully.")

def populate_database(raw_dir="data-ingestion/raw", db_path="energy_advisor.db"):
    conn = get_db_connection(db_path)
    
    csv_tables = {
        "energy_readings": "energy_readings.csv",
        "shifts": "shifts.csv",
        "machine_schedules": "machine_schedules.csv",
        "production_logs": "production_logs.csv",
        "sensor_readings": "sensor_readings.csv"
    }
    
    for table_name, csv_file in csv_tables.items():
        csv_path = Path(raw_dir) / csv_file
        if csv_path.exists():
            print(f"Loading {csv_file} into {table_name} table...")
            df = pd.read_csv(csv_path)
            
            # Use 'replace' to avoid duplicate key issues on seeding
            df.to_sql(table_name, conn, if_exists="replace", index=False)
            print(f"Loaded {len(df)} rows into {table_name}.")
        else:
            print(f"Warning: {csv_file} not found in {raw_dir}")
            
    conn.commit()
    conn.close()
    print("Database seeding complete.")

if __name__ == "__main__":
    db_file = os.environ.get("DB_PATH", "energy_advisor.db")
    initialize_database(db_file)
    populate_database(db_path=db_file)
