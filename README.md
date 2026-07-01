# GenAI Energy Advisor — Industrial Energy Analytics & Optimization Platform

GenAI Energy Advisor is an academic + portfolio-grade prototype of an industrial energy-monitoring and optimization platform. It combines IoT/meter data analytics with a Generative AI insight layer and closed-loop multi-agent orchestration.

---

## 🏗️ System Architecture

The prototype is built with a highly modular structure to make it easy to swap mock or simulated components for production ones:

```
Layer 0 — IoT Sensing & Edge Layer
Smart meters/CTs, vibration/acoustic/thermal sensors, PLC digital I/O taps,
edge gateways (Modbus/OPC-UA/MQTT) → local buffering & pre-filtering →
pushed to Layer 1 ingestion broker.

/data-ingestion      -> Synthetic data generator + SQLite seeder
/analytics-engine    -> Anomaly detection, KMeans clustering, Random Forest forecasting, Causal graph, Solar optimizer
/agents              -> Logical Multi-Agent system (Detection, Root-Cause, Action, Reporting)
/genai               -> Claude API wrapper (with Groq fallback) & Pydantic output validation schemas
/reporting           -> ReportLab-based PDF report compiler
/dashboard           -> Dark-themed, glassmorphism Streamlit UI
/config              -> YAML configs for tariffs, emission factors, and threshold configurations
/tests               -> Unit tests for analytics, schemas, and closed-loop control
```


---

## ⚡ Key Features

1. **Self-Tuning Thresholds**: dynamic baselines computed per-machine using a rolling window of idle energy draw (mean + N std dev).
2. **Multi-Modal Signal Fusion**: cross-validates electrical anomalies with vibration and thermal readings to differentiate true waste from stuck contactors.
3. **Agentic Closed-Loop Control**: logical handoff from Detection -> Root-Cause (LLM reasoning over context) -> Action (auto-standby or approval queuing) -> Reporting (narrative generation).
4. **Tariff & Solar Optimization**: suggests shifts to solar generation curves or night tariff bands, calculating CO2e footprint offsets.
5. **Idle-Window Forecasting**: Machine Learning models predicting waste probability for the next 48 hours.
6. **Causal Explainability Layer**: node-edge evidence graphs detailing candidate factors for anomalies, grounding LLM outputs.

---

## 🚀 How to Run

### Method 1: Local Pip Run (Recommended for speed)

1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**:
   Create a `.env` file from the template `.env.example`:
   ```env
   ANTHROPIC_API_KEY=your_key_here
   GROQ_API_KEY=your_groq_key_here
   DB_PATH=energy_advisor.db
   ```
   *Note: If no keys are provided, the system falls back to a safe mock responder automatically.*

3. **Start the Dashboard**:
   ```bash
   streamlit run dashboard/app.py
   ```
   *This automatically seeds the SQLite database (`energy_advisor.db`) with 30 days of data if it doesn't exist.*

### Method 2: Docker Compose Run

1. **Build and Start Containers**:
   ```bash
   docker-compose up --build
   ```

2. **Access UI**:
   Open browser at: [http://localhost:8501](http://localhost:8501)

---

## 🔄 Production Swapping Guide

| Prototype Component | SQLite/Local File | Production swap-in | Connection Mechanism |
| :--- | :--- | :--- | :--- |
| **IoT Hardware & Protocols** | Simulated nodes (`getSensorReadings`) | Smart energy meters / CT clamps, MEMS accelerometers, acoustic & flow sensors, Modbus/OPC-UA/MQTT gateway | Connect physical sensors to edge gateway; send JSON telemetry payloads |
| **Data Layer** | SQLite (`energy_advisor.db`) | PostgreSQL + TimescaleDB | Swap SQLAlchemy connection URIs |
| **Ingestion** | `generator.py` CSV seeder | Kafka / MQTT Broker | Ingest JSON packets from IoT brokers directly into ETL |
| **Analytics** | Scikit-learn Random Forest | Apache Spark ML / Databricks | Distribute calculations across clusters for high volume |
| **Orchestration** | Sequential JSON Handoff | Apache Airflow / Temporal | Schedule tasks and workflows using DAGs |
| **GenAI** | Claude REST API wrapper | Enterprise AWS Bedrock | Switch endpoint calls to secure cloud VPC gateways |

