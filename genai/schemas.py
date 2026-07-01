from pydantic import BaseModel, Field
from typing import List, Literal

class Recommendation(BaseModel):
    machine_name: str = Field(description="Name/ID of the machine")
    opportunity_type: str = Field(description="Category, e.g., 'Standby Shutdown', 'Stuck Auxiliary', 'Renewable Shift'")
    issue: str = Field(description="Description of the waste detected")
    action: str = Field(description="Recommended action to mitigate the waste")
    estimated_weekly_savings_kwh: float = Field(description="Estimated weekly electricity saved in kWh")
    estimated_weekly_savings_inr: float = Field(description="Estimated weekly financial savings in INR")
    estimated_weekly_savings_co2_kg: float = Field(description="Estimated weekly carbon footprint reduction in kg CO2e")
    implementation_difficulty: Literal["Low", "Medium", "High"] = Field(description="Difficulty of implementing the recommendation")
    owner: Literal["Operator", "Maintenance", "Facility Manager", "Production Planner"] = Field(description="Role responsible for implementation")
    confidence: float = Field(ge=0.0, le=1.0, description="LLM confidence score based on evidence quality")
    evidence: List[str] = Field(description="Grounding citations referring to specific database values or trends")
    operator_action_step_by_step: str = Field(description="Step-by-step plain English instruction for the operator on the floor")
    management_impact_narrative: str = Field(description="Financial, KPI-focused explanation for executive decision making")

class FacilityReport(BaseModel):
    executive_summary: str = Field(description="1-page facility-level narrative summarizing the top opportunities and overall status")
    recommendations: List[Recommendation] = Field(description="List of structured recommendations, max 5")
    quick_wins: List[str] = Field(description="List of low-hanging fruits that can be implemented instantly")
