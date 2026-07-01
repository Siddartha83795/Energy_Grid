import sqlite3
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import os
from datetime import datetime, timedelta
from features import get_aligned_data

def train_and_forecast_idle_risk(db_path=None, forecast_hours=48):
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    df = get_aligned_data(db_path=db_path)
    if df.empty:
        return pd.DataFrame()
        
    # Feature engineering for training
    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek
    df["is_weekend"] = (df["dayofweek"] >= 5).astype(int)
    
    # Target: is the machine idle?
    # Fill target NaNs
    df["is_idle_target"] = df["is_idle"].astype(int)
    
    features = ["hour", "dayofweek", "is_weekend", "in_schedule", "order_backlog_hours"]
    
    # We will train a separate model per machine or a global model with machine ID as dummy.
    # A model per machine is cleaner and more accurate.
    forecasts = []
    
    max_history_time = df["timestamp"].max()
    forecast_timestamps = pd.date_range(
        start=max_history_time + timedelta(minutes=15),
        end=max_history_time + timedelta(hours=forecast_hours),
        freq="1h" # 1-hour intervals for forecast display
    )
    
    # Load schedules for the forecast period (if any) or generate them
    conn = sqlite3.connect(db_path)
    df_sched = pd.read_sql_query("SELECT machine_id, start, end, schedule_type FROM machine_schedules", conn)
    df_sched["start"] = pd.to_datetime(df_sched["start"])
    df_sched["end"] = pd.to_datetime(df_sched["end"])
    conn.close()
    
    # Get current backlog to carry forward
    latest_backlog = df.groupby("machine_id")["order_backlog_hours"].last().to_dict()
    
    for m in df["machine_id"].unique():
        m_df = df[df["machine_id"] == m].dropna(subset=["is_idle_target"])
        if len(m_df) < 50: # not enough data to train
            continue
            
        X = m_df[features].copy()
        X["in_schedule"] = X["in_schedule"].astype(int)
        y = m_df["is_idle_target"]
        
        clf = RandomForestClassifier(n_estimators=30, max_depth=5, random_state=42)
        clf.fit(X, y)
        
        # Build forecast features
        m_sched = df_sched[df_sched["machine_id"] == m]
        m_latest_backlog = latest_backlog.get(m, 48.0)
        
        forecast_rows = []
        for ts in forecast_timestamps:
            # Check schedule at ts
            in_sched = False
            for _, s in m_sched.iterrows():
                if s["start"] <= ts <= s["end"]:
                    in_sched = True
                    break
                    
            dayofweek = ts.dayofweek
            is_weekend = 1 if dayofweek >= 5 else 0
            
            # Simple decay of backlog hours over the 48h forecast
            hours_ahead = (ts - max_history_time).total_seconds() / 3600.0
            decayed_backlog = max(0.0, m_latest_backlog - (hours_ahead / 10.0))
            
            forecast_rows.append({
                "machine_id": m,
                "timestamp": ts,
                "hour": ts.hour,
                "dayofweek": dayofweek,
                "is_weekend": is_weekend,
                "in_schedule": int(in_sched),
                "order_backlog_hours": decayed_backlog
            })
            
        df_forecast = pd.DataFrame(forecast_rows)
        if not df_forecast.empty:
            X_fc = df_forecast[features]
            # Predict probability of being idle
            probs = clf.predict_proba(X_fc)
            # Probability of class 1 (idle)
            # Handle case where classifier only saw one class
            if probs.shape[1] > 1:
                df_forecast["idle_probability"] = probs[:, 1]
            else:
                df_forecast["idle_probability"] = float(clf.classes_[0])
                
            # Classify risk rating
            # High risk if high idle probability and NOT in schedule (waste risk) or during shift gaps
            def get_risk(row):
                prob = row["idle_probability"]
                in_s = row["in_schedule"]
                
                # outside schedule is pure waste risk if it's left on
                if not in_s:
                    if prob > 0.7:
                        return "High"
                    elif prob > 0.4:
                        return "Medium"
                else:
                    # inside schedule, waste risk is low but can be medium during shift changeovers
                    if prob > 0.6:
                        return "Medium"
                return "Low"
                
            df_forecast["risk_rating"] = df_forecast.apply(get_risk, axis=1)
            forecasts.append(df_forecast)
            
    if forecasts:
        return pd.concat(forecasts, ignore_index=True)
    return pd.DataFrame()

if __name__ == "__main__":
    df_fc = train_and_forecast_idle_risk()
    if not df_fc.empty:
        print("Forecast sample:")
        print(df_fc[["machine_id", "timestamp", "in_schedule", "idle_probability", "risk_rating"]].head(10))
