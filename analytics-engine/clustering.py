import sqlite3
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import os

def cluster_machines(db_path=None):
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    conn = sqlite3.connect(db_path)
    
    # We want to aggregate metrics per machine
    # Load energy readings
    df_energy = pd.read_sql_query(
        "SELECT machine_id, kwh, kw_demand, power_factor FROM energy_readings WHERE machine_id != 'Solar_PV_System'", 
        conn
    )
    
    # Load schedules
    df_sched = pd.read_sql_query("SELECT machine_id, start, end FROM machine_schedules", conn)
    df_sched["start"] = pd.to_datetime(df_sched["start"])
    df_sched["end"] = pd.to_datetime(df_sched["end"])
    
    # Load production logs
    df_prod = pd.read_sql_query("SELECT machine_id, timestamp, units_produced FROM production_logs", conn)
    df_prod["timestamp"] = pd.to_datetime(df_prod["timestamp"])
    
    conn.close()
    
    if df_energy.empty:
        return pd.DataFrame()
        
    # Aggregate basic features per machine
    machines = df_energy["machine_id"].unique()
    agg_rows = []
    
    for m in machines:
        m_energy = df_energy[df_energy["machine_id"] == m]
        
        # Load variability (std of kW demand)
        kw_std = m_energy["kw_demand"].std()
        kw_mean = m_energy["kw_demand"].mean()
        pf_mean = m_energy["power_factor"].mean()
        total_kwh = m_energy["kwh"].sum()
        
        # We need to approximate idle consumption percentage
        # Let's count how many times it was drawing less than its active threshold
        # In a real environment, we'd align with schedule. Let's do a simple heuristic for clustering:
        # Idle percentage is estimated by proportion of times kw_demand is low but non-zero
        idle_readings = m_energy[(m_energy["kw_demand"] > 0.5) & (m_energy["kw_demand"] < (m_energy["kw_demand"].max() * 0.4))]
        idle_kwh = idle_readings["kwh"].sum()
        idle_pct = (idle_kwh / total_kwh * 100) if total_kwh > 0 else 0.0
        
        agg_rows.append({
            "machine_id": m,
            "total_kwh": round(total_kwh, 2),
            "mean_kw": round(kw_mean, 2),
            "std_kw": round(kw_std, 2),
            "mean_pf": round(pf_mean, 3),
            "idle_pct": round(idle_pct, 2)
        })
        
    df_agg = pd.DataFrame(agg_rows)
    
    # 2. Apply KMeans Clustering
    features_to_cluster = ["std_kw", "mean_pf", "idle_pct"]
    X = df_agg[features_to_cluster].copy()
    
    # Fill any NaNs
    X = X.fillna(0.0)
    
    # Standardize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Cluster into 3 groups
    kmeans = KMeans(n_clusters=min(3, len(df_agg)), random_state=42, n_init=10)
    df_agg["cluster_id"] = kmeans.fit_predict(X_scaled)
    
    # Map cluster IDs to human-readable categories based on cluster averages
    # Highest idle_pct cluster -> "High-Waste Offenders"
    # Highest mean_pf & lowest idle_pct -> "Highly Efficient"
    # Others -> "Moderately Stable"
    cluster_means = df_agg.groupby("cluster_id")["idle_pct"].mean()
    sorted_clusters = cluster_means.sort_values(ascending=False).index.tolist()
    
    cluster_mapping = {}
    if len(sorted_clusters) >= 1:
        cluster_mapping[sorted_clusters[0]] = "High-Waste Offenders"
    if len(sorted_clusters) >= 2:
        cluster_mapping[sorted_clusters[-1]] = "Highly Efficient"
    if len(sorted_clusters) >= 3:
        cluster_mapping[sorted_clusters[1]] = "Moderately Stable"
        
    df_agg["category"] = df_agg["cluster_id"].map(cluster_mapping)
    
    return df_agg

if __name__ == "__main__":
    df_c = cluster_machines()
    if not df_c.empty:
        print(df_c)
