import unittest
import os
import sys
import sqlite3
from pathlib import Path

# Add directories to path
sys.path.append(str(Path(__file__).resolve().parents[1]))
sys.path.append(str(Path(__file__).resolve().parents[1] / "agents"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "genai"))

from action_agent import run_action_agent, execute_pending_action
from schemas import Recommendation

class TestActionAgentApprovalGuardrails(unittest.TestCase):
    
    def setUp(self):
        self.db_path = "test_energy_advisor.db"
        # Create a fresh temporary test DB schema
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
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
            status TEXT,
            approved_by TEXT,
            notes TEXT
        )
        """)
        conn.commit()
        conn.close()
        
    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)
            
    def test_low_risk_auto_execution(self):
        rec = Recommendation(
            machine_name="Pick_Place_1",
            opportunity_type="Standby Shutdown",
            issue="Idle draw during shift changeover",
            action="Power down main camera auxiliary loops",
            estimated_weekly_savings_kwh=10.0,
            estimated_weekly_savings_inr=65.0, # Below threshold of 500
            estimated_weekly_savings_co2_kg=8.2,
            implementation_difficulty="Low",
            owner="Operator",
            confidence=0.9,
            evidence=["Power draw exceeds 1kW"],
            operator_action_step_by_step="Power down switch",
            management_impact_narrative="Saves money."
        )
        
        result = run_action_agent(rec, db_path=self.db_path)
        self.assertEqual(result["status"], "executed")
        
        # Verify db log
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT status, approved_by FROM action_log WHERE machine_id='Pick_Place_1'")
        row = cursor.fetchone()
        conn.close()
        
        self.assertIsNotNone(row)
        self.assertEqual(row[0], "executed")
        self.assertEqual(row[1], "System_Auto")

    def test_high_impact_approval_queueing(self):
        rec = Recommendation(
            machine_name="Injection_Molder_2", # Critical machine always triggers approval
            opportunity_type="Standby Shutdown",
            issue="Left active overnight during shutdown",
            action="Power down main heating bands",
            estimated_weekly_savings_kwh=800.0,
            estimated_weekly_savings_inr=5200.0, # Above threshold of 500
            estimated_weekly_savings_co2_kg=656.0,
            implementation_difficulty="High", # High difficulty triggers approval
            owner="Facility Manager",
            confidence=0.98,
            evidence=["Heater bands active for 12 hours"],
            operator_action_step_by_step="Turn off breaker C-1",
            management_impact_narrative="Saves a lot of money."
        )
        
        result = run_action_agent(rec, db_path=self.db_path)
        self.assertEqual(result["status"], "pending_approval")
        
        # Verify db log
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT status, approved_by FROM action_log WHERE machine_id='Injection_Molder_2'")
        row = cursor.fetchone()
        conn.close()
        
        self.assertIsNotNone(row)
        self.assertEqual(row[0], "pending_approval")
        self.assertIsNone(row[1])
        
    def test_execute_pending_action(self):
        # Insert a pending approval record manually
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO action_log (timestamp, machine_id, agent, status)
        VALUES ('2026-06-01 12:00:00', 'CNC_Mill_1', 'ActionAgent', 'pending_approval')
        """)
        action_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Execute it
        success = execute_pending_action(action_id, approved_by="Supervisor_Jim", db_path=self.db_path)
        self.assertTrue(success)
        
        # Verify status is now 'executed'
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT status, approved_by FROM action_log WHERE id = ?", (action_id,))
        row = cursor.fetchone()
        conn.close()
        
        self.assertEqual(row[0], "executed")
        self.assertEqual(row[1], "Supervisor_Jim")

if __name__ == "__main__":
    unittest.main()
