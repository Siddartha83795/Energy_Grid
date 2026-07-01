import os
import sys
import json
import sqlite3
from pathlib import Path

# Add directories to path
sys.path.append(str(Path(__file__).resolve().parents[1]))
sys.path.append(str(Path(__file__).resolve().parents[1] / "genai"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "analytics-engine"))

from detection_agent import run_detection_agent
from root_cause_agent import run_root_cause_agent
from action_agent import run_action_agent
from optimizer import optimize_tariffs_and_renewables
from claude_client import call_llm_with_validation
from schemas import FacilityReport, Recommendation

def run_energy_advisor_agent_workflow(db_path=None):
    """
    Reporting Agent Workflow:
    1. Scan for anomalies (Detection Agent)
    2. Reason over causes for top anomalies (Root-Cause Agent)
    3. Evaluate/Queue actions (Action Agent)
    4. Fetch load-shifting optimizations (Optimizer)
    5. Compile global executive summary and report (Reporting Agent)
    """
    if db_path is None:
        db_path = os.environ.get("DB_PATH", "energy_advisor.db")
        
    print("Reporting Agent: Orchestrating global workflow...")
    
    # 1. Run Detection Agent
    events = run_detection_agent(db_path=db_path)
    
    # Sort events by total cost wasted descending, and limit to top 3 to keep prompt clean
    events = sorted(events, key=lambda x: x["kwh_wasted"], reverse=True)
    top_events = events[:3]
    
    recommendations = []
    
    # 2 & 3. Run Root-Cause and Action Agents
    for event in top_events:
        try:
            # Generate structured recommendation
            rec = run_root_cause_agent(event, db_path=db_path)
            recommendations.append(rec)
            
            # Dispatch to Action Agent to queue or auto-execute
            run_action_agent(rec, db_path=db_path)
        except Exception as e:
            print(f"Error analyzing root-cause for machine {event['machine_id']}: {e}")
            
    # 4. Integrate Load-Shifting suggestions
    try:
        shifting_suggs = optimize_tariffs_and_renewables(db_path=db_path)
        for s in shifting_suggs[:2]: # take top 2 shifting opportunities
            # Create a Recommendation Pydantic object from the suggestion dict
            rec_opt = Recommendation(
                machine_name=s["machine_id"],
                opportunity_type=s["opportunity_type"],
                issue="Operational load scheduled during high-tariff or low-solar window.",
                action=s["description"],
                estimated_weekly_savings_kwh=s["kwh_shifted_weekly"],
                estimated_weekly_savings_inr=s["cost_savings_inr_weekly"],
                estimated_weekly_savings_co2_kg=s["co2_savings_kg_weekly"],
                implementation_difficulty=s["implementation_difficulty"],
                owner=s["owner"],
                confidence=0.90,
                evidence=[f"Tariff rate at scheduled hour is high.", "Simulated solar generation curve shows peak offsetting capability."],
                operator_action_step_by_step=f"Reschedule machine startup routine to align with solar PV generation window.",
                management_impact_narrative=f"Moving this load improves clean energy usage metrics and lowers peak grid demand charges."
            )
            recommendations.append(rec_opt)
    except Exception as e:
        print(f"Error gathering load-shifting suggestions: {e}")
        
    # Get overall facility metrics for LLM context
    conn = sqlite3.connect(db_path)
    # Total consumption
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(kwh) FROM energy_readings WHERE machine_id != 'Solar_PV_System'")
    total_kwh = cursor.fetchone()[0] or 0.0
    
    # Total idle consumption (approximated)
    # Let's count how much kwh was active vs idle using features helper logic
    conn.close()
    
    # 5. Compile global report via LLM
    sys_prompt = """You are the Lead Reporting Agent in the GenAI Energy Advisor platform.
Your task is to review all machine-level recommendations, tariff optimizations, and global stats, and compile a single cohesive FacilityReport JSON object.
Enforce strict formatting, tone variants, confidence, and grounding evidence. Return ONLY valid JSON matching the FacilityReport schema."""

    # Summarize recommendations for prompt
    recs_summary = []
    for r in recommendations:
        recs_summary.append({
            "machine": r.machine_name,
            "type": r.opportunity_type,
            "issue": r.issue,
            "savings_inr": r.estimated_weekly_savings_inr,
            "savings_kwh": r.estimated_weekly_savings_kwh,
            "savings_co2_kg": r.estimated_weekly_savings_co2_kg,
            "difficulty": r.implementation_difficulty,
            "owner": r.owner
        })

    user_prompt = f"""
FACILITY ENERGY DATA OVERVIEW:
- Total Facility Consumption (30 Days): {round(total_kwh, 2)} kWh
- Total Analyzed Machines: 10
- Production Lines: Line 1 (Assembly), Line 2 (Packaging)
- Tariff: Peak rate = ₹10/kWh, Off-Peak = ₹6.5/kWh, Night = ₹4.0/kWh
- Dynamic Thresholding: Rolling baseline 14-day window

INDIVIDUAL OPPORTUNITIES DISCOVERED:
{json.dumps(recs_summary, indent=2)}

INSTRUCTIONS:
1. Write a facility-level executive summary narrative (1-page equivalent, 6-8 sentences). Focus on top financial and carbon opportunities, and shift-to-shift gamification insights (e.g. Shift A vs Shift C waste comparison).
2. Format all recommendations into the final structured list, verifying that confidence levels and citations are present.
3. List 3-4 simple facility-wide 'quick_wins' that require low effort.
"""

    facility_report = call_llm_with_validation(sys_prompt, user_prompt, FacilityReport)
    
    # Write report json to local file so we can cache/retrieve it
    report_cache_path = Path("config/latest_report.json")
    with open(report_cache_path, "w") as f:
        json.dump(facility_report.model_dump(), f, indent=2)
        
    print("Reporting Agent: Global workflow completed. Facility report cached.")
    return facility_report

if __name__ == "__main__":
    report = run_energy_advisor_agent_workflow()
    try:
        print(report.executive_summary)
    except UnicodeEncodeError:
        print(report.executive_summary.encode('ascii', errors='replace').decode('ascii'))
