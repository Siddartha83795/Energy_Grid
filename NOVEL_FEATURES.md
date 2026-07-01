# 🌟 Advanced & Novel Features — GenAI Energy Advisor

This document describes the advanced modules implemented in the **GenAI Energy Advisor** prototype and how they address business KPIs.

---

## 1. Agentic Closed-Loop Control
* **How it works:** A multi-agent network (Detection Agent -> Root-Cause Agent -> Action Agent -> Reporting Agent) coordinates tasks. The Action Agent acts as a safety valve: low-risk adjustments are auto-dispatched, while high-impact changes (saving or costing > ₹500, or targeting critical machinery) are queued on the dashboard for manual operator sign-off.
* **Why it's novel:** Standard platforms only report issues, creating alert fatigue. This is a closed-loop agent that can autonomously execute standby commands for low-risk devices while holding high-impact actions for approval.
* **KPI Impact:** **Mean Time to Resolution (MTTR)** of waste events drops from hours to seconds; minimizes operator alert fatigue.

---

## 2. Multi-Modal Signal Fusion
* **How it works:** Cross-validates raw electrical draw with a layered matrix of IoT sensors representing:
  - *Core Electrical*: Power Factor and Harmonics THD.
  - *Mechanical Condition*: Temperature (°C), Vibration (dB), Acoustics (dB), and Load draw current signatures.
  - *Environmental & Auxiliary*: Compressed air flow/pressure (leak detection), HVAC room occupancy, lux levels, and water flow.
  - *Context & Actuation*: Proximity limit switches, operator BLE beacons, actuator relay state, and VFD speed levels.
  - *Data Ingestion Protocols*: Modbus TCP/RTU, OPC-UA, and MQTT protocols.
  - *True Waste vs. Fault*: Confirms true waste when draw is high but vibration/temperature is cold, and operator BLE beacon is absent, vs. stuck contactor relays (high draw, high vibration, operator absent, limit switch open).
* **Why it's novel:** Integrates multi-dimensional telemetry (Layer 0 IoT sensing) to filter false-positive reports and ground AI causal graphs.
* **KPI Impact:** **False Positive Rate (FPR)** reduced by >90%; protects machinery from false shutdown triggers.

---

## 3. Predictive Idle-Window Forecasting
* **How it works:** Trains a Random Forest Classifier per machine on historical schedules, time features, and backlog rates to predict the exact probability of upcoming idle windows (24-48 hours out).
* **Why it's novel:** Traditional tools analyze what happened yesterday. This forecasts upcoming waste risk, allowing managers to adjust shift patterns or power down heaters in advance.
* **KPI Impact:** **Preventative Energy Cost Savings ($)**; optimizes shift-to-shift labor scheduling.

## 4. Causal Explainability Layer
* **How it works:** Generates a directed acyclic node-edge evidence graph in JSON, linking root issues (checklist missed, delay in materials, shift gaps) to the observed peak waste. The LLM consumes this graph to ground its reasoning, outputting confidence scores and specific citations.
* **Why it's novel:** Overcomes LLM "black-box" reasoning and hallucinations by feeding a structured evidence network to the prompt.
* **KPI Impact:** **Operator Trust & Compliance Rate**; ensures auditability of automated recommendations.

---

## 5. Self-Tuning Thresholds
* **How it works:** Rather than a static global idle threshold (e.g., 5 kW), the platform computes dynamic per-machine baselines using a 14-day rolling mean ± 2 standard deviations.
* **Why it's novel:** Automatically adapts as machinery ages or ambient factory floor temperatures shift.
* **KPI Impact:** **Anomaly Sensitivity Accuracies**; zero manual threshold tuning required by engineers.
