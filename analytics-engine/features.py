import sqlite3
import pandas as pd
import numpy as np
import os
import yaml
from pathlib import Path

def get_db_path():
    return os.environ.get("DB_PATH", "energy_advisor.db")

def load_config():
    config_path = Path("config/thresholds.yaml")
    if config_path.exists():
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
    return {
        "thresholds": {
            "base_idle_limit_kw": 5.0,
            "rolling_baseline": {
                "window_days": 14,
                "min_readings": 100,
                "std_dev_multiplier": 2.0
            }
        }
    }

def load_tariff_config():
    config_path = Path("config/tariff.yaml")
    if config_path.exists():
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
    return {}

def get_aligned_data(machine_id=None, db_path=None):
    if db_path is None:
        db_path = get_db_path()
        
    conn = sqlite3.connect(db_path)
    
    # Load energy readings
    query = "SELECT machine_id, timestamp, kwh, kw_demand, power_factor FROM energy_readings"
    if machine_id:
        query += f" WHERE machine_id = '{machine_id}'"
    df_energy = pd.read_sql_query(query, conn)
    df_energy["timestamp"] = pd.to_datetime(df_energy["timestamp"])
    
    # Load schedules
    sched_query = "SELECT machine_id, start, end, schedule_type FROM machine_schedules"
    if machine_id:
        sched_query += f" WHERE machine_id = '{machine_id}'"
    df_sched = pd.read_sql_query(sched_query, conn)
    df_sched["start"] = pd.to_datetime(df_sched["start"])
    df_sched["end"] = pd.to_datetime(df_sched["end"])
    
    # Load production logs
    prod_query = "SELECT machine_id, timestamp, units_produced, cycle_time_min, utilization_pct, order_backlog_hours FROM production_logs"
    if machine_id:
        prod_query += f" WHERE machine_id = '{machine_id}'"
    df_prod = pd.read_sql_query(prod_query, conn)
    df_prod["timestamp"] = pd.to_datetime(df_prod["timestamp"])
    
    conn.close()
    
    if df_energy.empty:
        return pd.DataFrame()
        
    # Exclude solar PV system from machine-level analytics
    df_energy = df_energy[df_energy["machine_id"] != "Solar_PV_System"]
    
    # Match schedule: check if each reading falls inside a scheduled production window
    # To do this efficiently, we can use interval mapping or a simple loop since it's a prototype
    df_energy["in_schedule"] = False
    df_energy["schedule_type"] = "shutdown"
    
    for m in df_energy["machine_id"].unique():
        m_idx = df_energy["machine_id"] == m
        m_sched = df_sched[df_sched["machine_id"] == m]
        
        if m_sched.empty:
            continue
            
        m_readings = df_energy[m_idx]
        in_sched_mask = np.zeros(len(m_readings), dtype=bool)
        sched_types = ["shutdown"] * len(m_readings)
        
        # Check intervals
        for _, s in m_sched.iterrows():
            mask = (m_readings["timestamp"] >= s["start"]) & (m_readings["timestamp"] <= s["end"])
            in_sched_mask = in_sched_mask | mask.values
            for idx, is_in in enumerate(mask):
                if is_in:
                    sched_types[idx] = s["schedule_type"]
                    
        df_energy.loc[m_idx, "in_schedule"] = in_sched_mask
        df_energy.loc[m_idx, "schedule_type"] = sched_types
        
    # Align hourly production logs by merging on machine_id and time (nearest or hourly floor)
    # Since production is hourly and energy is 15-min, let's round timestamp to hour for merge
    df_energy["hour_ts"] = df_energy["timestamp"].dt.floor("h")
    df_prod["hour_ts"] = df_prod["timestamp"].dt.floor("h")
    
    # Drop timestamp from production to avoid collision, keep machine_id and hour_ts
    df_prod_merge = df_prod.drop(columns=["timestamp"]).drop_duplicates(subset=["machine_id", "hour_ts"])
    
    df_merged = pd.merge(df_energy, df_prod_merge, on=["machine_id", "hour_ts"], how="left")
    df_merged["units_produced"] = df_merged["units_produced"].fillna(0)
    df_merged["utilization_pct"] = df_merged["utilization_pct"].fillna(0)
    df_merged["cycle_time_min"] = df_merged["cycle_time_min"].fillna(0.0)
    df_merged["order_backlog_hours"] = df_merged["order_backlog_hours"].ffill().fillna(0)
    
    # Clean up temp column
    df_merged = df_merged.drop(columns=["hour_ts"])
    
    # Calculate Cost-weighted Consumption
    tariff_cfg = load_tariff_config()
    tariffs = tariff_cfg.get("tariffs", {})
    
    # Function to get tariff rate for a given timestamp
    def get_rate(ts):
        hour = ts.hour
        if hour in tariffs.get("peak", {}).get("hours", []):
            return tariffs["peak"]["rate"]
        elif hour in tariffs.get("off_peak", {}).get("hours", []):
            return tariffs["off_peak"]["rate"]
        else:
            return tariffs.get("night", {}).get("rate", 4.0)
            
    df_merged["tariff_rate"] = df_merged["timestamp"].apply(get_rate)
    df_merged["cost_inr"] = df_merged["kwh"] * df_merged["tariff_rate"]
    
    # Classify Idle vs Active states:
    # A machine is classified as "idle" if it is drawing power (kw_demand > 0.5)
    # AND (either we are outside the planned schedule, OR we are inside schedule but units_produced == 0 or utilization is 0,
    # OR it's a known waste pattern). Let's use a simpler heuristic first:
    # kw_demand > 0.5 and (not in_schedule OR units_produced == 0)
    df_merged["is_idle"] = (df_merged["kw_demand"] > 0.5) & ((~df_merged["in_schedule"]) | (df_merged["units_produced"] == 0))
    
    return df_merged

def calculate_dynamic_baselines(df, db_path=None):
    """
    Computes per-machine dynamic baselines over a rolling window.
    Dynamic threshold = rolling mean of idle kw_demand + N * std_dev.
    """
    config = load_config()
    rb_cfg = config["thresholds"]["rolling_baseline"]
    window_days = rb_cfg["window_days"]
    min_readings = rb_cfg["min_readings"]
    std_mult = rb_cfg["std_dev_multiplier"]
    base_idle_limit = config["thresholds"]["base_idle_limit_kw"]
    
    # Group by machine
    df = df.sort_values(by=["machine_id", "timestamp"])
    df["dynamic_idle_threshold_kw"] = base_idle_limit
    
    for m in df["machine_id"].unique():
        m_idx = df["machine_id"] == m
        m_df = df[m_idx].copy()
        
        # We compute rolling statistics over kw_demand when the machine is classified as idle
        # To make it rolling, we can use pandas rolling on the datetime index.
        # Let's set index to timestamp for rolling window
        m_df = m_df.set_index("timestamp")
        
        # Filter for times when the machine is actually idle to establish the idle baseline
        idle_kw = m_df.loc[m_df["is_idle"], "kw_demand"]
        
        if len(idle_kw) >= min_readings:
            # Calculate rolling mean and std over the window (e.g. 14 days)
            rolling_mean = idle_kw.rolling(f"{window_days}D", min_periods=min_readings).mean()
            rolling_std = idle_kw.rolling(f"{window_days}D", min_periods=min_readings).std()
            
            # Combine back to full machine index
            m_df["idle_mean"] = rolling_mean
            m_df["idle_std"] = rolling_std
            m_df["idle_mean"] = m_df["idle_mean"].ffill().bfill()
            m_df["idle_std"] = m_df["idle_std"].ffill().bfill().fillna(0.0)
            
            m_df["dynamic_idle_threshold_kw"] = m_df["idle_mean"] + std_mult * m_df["idle_std"]
        else:
            # Fallback to static baseline if not enough readings
            m_df["dynamic_idle_threshold_kw"] = base_idle_limit
            
        df.loc[m_idx, "dynamic_idle_threshold_kw"] = m_df["dynamic_idle_threshold_kw"].values
        
    return df

if __name__ == "__main__":
    df = get_aligned_data()
    if not df.empty:
        df = calculate_dynamic_baselines(df)
        print(f"Aliged data count: {len(df)}")
        print(df[["machine_id", "timestamp", "kw_demand", "is_idle", "dynamic_idle_threshold_kw"]].head())
