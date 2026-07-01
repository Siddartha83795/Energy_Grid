import os
import sys
import json
import sqlite3
from pathlib import Path

# Add directories to path
sys.path.append(str(Path(__file__).resolve().parents[1]))
sys.path.append(str(Path(__file__).resolve().parents[1] / "genai"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "analytics-engine"))

from claude_client import call_llm_with_validation
from schemas import Recommendation
from causal_graph import generate_causal_graph

def get_context_for_machine(machine_id, start_time, end_time, db_path=None):
    """Retrieves surrounding shift and production context for an anomaly window."""
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    conn = sqlite3.connect(db_path)
    
    # 1. Check if a shift was active
    # Query shift names matching date of start_time
    date_str = start_time[:10]
    cursor = conn.cursor()
    cursor.execute(
        "SELECT shift_name, line_id, headcount FROM shifts WHERE date = ?",
        (date_str,)
    )
    shifts = cursor.fetchall()
    
    # 2. Check production units produced in this interval
    cursor.execute(
        "SELECT SUM(units_produced), AVG(utilization_pct) FROM production_logs WHERE machine_id = ? AND timestamp BETWEEN ? AND ?",
        (machine_id, start_time, end_time)
    )
    prod = cursor.fetchone()
    
    # 3. Check schedules
    cursor.execute(
        "SELECT schedule_type FROM machine_schedules WHERE machine_id = ? AND start <= ? AND end >= ?",
        (machine_id, start_time, end_time)
    )
    sched = cursor.fetchone()
    
    conn.close()
    
    shift_context = ", ".join([f"{s[0]} on {s[1]} (crew: {s[2]})" for s in shifts]) if shifts else "No shifts scheduled"
    units = prod[0] if prod and prod[0] is not None else 0
    util = prod[1] if prod and prod[1] is not None else 0.0
    sched_type = sched[0] if sched else "None (shutdown period)"
    
    return {
        "shift_context": shift_context,
        "units_produced": units,
        "utilization_pct": round(util, 2),
        "scheduled_state": sched_type
    }

def run_root_cause_agent(event, db_path=None):
    """
    Root-Cause Agent: reasons over an anomaly event and outputs a structured Pydantic Recommendation.
    """
    machine_id = event["machine_id"]
    start_time = event["start_time"]
    end_time = event["end_time"]
    
    # Get additional context
    context = get_context_for_machine(machine_id, start_time, end_time, db_path)
    
    # Generate causal graph
    causal_g = generate_causal_graph(
        machine_id, 
        event["category"], 
        start_time, 
        event["avg_kw_demand"], 
        event["threshold_kw"]
    )
    
    # Run the optimization recommendation engine to get carbon metrics
    sys_prompt = """You are the Root-Cause LLM Agent in an industrial energy advisor.
Your role is to analyze a energy waste event, examine the correlated context and causal evidence graph, and output a detailed recommendation.
You MUST write a causal explanation, citing specific data points from the evidence.
Return a valid JSON object matching the Recommendation schema. Do not include markdown code fences or conversational text."""

    user_prompt = f"""
ANOMALY EVENT DETAILS:
- Machine ID: {machine_id}
- Time Range: {start_time} to {end_time} (Duration: {event["duration_hours"]} hrs)
- Average Draw: {event["avg_kw_demand"]} kW (Dynamic Idle Threshold: {event["threshold_kw"]} kW)
- Total kWh Wasted: {event["kwh_wasted"]} kWh
- Financial Loss: ₹{event["cost_wasted_inr"]}
- Sensor Signals: Avg Temp = {event["avg_temperature"]}°C, Avg Vibration = {event["avg_vibration"]} dB
- Classification: {event["category"]} (confidence: {event["confidence"]})

CORRELATED OPERATIONAL CONTEXT:
- Shift context: {context["shift_context"]}
- Scheduled state: {context["scheduled_state"]}
- Production during window: {context["units_produced"]} units (utilization: {context["utilization_pct"]}%)

CAUSAL EVIDENCE GRAPH:
{json.dumps(causal_g, indent=2)}

Calculate weekly estimated savings if resolved (assume this happens once a week):
- estimated_weekly_savings_kwh = {event["kwh_wasted"]}
- estimated_weekly_savings_inr = {event["cost_wasted_inr"]}
- estimated_weekly_savings_co2_kg = {round(event["kwh_wasted"] * 0.82, 2)}

Provide highly specific, role-suited feedback:
- For 'operator_action_step_by_step': detail simple physical controls or tasks.
- For 'management_impact_narrative': frame it financially with ROI/savings focus.
- Citations in the 'evidence' list MUST refer to the specific parameters/times/values above.
"""

    recommendation = call_llm_with_validation(sys_prompt, user_prompt, Recommendation)
    
    # Override machine name to ensure it aligns
    recommendation.machine_name = machine_id
    
    return recommendation

if __name__ == "__main__":
    mock_event = {
        "machine_id": "CNC_Mill_1",
        "start_time": "2026-06-06 08:00:00",
        "end_time": "2026-06-06 12:00:00",
        "duration_hours": 4.0,
        "avg_kw_demand": 8.5,
        "threshold_kw": 5.0,
        "kwh_wasted": 34.0,
        "cost_wasted_inr": 340.0,
        "avg_temperature": 25.1,
        "avg_vibration": 30.2,
        "category": "true_idle_waste",
        "confidence": 0.85
    }
    
    rec = run_root_cause_agent(mock_event)
    print(rec.model_dump_json(indent=2))
