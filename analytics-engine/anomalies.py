import sqlite3
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import os
import yaml
from pathlib import Path
from features import get_aligned_data, calculate_dynamic_baselines

def load_sensor_readings(machine_id=None, db_path=None):
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    conn = sqlite3.connect(db_path)
    query = "SELECT machine_id, timestamp, temperature, acoustic_vibration FROM sensor_readings"
    if machine_id:
        query += f" WHERE machine_id = '{machine_id}'"
    df_sensor = pd.read_sql_query(query, conn)
    df_sensor["timestamp"] = pd.to_datetime(df_sensor["timestamp"])
    conn.close()
    return df_sensor

def detect_anomalies(db_path=None):
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    # 1. Load aligned features
    df = get_aligned_data(db_path=db_path)
    if df.empty:
        return pd.DataFrame()
        
    # Calculate rolling dynamic baselines
    df = calculate_dynamic_baselines(df, db_path=db_path)
    
    # 2. Merge multi-modal sensor readings
    df_sensor = load_sensor_readings(db_path=db_path)
    if not df_sensor.empty:
        df = pd.merge(df, df_sensor, on=["machine_id", "timestamp"], how="left")
    else:
        df["temperature"] = 22.0
        df["acoustic_vibration"] = 25.0
        
    # Fill missing sensor values with safe defaults
    df["temperature"] = df["temperature"].fillna(22.0)
    df["acoustic_vibration"] = df["acoustic_vibration"].fillna(25.0)
    
    # 3. Isolation Forest for global anomaly detection (unsupervised)
    # Fit on active/idle features (kw_demand, power_factor, temperature, acoustic_vibration)
    features_to_fit = ["kw_demand", "power_factor", "temperature", "acoustic_vibration"]
    iso = IsolationForest(contamination=0.03, random_state=42)
    
    # We fit only on valid data (no NaNs)
    df_clean = df.dropna(subset=features_to_fit)
    if not df_clean.empty:
        # returns 1 for inliers, -1 for outliers
        preds = iso.fit_predict(df_clean[features_to_fit])
        df.loc[df_clean.index, "is_global_anomaly"] = (preds == -1).astype(int)
    else:
        df["is_global_anomaly"] = 0
        
    # 4. Local machine-level anomaly detection:
    # A local anomaly is flagged when the machine is idle and its actual kw_demand exceeds its dynamic idle threshold
    df["is_local_anomaly"] = (df["is_idle"]) & (df["kw_demand"] > df["dynamic_idle_threshold_kw"])
    
    # 5. Multi-Modal Signal Fusion Cross-Validation Heuristics:
    # Categorize local anomalies into:
    # - "true_idle_waste": High power draw, low temperature, low acoustic/vibration.
    # - "stuck_auxiliary": High power draw, low temperature, but high/moderate acoustic/vibration.
    # - "unscheduled_running": High power draw, high temperature, high vibration (misclassified idle, actually running).
    df["anomaly_category"] = "none"
    df["anomaly_confidence"] = 0.0
    
    # Baseline checks
    for idx, row in df.iterrows():
        if row["is_local_anomaly"]:
            temp = row["temperature"]
            vib = row["acoustic_vibration"]
            kw = row["kw_demand"]
            thresh = row["dynamic_idle_threshold_kw"]
            
            # Calculate standard Z-score of deviation
            deviation = kw - thresh
            z_score = deviation / max(1.0, thresh) # normalized deviation
            
            # Multi-modal fusion
            if vib < 35.0:
                # Cold and quiet but drawing power -> true idle waste (left ON but not operating)
                df.at[idx, "anomaly_category"] = "true_idle_waste"
                df.at[idx, "anomaly_confidence"] = min(0.95, 0.70 + 0.05 * z_score)
            elif vib >= 50.0 and temp < 30.0:
                # Cold but vibrating -> stuck-on auxiliary equipment (e.g. cooling pump)
                df.at[idx, "anomaly_category"] = "stuck_auxiliary"
                df.at[idx, "anomaly_confidence"] = min(0.90, 0.65 + 0.05 * z_score)
            elif vib >= 50.0 and temp >= 40.0:
                # Hot and vibrating -> machine is actually operating! (unscheduled production)
                df.at[idx, "anomaly_category"] = "unscheduled_running"
                df.at[idx, "anomaly_confidence"] = min(0.85, 0.60 + 0.05 * z_score)
            else:
                # Indeterminate or borderline
                df.at[idx, "anomaly_category"] = "true_idle_waste"
                df.at[idx, "anomaly_confidence"] = min(0.80, 0.50 + 0.05 * z_score)
                
    return df

if __name__ == "__main__":
    df_anom = detect_anomalies()
    if not df_anom.empty:
        anom_subset = df_anom[df_anom["is_local_anomaly"] == True]
        print(f"Detected {len(anom_subset)} local anomalies.")
        print(anom_subset[["machine_id", "timestamp", "kw_demand", "dynamic_idle_threshold_kw", "temperature", "acoustic_vibration", "anomaly_category", "anomaly_confidence"]].head(10))
