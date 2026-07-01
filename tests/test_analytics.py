import unittest
import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path

# Add directories to path
sys.path.append(str(Path(__file__).resolve().parents[1]))
sys.path.append(str(Path(__file__).resolve().parents[1] / "analytics-engine"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "data-ingestion"))

from features import calculate_dynamic_baselines
from anomalies import detect_anomalies
from forecasting import train_and_forecast_idle_risk

class TestAnalyticsEngine(unittest.TestCase):
    
    def setUp(self):
        # Setup a small mock dataframe representing 10 days of readings for a machine
        self.db_path = "energy_advisor.db"
        
    def test_dynamic_baselines_calculation(self):
        # Create a mock dataframe
        timestamps = pd.date_range(start="2026-06-01", periods=150, freq="15min")
        df = pd.DataFrame({
            "machine_id": ["Test_CNC"] * 150,
            "timestamp": timestamps,
            "kw_demand": [4.0 + np.random.normal(0, 0.1) for _ in range(150)],
            "is_idle": [True] * 150,
            "kwh": [1.0] * 150,
            "power_factor": [0.8] * 150
        })
        
        # Override the thresholds config or rely on fallback parameters
        df_out = calculate_dynamic_baselines(df)
        self.assertIn("dynamic_idle_threshold_kw", df_out.columns)
        
        # Mean is ~4.0, threshold should be greater than mean (mean + 2*std)
        self.assertTrue(df_out["dynamic_idle_threshold_kw"].iloc[-1] > 4.0)

    def test_anomaly_detection_runs(self):
        if os.path.exists(self.db_path):
            df_anoms = detect_anomalies(db_path=self.db_path)
            self.assertFalse(df_anoms.empty)
            self.assertIn("is_local_anomaly", df_anoms.columns)
            self.assertIn("anomaly_category", df_anoms.columns)
            self.assertIn("anomaly_confidence", df_anoms.columns)
            
    def test_forecasting_runs(self):
        if os.path.exists(self.db_path):
            df_fc = train_and_forecast_idle_risk(db_path=self.db_path, forecast_hours=12)
            self.assertFalse(df_fc.empty)
            self.assertIn("idle_probability", df_fc.columns)
            self.assertIn("risk_rating", df_fc.columns)

if __name__ == "__main__":
    unittest.main()
