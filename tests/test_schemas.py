import unittest
import sys
from pathlib import Path
from pydantic import ValidationError

sys.path.append(str(Path(__file__).resolve().parents[1]))
sys.path.append(str(Path(__file__).resolve().parents[1] / "genai"))

from schemas import Recommendation, FacilityReport

class TestGenAISchemas(unittest.TestCase):
    
    def test_valid_recommendation(self):
        valid_data = {
            "machine_name": "CNC_Mill_1",
            "opportunity_type": "Standby Shutdown",
            "issue": "Left ON during weekend shift gaps",
            "action": "Trigger manual shutdown checklist",
            "estimated_weekly_savings_kwh": 120.5,
            "estimated_weekly_savings_inr": 783.25,
            "estimated_weekly_savings_co2_kg": 98.8,
            "implementation_difficulty": "Low",
            "owner": "Operator",
            "confidence": 0.85,
            "evidence": ["0 units produced in logs between Saturday 00:00 and Sunday 23:59"],
            "operator_action_step_by_step": "Power down machine from switchboard B",
            "management_impact_narrative": "Provides 0-capex financial waste reduction."
        }
        
        rec = Recommendation.model_validate(valid_data)
        self.assertEqual(rec.machine_name, "CNC_Mill_1")
        self.assertEqual(rec.confidence, 0.85)

    def test_invalid_recommendation_missing_evidence(self):
        # Missing required 'evidence' and 'confidence' fields
        invalid_data = {
            "machine_name": "CNC_Mill_1",
            "opportunity_type": "Standby Shutdown",
            "issue": "Left ON",
            "action": "Shutdown",
            "estimated_weekly_savings_kwh": 120.5,
            "estimated_weekly_savings_inr": 783.25,
            "estimated_weekly_savings_co2_kg": 98.8,
            "implementation_difficulty": "Low",
            "owner": "Operator",
            # evidence and confidence missing
            "operator_action_step_by_step": "Turn off",
            "management_impact_narrative": "Saves money."
        }
        
        with self.assertRaises(ValidationError):
            Recommendation.model_validate(invalid_data)

    def test_invalid_difficulty_literal(self):
        # difficulty should be Literal["Low", "Medium", "High"]
        invalid_data = {
            "machine_name": "CNC_Mill_1",
            "opportunity_type": "Standby Shutdown",
            "issue": "Left ON",
            "action": "Shutdown",
            "estimated_weekly_savings_kwh": 120.5,
            "estimated_weekly_savings_inr": 783.25,
            "estimated_weekly_savings_co2_kg": 98.8,
            "implementation_difficulty": "Instant", # Invalid
            "owner": "Operator",
            "confidence": 0.90,
            "evidence": ["Test evidence"],
            "operator_action_step_by_step": "Turn off",
            "management_impact_narrative": "Saves money."
        }
        
        with self.assertRaises(ValidationError):
            Recommendation.model_validate(invalid_data)

if __name__ == "__main__":
    unittest.main()
