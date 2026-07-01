import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import yaml

def generate_synthetic_data(output_dir="data-ingestion/raw", days=30):
    os.makedirs(output_dir, exist_ok=True)
    
    # Setup parameters
    np.random.seed(42)
    start_date = datetime(2026, 6, 1, 0, 0, 0)
    end_date = start_date + timedelta(days=days)
    timestamps = pd.date_range(start=start_date, end=end_date, freq="15min")
    
    # 10 Machines across 2 lines
    machines = [
        {"id": "CNC_Mill_1", "line": "Line_1", "type": "CNC", "base_kw": 8.0, "active_kw": 40.0, "pf": 0.85, "thermal_run": 65.0, "acoustic_run": 78.0},
        {"id": "CNC_Lathe_1", "line": "Line_1", "type": "CNC", "base_kw": 5.0, "active_kw": 25.0, "pf": 0.82, "thermal_run": 55.0, "acoustic_run": 72.0},
        {"id": "Robotic_Welder_1", "line": "Line_1", "type": "Welder", "base_kw": 3.0, "active_kw": 20.0, "pf": 0.78, "thermal_run": 85.0, "acoustic_run": 65.0},
        {"id": "Pick_Place_1", "line": "Line_1", "type": "PnP", "base_kw": 1.5, "active_kw": 8.0, "pf": 0.88, "thermal_run": 40.0, "acoustic_run": 50.0},
        {"id": "Assembly_Conveyor_1", "line": "Line_1", "type": "Conveyor", "base_kw": 2.0, "active_kw": 10.0, "pf": 0.80, "thermal_run": 45.0, "acoustic_run": 60.0},
        
        {"id": "Injection_Molder_2", "line": "Line_2", "type": "Molder", "base_kw": 15.0, "active_kw": 75.0, "pf": 0.90, "thermal_run": 140.0, "acoustic_run": 82.0},
        {"id": "Thermoformer_2", "line": "Line_2", "type": "Thermo", "base_kw": 10.0, "active_kw": 48.0, "pf": 0.86, "thermal_run": 110.0, "acoustic_run": 75.0},
        {"id": "Packaging_Robot_2", "line": "Line_2", "type": "Robot", "base_kw": 2.5, "active_kw": 14.0, "pf": 0.84, "thermal_run": 45.0, "acoustic_run": 62.0},
        {"id": "Labeling_Machine_2", "line": "Line_2", "type": "Labeler", "base_kw": 1.0, "active_kw": 4.5, "pf": 0.92, "thermal_run": 35.0, "acoustic_run": 45.0},
        {"id": "Palletizer_2", "line": "Line_2", "type": "Palletizer", "base_kw": 2.0, "active_kw": 12.0, "pf": 0.81, "thermal_run": 48.0, "acoustic_run": 58.0}
    ]
    
    # 1. Generate Shift Records
    print("Generating Shifts...")
    shifts_data = []
    current_day = start_date
    while current_day < end_date:
        day_str = current_day.strftime("%Y-%m-%d")
        # Shift A: 06:00 - 14:00
        shifts_data.append({"shift_name": "Shift_A", "date": day_str, "start_time": f"{day_str} 06:00:00", "end_time": f"{day_str} 14:00:00", "line_id": "Line_1", "headcount": 8})
        shifts_data.append({"shift_name": "Shift_A", "date": day_str, "start_time": f"{day_str} 06:00:00", "end_time": f"{day_str} 14:00:00", "line_id": "Line_2", "headcount": 6})
        # Shift B: 14:00 - 22:00
        shifts_data.append({"shift_name": "Shift_B", "date": day_str, "start_time": f"{day_str} 14:00:00", "end_time": f"{day_str} 22:00:00", "line_id": "Line_1", "headcount": 8})
        shifts_data.append({"shift_name": "Shift_B", "date": day_str, "start_time": f"{day_str} 14:00:00", "end_time": f"{day_str} 22:00:00", "line_id": "Line_2", "headcount": 6})
        # Shift C: 22:00 - 06:00 (Next day morning)
        shifts_data.append({"shift_name": "Shift_C", "date": day_str, "start_time": f"{day_str} 22:00:00", "end_time": (current_day + timedelta(days=1)).strftime("%Y-%m-%d 06:00:00"), "line_id": "Line_1", "headcount": 4})
        shifts_data.append({"shift_name": "Shift_C", "date": day_str, "start_time": f"{day_str} 22:00:00", "end_time": (current_day + timedelta(days=1)).strftime("%Y-%m-%d 06:00:00"), "line_id": "Line_2", "headcount": 3})
        current_day += timedelta(days=1)
        
    shifts_df = pd.DataFrame(shifts_data)
    shifts_df.to_csv(f"{output_dir}/shifts.csv", index=False)
    
    # 2. Generate Machine Operating Schedules (Planned Uptime Windows & Maintenance Slots)
    print("Generating Schedules...")
    schedules_data = []
    for day_idx in range(days):
        day = start_date + timedelta(days=day_idx)
        is_weekend = day.weekday() >= 5
        day_str = day.strftime("%Y-%m-%d")
        
        for m in machines:
            if is_weekend:
                # Maintenance slots or shutdown
                if m["id"] == "CNC_Mill_1":
                    # Scheduled maintenance on Saturday 08:00 - 12:00
                    if day.weekday() == 5:
                        schedules_data.append({"machine_id": m["id"], "start": f"{day_str} 08:00:00", "end": f"{day_str} 12:00:00", "schedule_type": "maintenance"})
                # Otherwise, off during weekend (no planned running)
                continue
            else:
                # Weekday planned running is 06:00 to 22:00 (Shift A + Shift B)
                # Shift C is idle/shutdown except for Injection_Molder_2 which runs 24 hrs
                if m["id"] == "Injection_Molder_2":
                    schedules_data.append({"machine_id": m["id"], "start": f"{day_str} 00:00:00", "end": f"{day_str} 23:59:59", "schedule_type": "planned_production"})
                else:
                    schedules_data.append({"machine_id": m["id"], "start": f"{day_str} 06:00:00", "end": f"{day_str} 22:00:00", "schedule_type": "planned_production"})
                    
    schedules_df = pd.DataFrame(schedules_data)
    schedules_df.to_csv(f"{output_dir}/machine_schedules.csv", index=False)
    
    # 3. Generate Energy & Sensor readings
    print("Generating Energy Meter and Sensor Readings (this may take a minute)...")
    energy_rows = []
    sensor_rows = []
    production_rows = []
    
    # Build schedule lookup dictionary for quick checks
    sched_lookup = {}
    for _, s in schedules_df.iterrows():
        m_id = s["machine_id"]
        if m_id not in sched_lookup:
            sched_lookup[m_id] = []
        sched_lookup[m_id].append((pd.to_datetime(s["start"]), pd.to_datetime(s["end"]), s["schedule_type"]))

    # Loop timestamps
    for ts in timestamps:
        ts_hour = ts.hour
        ts_weekday = ts.weekday()
        is_weekend = ts_weekday >= 5
        
        # Solar generation curve (bell curve peaking at 1 PM)
        solar_gen = 0.0
        if 6 <= ts_hour <= 18:
            solar_gen = max(0.0, 150.0 * np.sin(np.pi * (ts_hour - 6) / 12) + np.random.normal(0, 5))
        
        for m in machines:
            m_id = m["id"]
            # Determine if machine is scheduled to be active
            m_sched = sched_lookup.get(m_id, [])
            in_schedule = False
            sched_type = "shutdown"
            
            for start, end, stype in m_sched:
                if start <= ts <= end:
                    in_schedule = True
                    sched_type = stype
                    break
            
            # Determine true operating state (Running vs Idle vs Shutdown)
            # Add some realistic operating waste:
            # 1. Lunch breaks: 12:00 to 13:00, machines are idle
            is_lunch = (ts_hour == 12 and 0 <= ts.minute < 60) and not is_weekend
            
            # 2. Weekend waste: CNC_Mill_1 is left ON during weekends (Friday night to Monday morning)
            # representing a major waste anomaly!
            is_weekend_waste = (m_id == "CNC_Mill_1" and is_weekend)
            
            # 3. Shift gap waste: 13:45 to 14:15, and 21:45 to 22:15 (changeover idle)
            is_changeover = ((ts_hour == 13 or ts_hour == 14) and 45 <= ts.minute or ts.minute < 15) or \
                             ((ts_hour == 21 or ts_hour == 22) and 45 <= ts.minute or ts.minute < 15)
            
            # 4. Stuck cooling auxiliary pump on Robotic_Welder_1 (always draws 6kW instead of 3kW when idle, showing vibration but no thermal spike)
            is_welder_fault = (m_id == "Robotic_Welder_1" and not in_schedule)
            
            state = "shutdown"
            if in_schedule and sched_type == "planned_production":
                state = "running"
                if is_lunch or (is_changeover and np.random.rand() > 0.3):
                    state = "idle"
            elif in_schedule and sched_type == "maintenance":
                state = "running" # Maintenance running tests
            elif is_weekend_waste or is_welder_fault:
                state = "idle"
            
            # Calculate Power metrics based on state
            if state == "running":
                kw = m["active_kw"] + np.random.normal(0, m["active_kw"] * 0.1)
                pf = m["pf"] + np.random.normal(0, 0.02)
                # Sensor readings
                temp = m["thermal_run"] + np.random.normal(0, 3.0)
                vib = m["acoustic_run"] + np.random.normal(0, 2.0)
            elif state == "idle":
                # Welders stuck pump draws more idle than base
                if m_id == "Robotic_Welder_1" and is_welder_fault:
                    kw = 7.0 + np.random.normal(0, 0.5) # stuck coolant pump
                else:
                    kw = m["base_kw"] + np.random.normal(0, m["base_kw"] * 0.05)
                pf = 0.55 + np.random.normal(0, 0.05) # lower power factor when idle
                
                # Multi-modal validation signatures:
                # If CNC_Mill_1 is left ON on weekends (weekend waste), it has power draw but zero acoustic vibration
                # and normal ambient thermal.
                if is_weekend_waste:
                    temp = 25.0 + np.random.normal(0, 1.0) # ambient temperature
                    vib = 30.0 + np.random.normal(0, 1.0)  # ambient noise (no vibration)
                elif m_id == "Robotic_Welder_1" and is_welder_fault:
                    # Stuck-on pump: has power draw + vibration (acoustic ~ 55dB), but ambient temperature (welder tip is cold: 26C)
                    temp = 26.0 + np.random.normal(0, 1.0)
                    vib = 58.0 + np.random.normal(0, 2.0)
                else:
                    # Regular idle: cooling fan runs, temp declines slowly towards ambient
                    temp = (m["thermal_run"] * 0.5) + np.random.normal(0, 2.0)
                    vib = 40.0 + np.random.normal(0, 2.0)
            else: # shutdown
                kw = 0.1 + np.random.normal(0, 0.02) # parasitic draw
                kw = max(0.0, kw)
                pf = 0.3 + np.random.normal(0, 0.05)
                temp = 22.0 + np.random.normal(0, 0.5) # room temp
                vib = 25.0 + np.random.normal(0, 0.5)
            
            pf = min(1.0, max(0.1, pf))
            kwh = kw * 0.25 # 15 min interval
            
            energy_rows.append({
                "machine_id": m_id,
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "kwh": round(kwh, 4),
                "kw_demand": round(kw, 2),
                "power_factor": round(pf, 3)
            })
            
            sensor_rows.append({
                "machine_id": m_id,
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": round(temp, 2),
                "acoustic_vibration": round(vib, 2)
            })
            
            # Generate Production logs (every hour)
            if ts.minute == 0 and state == "running":
                # Calculate production units based on active state
                base_units = 15 if m["type"] == "CNC" else (30 if m["type"] == "Molder" else 8)
                units = int(base_units + np.random.normal(0, base_units * 0.15))
                units = max(0, units)
                cycle_time = round(60.0 / max(1, units), 2)
                util = round(85.0 + np.random.normal(0, 5), 2)
                
                production_rows.append({
                    "machine_id": m_id,
                    "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                    "units_produced": units,
                    "cycle_time_min": cycle_time,
                    "utilization_pct": min(100.0, util),
                    "order_backlog_hours": max(0, 168 - int(ts.day * 4)) # backlog decreases over time
                })
            elif ts.minute == 0 and state == "idle":
                # Idle hour, 0 units
                production_rows.append({
                    "machine_id": m_id,
                    "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                    "units_produced": 0,
                    "cycle_time_min": 0.0,
                    "utilization_pct": 0.0,
                    "order_backlog_hours": max(0, 168 - int(ts.day * 4))
                })

        # Save Solar generation
        energy_rows.append({
            "machine_id": "Solar_PV_System",
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "kwh": round(solar_gen * 0.25, 4),
            "kw_demand": round(solar_gen, 2),
            "power_factor": 0.99
        })

    print("Writing files...")
    pd.DataFrame(energy_rows).to_csv(f"{output_dir}/energy_readings.csv", index=False)
    pd.DataFrame(sensor_rows).to_csv(f"{output_dir}/sensor_readings.csv", index=False)
    pd.DataFrame(production_rows).to_csv(f"{output_dir}/production_logs.csv", index=False)
    
    print("Synthetic Data Generation Complete!")

if __name__ == "__main__":
    generate_synthetic_data()
