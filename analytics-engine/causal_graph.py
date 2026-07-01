import json

def generate_causal_graph(machine_id, anomaly_category, timestamp_str, kw_demand, threshold_kw):
    """
    Generates a node-edge JSON dictionary representing the causal graph for a specific anomaly.
    """
    excess_kw = round(max(0.0, kw_demand - threshold_kw), 2)
    
    nodes = [
        {"id": "anomaly", "label": f"Excess Power Draw (+{excess_kw} kW)", "type": "observed", "color": "#ef4444"},
    ]
    edges = []
    
    if anomaly_category == "true_idle_waste":
        nodes.extend([
            {"id": "cause_1", "label": "No Production Scheduled", "type": "contributor", "color": "#a855f7"},
            {"id": "cause_2", "label": "Missed Operator Shutdown Checklist", "type": "root_cause", "color": "#f97316"},
            {"id": "cause_3", "label": "Shift Changeover Delay", "type": "contributor", "color": "#3b82f6"}
        ])
        edges.extend([
            {"source": "cause_1", "target": "anomaly", "weight": 0.85, "label": "Direct correlation"},
            {"source": "cause_2", "target": "cause_1", "weight": 0.90, "label": "Leaves machine active"},
            {"source": "cause_3", "target": "anomaly", "weight": 0.30, "label": "Short-term idle window"}
        ])
        
    elif anomaly_category == "stuck_auxiliary":
        nodes.extend([
            {"id": "cause_1", "label": "Auxiliary Coolant/Hydraulic Pump Active", "type": "contributor", "color": "#a855f7"},
            {"id": "cause_2", "label": "Stuck Contactor or Relay Fault", "type": "root_cause", "color": "#f97316"},
            {"id": "cause_3", "label": "Vibration Sensor Active / Cold Temp", "type": "evidence", "color": "#10b981"}
        ])
        edges.extend([
            {"source": "cause_1", "target": "anomaly", "weight": 0.95, "label": "Draws standby power"},
            {"source": "cause_2", "target": "cause_1", "weight": 0.80, "label": "Keeps auxiliary closed"},
            {"source": "cause_3", "target": "cause_1", "weight": 0.85, "label": "Validates mechanical activity"}
        ])
        
    elif anomaly_category == "unscheduled_running":
        nodes.extend([
            {"id": "cause_1", "label": "Unscheduled Production Running", "type": "contributor", "color": "#a855f7"},
            {"id": "cause_2", "label": "Order Backlog / Production Target Catch-up", "type": "root_cause", "color": "#f97316"},
            {"id": "cause_3", "label": "Acoustic and Thermal Spike", "type": "evidence", "color": "#10b981"}
        ])
        edges.extend([
            {"source": "cause_1", "target": "anomaly", "weight": 0.90, "label": "Active operating draw"},
            {"source": "cause_2", "target": "cause_1", "weight": 0.75, "label": "Overrides shift plan"},
            {"source": "cause_3", "target": "cause_1", "weight": 0.95, "label": "Confirms thermal load"}
        ])
        
    else: # Default/unknown
        nodes.extend([
            {"id": "cause_1", "label": "Standby State Unoptimized", "type": "contributor", "color": "#a855f7"},
            {"id": "cause_2", "label": "Lack of Standby Sleep Timers", "type": "root_cause", "color": "#f97316"}
        ])
        edges.extend([
            {"source": "cause_1", "target": "anomaly", "weight": 0.60, "label": "Continuous passive draw"},
            {"source": "cause_2", "target": "cause_1", "weight": 0.70, "label": "No automatic shutdown"}
        ])
        
    return {"nodes": nodes, "edges": edges}

if __name__ == "__main__":
    # Quick verification
    graph = generate_causal_graph("CNC_Mill_1", "true_idle_waste", "2026-06-06 12:00:00", 12.5, 4.2)
    print(json.dumps(graph, indent=2))
