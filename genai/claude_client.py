import os
import json
import requests
import time
from dotenv import load_dotenv

# Load env variables
load_dotenv()

def call_llm(system_prompt: str, user_prompt: str, response_schema=None) -> str:
    """
    Calls the LLM using Anthropic's Claude API with fallback to Groq.
    Enforces structured JSON responses.
    """
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    groq_key = os.environ.get("GROQ_API_KEY")
    
    # Try Anthropic first if key exists
    if anthropic_key and anthropic_key.strip():
        model = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        print(f"Calling Anthropic API ({model})...")
        try:
            # For Anthropic, we ask the model to reply in JSON and we can provide the schema in the prompt
            headers = {
                "x-api-key": anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            
            schema_instruction = ""
            if response_schema:
                schema_instruction = f"\nReturn ONLY valid JSON matching this schema:\n{json.dumps(response_schema.model_json_schema())}\nDo not include code fences, markdown, or text outside the JSON structure."
                
            body = {
                "model": model,
                "max_tokens": 4000,
                "system": system_prompt + schema_instruction,
                "messages": [
                    {"role": "user", "content": user_prompt}
                ]
            }
            
            res = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=body, timeout=60)
            if res.status_code == 200:
                result_json = res.json()
                content = result_json["content"][0]["text"]
                return content
            else:
                print(f"Anthropic API failed with status {res.status_code}: {res.text}. Falling back to Groq...")
        except Exception as e:
            print(f"Anthropic call failed with error: {e}. Falling back to Groq...")

    # Fallback to Groq
    if groq_key and groq_key.strip():
        model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        print(f"Calling Groq API ({model})...")
        try:
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            
            schema_instruction = ""
            if response_schema:
                schema_instruction = f"\nReturn ONLY valid JSON matching this schema:\n{json.dumps(response_schema.model_json_schema())}\nDo not include markdown or text outside the JSON structure."

            body = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt + schema_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            
            res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body, timeout=60)
            if res.status_code == 200:
                result_json = res.json()
                content = result_json["choices"][0]["message"]["content"]
                return content
            else:
                print(f"Groq API failed with status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"Groq call failed with error: {e}")
            
    # Mock fallback for local testing if no keys are provided
    print("WARNING: No valid API keys found. Returning mock response.")
    return get_mock_response(response_schema)

def call_llm_with_validation(system_prompt: str, user_prompt: str, response_schema, max_retries=2):
    """
    Calls the LLM and validates output against Pydantic schema with retries.
    """
    for attempt in range(max_retries + 1):
        try:
            raw_output = call_llm(system_prompt, user_prompt, response_schema)
            # Remove any markdown code fences if LLM generated them
            cleaned = raw_output.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            # Parse JSON
            parsed_json = json.loads(cleaned)
            # Validate schema
            validated = response_schema.model_validate(parsed_json)
            return validated
        except Exception as e:
            print(f"Schema validation failed on attempt {attempt}: {e}")
            if attempt == max_retries:
                print("Max retries reached. Returning mock safe response.")
                return response_schema.model_validate(json.loads(get_mock_response(response_schema)))
            time.sleep(1.0)

def get_mock_response(response_schema) -> str:
    """Returns a mock JSON string conforming to the schemas."""
    # We check the name of the schema
    schema_name = response_schema.__name__
    
    if schema_name == "FacilityReport":
        return json.dumps({
            "executive_summary": "Overall facility operations are healthy, but significant idle waste was detected on CNC_Mill_1 during weekends, costing approximately $250 weekly. Additionally, Robotic_Welder_1 shows a stuck coolant pump drawing power continuously.",
            "recommendations": [
                {
                    "machine_name": "CNC_Mill_1",
                    "opportunity_type": "Standby Shutdown",
                    "issue": "Machine left active on weekends with 0 units produced, drawing average 8.2 kW standby power.",
                    "action": "Ensure operators follow shutdown checklist before leaving on Friday, or configure automated standby after 30 mins idle.",
                    "estimated_weekly_savings_kwh": 393.6,
                    "estimated_weekly_savings_inr": 2558.4,
                    "estimated_weekly_savings_co2_kg": 322.75,
                    "implementation_difficulty": "Low",
                    "owner": "Operator",
                    "confidence": 0.95,
                    "evidence": ["Weekend draw matches active standby baseline.", "0 units produced in production log."],
                    "operator_action_step_by_step": "1. Verify CNC Mill is empty.\n2. Power down the main breaker switch on panel B-4.\n3. Log shutdown on board.",
                    "management_impact_narrative": "Implementing weekend shutdown saves ₹2,558 weekly with zero capital expenditure, improving Line 1's overall energy productivity index by 12%."
                },
                {
                    "machine_name": "Robotic_Welder_1",
                    "opportunity_type": "Stuck Auxiliary",
                    "issue": "Coolant pump draws 7.0 kW continuous standby load while weld tip is cold (26°C), showing stuck-on auxiliary fault.",
                    "action": "Inspect and replace the auxiliary cooling loop contactor relay.",
                    "estimated_weekly_savings_kwh": 280.0,
                    "estimated_weekly_savings_inr": 1820.0,
                    "estimated_weekly_savings_co2_kg": 229.6,
                    "implementation_difficulty": "Medium",
                    "owner": "Maintenance",
                    "confidence": 0.88,
                    "evidence": ["Continuous vibration signal present during downtime.", "Temperature remains cold at 26C."],
                    "operator_action_step_by_step": "1. Place machine in maintenance lockout.\n2. Swap out the contactor relay on the coolant manifold.\n3. Test automatic pump shutoff.",
                    "management_impact_narrative": "Replacing the stuck contactor eliminates continuous idle draw, saving ₹1,820/week and preventing premature failure of the cooling pump motor."
                }
            ],
            "quick_wins": [
                "Implement 30-min idle auto-shutoff on all conveyors",
                "Ensure CNC Mill is turned off before weekend shutdown"
            ]
        })
    else:
        return "{}"
