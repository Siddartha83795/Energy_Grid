#!/usr/bin/env python3
"""
=========================================================================================
 GenAI Energy Advisor — IoT Hardware Simulator & Verification Test Harness
 Simulates physical telemetry from ESP32-WROOM-32 connected to all 13 industrial sensors:
  1. ESP32 DevKit V1
  2. PZEM-004T V3 (AC Voltage, Current, Power, Energy Wh, Power Factor, Frequency)
  3. SCT-013-000 (Non-invasive Current Transformer)
  4. DS18B20 (Digital Temperature Probe)
  5. MPU6050 (Vibration Acceleration RMS / Harmonics)
  6. HC-SR501 (PIR Human Presence Sensor)
  7. IR Proximity / Obstacle Sensor (Machine Cycle Detection)
  8. 1-Channel/2-Channel 5V Relay Module
  9. Heavy-Duty AC Contactor
  10. Fuse/MCB Protection
  11. Mushroom Emergency Stop (E-Stop)
  12. 0.96" SSD1306 OLED Display
  13. 5V Active Buzzer
=========================================================================================
"""

import sys
import time
import json
import random
import requests
from datetime import datetime

DEFAULT_API_URL = "http://localhost:3000/api/iot"

def run_hardware_stream_test(api_url=DEFAULT_API_URL, scenario="waste", machine_id="CNC_Mill_1"):
    print("=" * 80)
    print(f"  GENAI ENERGY ADVISOR — IoT HARDWARE TELEMETRY STREAMER")
    print(f"  Target Endpoint : {api_url}")
    print(f"  Machine Node    : {machine_id}")
    print(f"  Scenario        : {scenario.upper()}")
    print("=" * 80)

    # Base readings
    voltage_v = round(230.0 + random.uniform(-2.5, 2.5), 1)
    frequency_hz = round(50.0 + random.uniform(-0.1, 0.1), 2)

    if scenario == "normal":
        # Scenario 1: Active Production
        current_a = round(3.8 + random.uniform(0.1, 0.5), 2)
        power_factor = round(0.92 + random.uniform(0.01, 0.05), 2)
        power_w = round(voltage_v * current_a * power_factor, 1)
        sct_current_a = round(current_a + random.uniform(-0.05, 0.05), 2)
        temperature_c = round(35.5 + random.uniform(0.5, 2.0), 1)
        vibration_g = round(0.22 + random.uniform(0.02, 0.08), 2)
        pir_motion = 1
        proximity_detected = 1
        estop_active = 0
        relay_state = "ON"
        contactor_state = "CLOSED"
        scenario_desc = "Optimal loaded production (Workpiece present, operator active)"

    elif scenario == "waste":
        # Scenario 2: Idle Standby Waste (Machine drawing power with no operator or workpiece)
        current_a = round(1.4 + random.uniform(0.05, 0.2), 2)
        power_factor = round(0.72 + random.uniform(0.02, 0.06), 2)
        power_w = round(voltage_v * current_a * power_factor, 1) # ~230W idle leakage
        sct_current_a = round(current_a + random.uniform(-0.02, 0.02), 2)
        temperature_c = round(24.0 + random.uniform(0.2, 0.8), 1)
        vibration_g = round(0.05 + random.uniform(0.01, 0.03), 2)
        pir_motion = 0 # No operator
        proximity_detected = 0 # No cycle
        estop_active = 0
        relay_state = "ON"
        contactor_state = "CLOSED"
        scenario_desc = "Prolonged Unattended Standby (PIR=0, Proximity=0, P=230W)"

    elif scenario == "mechanical_fault":
        # Scenario 3: Mechanical Bearing Wear & Overheating
        current_a = round(2.8 + random.uniform(0.2, 0.4), 2)
        power_factor = round(0.85 + random.uniform(0.02, 0.04), 2)
        power_w = round(voltage_v * current_a * power_factor, 1)
        sct_current_a = round(current_a + random.uniform(-0.04, 0.04), 2)
        temperature_c = round(64.5 + random.uniform(1.0, 3.0), 1) # High temp
        vibration_g = round(1.35 + random.uniform(0.1, 0.3), 2) # High vibration
        pir_motion = 1
        proximity_detected = 1
        estop_active = 0
        relay_state = "ON"
        contactor_state = "CLOSED"
        scenario_desc = "High Vibration & Thermal Signature (Bearing Wear Warning)"

    elif scenario == "estop":
        # Scenario 4: Emergency Stop Interlock Trip
        current_a = 0.0
        power_factor = 0.50
        power_w = 0.0
        sct_current_a = 0.0
        temperature_c = 23.5
        vibration_g = 0.02
        pir_motion = 1
        proximity_detected = 0
        estop_active = 1
        relay_state = "OFF"
        contactor_state = "OPEN"
        scenario_desc = "Emergency Stop Mushroom button triggered by operator"

    payload = {
        "machine_id": machine_id,
        "voltage_v": voltage_v,
        "current_a": current_a,
        "power_w": power_w,
        "energy_wh": round(1520.0 + random.uniform(10, 50), 1),
        "power_factor": power_factor,
        "frequency_hz": frequency_hz,
        "sct_current_a": sct_current_a,
        "temperature_c": temperature_c,
        "vibration_g": vibration_g,
        "vibration_rms": vibration_g,
        "pir_motion": pir_motion,
        "proximity_detected": proximity_detected,
        "relay_state": relay_state,
        "contactor_state": contactor_state,
        "estop_active": estop_active,
        "protocol": "ESP32-WROOM-32"
    }

    print(f"\n[1] TRANSMITTING 13-SENSOR HARDWARE PACKET:")
    print(f"    - Voltage (PZEM-004T)    : {voltage_v} V  | Frequency: {frequency_hz} Hz")
    print(f"    - Current (PZEM-004T)    : {current_a} A  | SCT-013 CT: {sct_current_a} A")
    print(f"    - Active Power           : {power_w} W  | Power Factor: {power_factor}")
    print(f"    - Temperature (DS18B20)  : {temperature_c} °C")
    print(f"    - Vibration (MPU6050)    : {vibration_g} G RMS")
    print(f"    - PIR Presence (HC-SR501): {'HUMAN PRESENT' if pir_motion else 'ABSENT / VACANT'}")
    print(f"    - Proximity (IR Obstacle): {'WORKPIECE DETECTED' if proximity_detected else 'NO PART CYCLE'}")
    print(f"    - Safety (E-Stop Interlock): {'TRIPPED' if estop_active else 'NORMAL (ARMED)'}")
    print(f"    - Actuators              : Relay={relay_state}, Contactor={contactor_state}")

    try:
        response = requests.post(api_url, json=payload, timeout=5)
        print(f"\n[2] HTTP STATUS: {response.status_code}")
        if response.status_code == 200:
            res_data = response.json()
            ai = res_data.get("ai_analysis", {})
            cmds = res_data.get("commands", {})

            print(f"\n[3] ⚡ REAL-TIME AI PREDICTION & REASONING RESULT:")
            print(f"    * Detected State         : {ai.get('state')}")
            print(f"    * Severity               : {ai.get('severity')}")
            print(f"    * AI Confidence          : {ai.get('confidence', 0) * 100:.1f}%")
            print(f"    * Diagnosis              : {ai.get('diagnosis')}")
            print(f"    * AI Recommendation      : {ai.get('recommendation')}")
            print(f"    * Excess Idle Power      : {ai.get('excess_power_w', 0):.1f} W")
            print(f"    * Hourly Financial Waste : ₹{ai.get('waste_cost_inr_per_hour', 0):.2f}")
            print(f"    * Projected Monthly Loss : ₹{ai.get('monthly_projected_waste_inr', 0):.2f}")

            print(f"\n[4] 🔄 CLOSED-LOOP ESP32 ACTUATION DISPATCH:")
            print(f"    * Relay Coil Command     : {cmds.get('relay')}")
            print(f"    * 5V Buzzer Alarm Command: {cmds.get('buzzer')}")
            print(f"    * OLED Line 1 Screen     : \"{cmds.get('oled_line1')}\"")
            print(f"    * OLED Line 2 Screen     : \"{cmds.get('oled_line2')}\"")
            print("\n" + "=" * 80 + "\n")
            return res_data
        else:
            print(f"Error from server: {response.text}")
    except Exception as e:
        print(f"Connection Failed to {api_url}: {e}")
        print("Note: Start the application server with `npm run dev` or `npm start` to test the live endpoint.")

if __name__ == "__main__":
    scenario = sys.argv[1] if len(sys.argv) > 1 else "waste"
    run_hardware_stream_test(scenario=scenario)
