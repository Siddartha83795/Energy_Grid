import os
import sys
import pandas as pd
from pathlib import Path

# Add parent and neighbor directories to sys.path so we can import modules
sys.path.append(str(Path(__file__).resolve().parents[1]))
sys.path.append(str(Path(__file__).resolve().parents[1] / "analytics-engine"))

from anomalies import detect_anomalies

def run_detection_agent(db_path=None):
    """
    Detection Agent: continuously runs anomaly detection over the database
    and flags any significant anomalies that exceed the dynamic thresholds.
    """
    print("Detection Agent: Scanning energy readings and sensor data...")
    df_anom = detect_anomalies(db_path=db_path)
    
    if df_anom.empty:
        print("Detection Agent: No data available to analyze.")
        return []
        
    # We only care about active anomalies
    # Filter for rows where is_local_anomaly is true
    active_anoms = df_anom[df_anom["is_local_anomaly"] == True]
    
    if active_anoms.empty:
        print("Detection Agent: No active energy anomalies detected.")
        return []
        
    # Group consecutive anomalies to represent 'events' rather than 15-minute rows
    # Let's sort by machine and timestamp
    active_anoms = active_anoms.sort_values(by=["machine_id", "timestamp"])
    
    events = []
    # Simple grouping of consecutive readings (difference <= 1 hour)
    for m in active_anoms["machine_id"].unique():
        m_anoms = active_anoms[active_anoms["machine_id"] == m].copy()
        m_anoms["timestamp_dt"] = pd.to_datetime(m_anoms["timestamp"])
        
        # Group by checking if difference between consecutive rows is > 1 hour
        m_anoms["group"] = (m_anoms["timestamp_dt"].diff() > pd.Timedelta(hours=1)).cumsum()
        
        for g_id, g_df in m_anoms.groupby("group"):
            start_time = g_df["timestamp"].min().strftime("%Y-%m-%d %H:%M:%S")
            end_time = g_df["timestamp"].max().strftime("%Y-%m-%d %H:%M:%S")
            duration_hours = (g_df["timestamp_dt"].max() - g_df["timestamp_dt"].min()).total_seconds() / 3600.0
            duration_hours = max(0.25, duration_hours) # min 15 mins
            
            mean_kw = g_df["kw_demand"].mean()
            thresh = g_df["dynamic_idle_threshold_kw"].mean()
            total_kwh_waste = g_df["kwh"].sum()
            avg_temp = g_df["temperature"].mean()
            avg_vib = g_df["acoustic_vibration"].mean()
            
            # Most common category in the group
            category = g_df["anomaly_category"].mode().iloc[0] if not g_df["anomaly_category"].empty else "true_idle_waste"
            confidence = g_df["anomaly_confidence"].max()
            
            # Get latest rate/cost
            cost_savings_inr = g_df["cost_inr"].sum()
            
            events.append({
                "machine_id": m,
                "start_time": start_time,
                "end_time": end_time,
                "duration_hours": round(duration_hours, 2),
                "avg_kw_demand": round(mean_kw, 2),
                "threshold_kw": round(thresh, 2),
                "kwh_wasted": round(total_kwh_waste, 2),
                "cost_wasted_inr": round(cost_savings_inr, 2),
                "avg_temperature": round(avg_temp, 2),
                "avg_vibration": round(avg_vib, 2),
                "category": category,
                "confidence": round(confidence, 2)
            })
            
    print(f"Detection Agent: Completed. Identified {len(events)} anomaly events.")
    return events

if __name__ == "__main__":
    events = run_detection_agent()
    for e in events[:5]:
        print(e)
