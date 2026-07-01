import sqlite3
import os
import sys
import yaml
from pathlib import Path
from datetime import datetime

# Add directories to path
sys.path.append(str(Path(__file__).resolve().parents[1]))

def load_threshold_config():
    config_path = Path("config/thresholds.yaml")
    if config_path.exists():
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
    return {
        "thresholds": {
            "action_approvals": {
                "cost_threshold_inr": 500.0
            }
        }
    }

def run_action_agent(recommendation, db_path=None):
    """
    Action Agent: determines if a recommended action can be auto-executed or requires human approval.
    Logs the action state to action_log database table.
    """
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    config = load_threshold_config()
    cost_threshold = config["thresholds"]["action_approvals"]["cost_threshold_inr"]
    
    machine_id = recommendation.machine_name
    weekly_savings = recommendation.estimated_weekly_savings_inr
    kwh_saved = recommendation.estimated_weekly_savings_kwh
    difficulty = recommendation.implementation_difficulty
    
    # Heuristics:
    # 1. High difficulty always requires approval.
    # 2. Cost savings exceeding threshold requires approval.
    # 3. Critical heavy machinery (Injection Molder, Thermoformer) always requires approval to prevent damage or downtime.
    critical_machines = ["Injection_Molder_2", "Thermoformer_2"]
    
    requires_approval = (
        difficulty == "High" or
        weekly_savings > cost_threshold or
        machine_id in critical_machines
    )
    
    status = "pending_approval" if requires_approval else "executed"
    
    # Description based on status
    if status == "executed":
        action_desc = f"Simulated automated standby signal sent to {machine_id} after detecting idle state."
        notes = "Auto-executed under low-risk threshold rules."
    else:
        action_desc = f"Request to trigger physical standby/shutdown or maintenance on {machine_id}."
        notes = f"Requires human verification due to high impact / financial scale (₹{weekly_savings:.2f} weekly savings) or machine criticality."
        
    # Write to action_log
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
    INSERT INTO action_log (
        timestamp, machine_id, agent, action_type, description, 
        impact_kwh, impact_cost_inr, status, approved_by, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_str,
        machine_id,
        "ActionAgent",
        recommendation.opportunity_type,
        action_desc,
        kwh_saved,
        weekly_savings,
        status,
        None if status == "pending_approval" else "System_Auto",
        notes
    ))
    
    conn.commit()
    conn.close()
    
    print(f"Action Agent: Evaluated {machine_id}. Decision: {status.upper()}")
    return {
        "machine_id": machine_id,
        "action_type": recommendation.opportunity_type,
        "status": status,
        "notes": notes
    }

def execute_pending_action(action_id, approved_by="Operator_Name", db_path=None):
    """Executes a previously pending action (simulated)."""
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
    UPDATE action_log 
    SET status = 'executed', approved_by = ?, notes = 'Approved and simulated command dispatched.'
    WHERE id = ? AND status = 'pending_approval'
    """, (approved_by, action_id))
    
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    
    return rows_affected > 0

if __name__ == "__main__":
    from genai.schemas import Recommendation
    # Test auto execute
    rec_low = Recommendation(
        machine_name="Pick_Place_1",
        opportunity_type="Standby Shutdown",
        issue="Idle draw during shift changeover",
        action="Turn off auxiliary monitor",
        estimated_weekly_savings_kwh=20.0,
        estimated_weekly_savings_inr=130.0,
        estimated_weekly_savings_co2_kg=16.4,
        implementation_difficulty="Low",
        owner="Operator",
        confidence=0.9,
        evidence=["Idle power draw exceeds 1.5 kW"],
        operator_action_step_by_step="Turn off screen",
        management_impact_narrative="Saves a little money"
    )
    run_action_agent(rec_low)
    
    # Test pending approval
    rec_high = Recommendation(
        machine_name="Injection_Molder_2",
        opportunity_type="Standby Shutdown",
        issue="Left active overnight",
        action="Power down main furnace heat loops",
        estimated_weekly_savings_kwh=1000.0,
        estimated_weekly_savings_inr=6500.0,
        estimated_weekly_savings_co2_kg=820.0,
        implementation_difficulty="High",
        owner="Facility Manager",
        confidence=0.95,
        evidence=["Idle draw matches 15kW for 8 hours"],
        operator_action_step_by_step="Turn off main heat loop",
        management_impact_narrative="Saves a lot of money"
    )
    run_action_agent(rec_high)
