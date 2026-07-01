import os
import yaml
import sqlite3
import pandas as pd
import numpy as np
from pathlib import Path

def load_emission_config():
    config_path = Path("config/emission_factors.yaml")
    if config_path.exists():
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
    return {
        "emission_factors": {
            "grid_intensity_kg_co2_per_kwh": 0.82,
            "solar_intensity_kg_co2_per_kwh": 0.05
        }
    }

def load_tariff_config():
    config_path = Path("config/tariff.yaml")
    if config_path.exists():
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
    return {}

def optimize_tariffs_and_renewables(db_path=None):
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    emissions_cfg = load_emission_config()
    grid_intensity = emissions_cfg["emission_factors"]["grid_intensity_kg_co2_per_kwh"]
    solar_intensity = emissions_cfg["emission_factors"]["solar_intensity_kg_co2_per_kwh"]
    
    tariff_cfg = load_tariff_config()
    tariffs = tariff_cfg.get("tariffs", {})
    solar_hours = tariff_cfg.get("solar", {}).get("optimal_hours", [10, 11, 12, 13, 14, 15])
    
    conn = sqlite3.connect(db_path)
    df_energy = pd.read_sql_query(
        "SELECT machine_id, timestamp, kwh, kw_demand FROM energy_readings WHERE machine_id != 'Solar_PV_System'",
        conn
    )
    df_energy["timestamp"] = pd.to_datetime(df_energy["timestamp"])
    
    # Load solar generation curve
    df_solar = pd.read_sql_query(
        "SELECT timestamp, kw_demand as solar_kw FROM energy_readings WHERE machine_id = 'Solar_PV_System'",
        conn
    )
    df_solar["timestamp"] = pd.to_datetime(df_solar["timestamp"])
    conn.close()
    
    if df_energy.empty:
        return []
        
    df_merged = pd.merge(df_energy, df_solar, on="timestamp", how="left").fillna(0.0)
    df_merged["hour"] = df_merged["timestamp"].dt.hour
    
    # Let's find optimization opportunities per machine
    # We look for heavy loads running during Peak Tariff hours that could be shifted to Solar Peak or Night.
    suggestions = []
    
    # CNC Mill 1 and Injection Molder 2 are heavy machines
    heavy_machines = ["Injection_Molder_2", "CNC_Mill_1", "Thermoformer_2"]
    
    for m in heavy_machines:
        m_data = df_merged[df_merged["machine_id"] == m]
        if m_data.empty:
            continue
            
        # 1. Solar shift opportunity:
        # Check energy consumed in peak hours (9 AM - 6 PM) that is NOT in the optimal solar window (10 AM - 3 PM)
        # and has low solar generation available.
        # Or look at Shift C (night) consumption that could be shifted to solar day window.
        # Let's count consumption in Peak hours (rate = 10)
        peak_rate_data = m_data[m_data["hour"].isin(tariffs.get("peak", {}).get("hours", []))]
        peak_kwh = peak_rate_data["kwh"].sum()
        
        # If we shift 15% of peak-hour consumption to solar peak hours (10 AM - 3 PM)
        shift_pct = 0.15
        potential_shift_kwh = peak_kwh * shift_pct
        
        # Calculate tariff savings: Peak rate (10.0) vs Off-peak rate (6.5) or offset by Solar (effectively 0 grid cost)
        # Solar offset savings: potential_shift_kwh * Peak rate
        cost_savings_inr = potential_shift_kwh * (tariffs.get("peak", {}).get("rate", 10.0) - tariffs.get("off_peak", {}).get("rate", 6.5))
        
        # Calculate carbon savings: potential_shift_kwh * (Grid Intensity - Solar Intensity)
        co2_savings_kg = potential_shift_kwh * (grid_intensity - solar_intensity)
        
        suggestions.append({
            "machine_id": m,
            "opportunity_type": "Renewable Shift",
            "description": f"Shift 15% of {m} operations to peak solar hours ({min(solar_hours)}:00 - {max(solar_hours)}:00).",
            "kwh_shifted_weekly": round(potential_shift_kwh / 4.0, 2), # weekly average from 30 days
            "cost_savings_inr_weekly": round(cost_savings_inr / 4.0, 2),
            "co2_savings_kg_weekly": round(co2_savings_kg / 4.0, 2),
            "implementation_difficulty": "Medium",
            "owner": "Production Planner"
        })
        
        # 2. Night tariff shift opportunity:
        # Shift heavy cleaning or high-load warmups from peak hours to night hours (11 PM - 6 AM)
        potential_night_shift_kwh = peak_kwh * 0.10 # 10% shift
        night_cost_savings = potential_night_shift_kwh * (tariffs.get("peak", {}).get("rate", 10.0) - tariffs.get("night", {}).get("rate", 4.0))
        # No carbon savings since it's still grid-based night power, but cost saving is high!
        
        suggestions.append({
            "machine_id": m,
            "opportunity_type": "Tariff Optimization",
            "description": f"Move scheduled maintenance warmups and test cycles of {m} to Night Tariff band (23:00 - 06:00).",
            "kwh_shifted_weekly": round(potential_night_shift_kwh / 4.0, 2),
            "cost_savings_inr_weekly": round(night_cost_savings / 4.0, 2),
            "co2_savings_kg_weekly": 0.0,
            "implementation_difficulty": "Low",
            "owner": "Operator"
        })
        
    return suggestions

if __name__ == "__main__":
    suggs = optimize_tariffs_and_renewables()
    for s in suggs:
        print(s)
