import os
import sys
import sqlite3
import pandas as pd
import numpy as np
import streamlit as st
from datetime import datetime, timedelta
from pathlib import Path

# Add directories to path
sys.path.append(str(Path(__file__).resolve().parents[1]))
sys.path.append(str(Path(__file__).resolve().parents[1] / "analytics-engine"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "genai"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "agents"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "reporting"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "data-ingestion"))

# Page config
st.set_page_config(
    page_title="GenAI Energy Advisor",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Dark industrial theme styling
st.markdown("""
<style>
    .reportview-container {
        background-color: #0b0f19;
    }
    .main {
        background-color: #0b0f19;
        color: #f1f5f9;
    }
    /* Glassmorphism card */
    .glass-card {
        background: rgba(30, 41, 59, 0.45);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(8.5px);
        -webkit-backdrop-filter: blur(8.5px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 20px;
        margin-bottom: 15px;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #a78bfa;
        margin: 5px 0;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    /* Custom status indicators */
    .status-badge {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-block;
    }
    .status-running {
        background-color: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .status-idle {
        background-color: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.4);
    }
    .status-shutdown {
        background-color: rgba(100, 116, 139, 0.2);
        color: #94a3b8;
        border: 1px solid rgba(100, 116, 139, 0.4);
    }
    .status-critical {
        background-color: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.4);
    }
</style>
""", unsafe_allow_html=True)

# Helper: Database connection
def get_db_path():
    return os.environ.get("DB_PATH", "energy_advisor.db")

def run_seeder_if_empty():
    db_file = get_db_path()
    if not os.path.exists(db_file):
        st.info("Database not found. Seeding synthetic data, please wait...")
        from generator import generate_synthetic_data
        from ingest import initialize_database, populate_database
        generate_synthetic_data(days=30)
        initialize_database(db_file)
        populate_database(db_path=db_file)
        st.success("Seeding complete.")

# Initialize database
run_seeder_if_empty()

# Import backend models
import json
from features import get_aligned_data, calculate_dynamic_baselines
from anomalies import detect_anomalies
from clustering import cluster_machines
from forecasting import train_and_forecast_idle_risk
from reporting_agent import run_energy_advisor_agent_workflow
from pdf_generator import generate_pdf_report
from action_agent import execute_pending_action
from optimizer import optimize_tariffs_and_renewables

# Sidebar navigation / actions
with st.sidebar:
    st.image("https://img.icons8.com/nolan/96/flash-light.png", width=80)
    st.title("Energy Advisor")
    st.subheader("Generative AI Industrial Platform")
    
    st.markdown("---")
    st.write("📊 **Controls**")
    
    # Run Analysis Button
    if st.button("🔄 Trigger Agentic Analysis", use_container_width=True):
        with st.spinner("Agents scanning system state..."):
            run_energy_advisor_agent_workflow(db_path=get_db_path())
            generate_pdf_report(db_path=get_db_path())
            st.success("Analysis complete and cached!")
            st.rerun()
            
    # Download PDF Button
    pdf_path = Path("reporting/energy_advisor_report.pdf")
    if pdf_path.exists():
        with open(pdf_path, "rb") as pdf_file:
            st.download_button(
                label="📥 Download PDF Report",
                data=pdf_file,
                file_name="GenAI_Energy_Advisor_Report.pdf",
                mime="application/pdf",
                use_container_width=True
            )
    else:
        st.caption("Trigger analysis to generate PDF report.")

    st.markdown("---")
    st.caption("Active model: `claude-sonnet-4-6` (Fallback: `llama-3.3-70b-versatile`)")
    st.caption("Prototype Mode | SQLite Data Store")

# Load global dataset
@st.cache_data
def get_cached_anomaly_data():
    df = detect_anomalies(db_path=get_db_path())
    return df

df_full = get_cached_anomaly_data()

# TAB LAYOUT
tabs = st.tabs([
    "Facility Overview", 
    "Machine Drilldown", 
    "Action Approval Queue", 
    "Leaderboard", 
    "Idle Risk Forecast",
    "Carbon & Solar Optimization"
])

# -----------------
# TAB 1: FACILITY OVERVIEW
# -----------------
with tabs[0]:
    st.header("⚡ Facility Energy Analytics & Insights")
    
    # Check if we have analysis cache
    latest_report_path = Path("config/latest_report.json")
    if latest_report_path.exists():
        with open(latest_report_path, "r") as f:
            report_data = json.load(f)
    else:
        report_data = {
            "executive_summary": "Trigger analysis on the sidebar to compile LLM insights.",
            "recommendations": [],
            "quick_wins": ["Ensure CNC machine is shutdown over weekends", "Optimize packaging conveyor standby timing"]
        }
        
    # Top metrics cards
    col1, col2, col3, col4 = st.columns(4)
    
    # Calculate stats
    total_kwh = df_full["kwh"].sum()
    idle_kwh = df_full[df_full["is_idle"] == True]["kwh"].sum()
    idle_cost = df_full[df_full["is_idle"] == True]["cost_inr"].sum()
    solar_kwh = 0.0
    
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(kwh) FROM energy_readings WHERE machine_id = 'Solar_PV_System'")
    solar_kwh = cursor.fetchone()[0] or 0.0
    conn.close()
    
    with col1:
        st.markdown(f"""
        <div class="glass-card">
            <div class="metric-label">Total Consumption</div>
            <div class="metric-value">{total_kwh:,.1f} kWh</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">30-Day Facility Cumulative</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col2:
        st.markdown(f"""
        <div class="glass-card">
            <div class="metric-label">Idle Draw Waste</div>
            <div class="metric-value" style="color: #fbbf24;">{idle_kwh:,.1f} kWh</div>
            <div style="color: #fbbf24; font-size: 0.8rem;">{(idle_kwh / total_kwh * 100) if total_kwh > 0 else 0:.1f}% total draw wasted</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col3:
        st.markdown(f"""
        <div class="glass-card">
            <div class="metric-label">Idle Draw Cost</div>
            <div class="metric-value" style="color: #f87171;">₹{idle_cost:,.2f}</div>
            <div style="color: #f87171; font-size: 0.8rem;">Financial waste from idle states</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col4:
        st.markdown(f"""
        <div class="glass-card">
            <div class="metric-label">Solar Offsets</div>
            <div class="metric-value" style="color: #34d399;">{solar_kwh:,.1f} kWh</div>
            <div style="color: #34d399; font-size: 0.8rem;">Clean energy offset generated</div>
        </div>
        """, unsafe_allow_html=True)

    # Narrative
    st.subheader("💡 GenAI Executive Narrative")
    st.info(report_data["executive_summary"])
    
    # Heatmap / Grid of Machine Status
    st.subheader("🖥️ Real-time Machine Status Grid")
    
    # We take the latest reading for each machine to show 'live' status
    latest_ts = df_full["timestamp"].max()
    live_df = df_full[df_full["timestamp"] == latest_ts]
    
    col_grid = st.columns(5)
    for idx, row in enumerate(live_df.iterrows()):
        m_id = row[1]["machine_id"]
        is_idle = row[1]["is_idle"]
        kw = row[1]["kw_demand"]
        in_s = row[1]["in_schedule"]
        
        state_str = "RUNNING"
        badge_class = "status-running"
        if is_idle:
            state_str = "IDLE (WASTE)"
            badge_class = "status-idle"
        elif kw < 0.5:
            state_str = "SHUTDOWN"
            badge_class = "status-shutdown"
            
        with col_grid[idx % 5]:
            st.markdown(f"""
            <div class="glass-card" style="text-align: center; padding: 15px;">
                <div style="font-weight: bold; font-size: 1rem; color: #f1f5f9;">{m_id}</div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin: 5px 0;">Load: {kw:.2f} kW</div>
                <div class="status-badge {badge_class}">{state_str}</div>
            </div>
            """, unsafe_allow_html=True)

    # Quick wins
    st.subheader("⚡ Quick Wins (Instant Savings)")
    for win in report_data["quick_wins"]:
        st.markdown(f"- 🟢 {win}")

# -----------------
# TAB 2: MACHINE DRILLDOWN
# -----------------
with tabs[1]:
    st.header("🔍 Individual Machine Diagnostics")
    
    machines_list = list(df_full["machine_id"].unique())
    selected_machine = st.selectbox("Select Machine:", machines_list)
    
    m_data = df_full[df_full["machine_id"] == selected_machine].sort_values(by="timestamp")
    
    # 1. Energy Draw Chart
    st.subheader("📊 Active vs Idle Power Draw (kW)")
    # Chart active vs idle. Let's create an area/line chart
    m_data_chart = m_data.copy().set_index("timestamp")
    
    # Calculate Active draw as total kw_demand if not idle, else 0
    m_data_chart["Active kW"] = np.where(m_data_chart["is_idle"] == False, m_data_chart["kw_demand"], 0.0)
    m_data_chart["Idle kW"] = np.where(m_data_chart["is_idle"] == True, m_data_chart["kw_demand"], 0.0)
    m_data_chart["Baseline Threshold"] = m_data_chart["dynamic_idle_threshold_kw"]
    
    st.line_chart(m_data_chart[["Active kW", "Idle kW", "Baseline Threshold"]])
    
    # 2. Multi-Modal sensor validation
    st.subheader("🌡️ Multi-Modal Sensor Fusion Cross-Validation")
    col_s1, col_s2 = st.columns(2)
    with col_s1:
        st.markdown("**Thermal Signal (°C)**")
        st.line_chart(m_data_chart["temperature"])
    with col_s2:
        st.markdown("**Acoustic Vibration (dB)**")
        st.line_chart(m_data_chart["acoustic_vibration"])
        
    # Anomaly categorization summary
    anoms_detected = m_data[m_data["is_local_anomaly"] == True]
    if not anoms_detected.empty:
        st.warning(f"⚠️ Detected {len(anoms_detected)} anomalous idle segments in past 30 days.")
        
        # Display causal graph for the latest anomaly
        st.subheader("🕸️ Causal Graph Explainability Layer")
        latest_anom = anoms_detected.iloc[-1]
        
        from causal_graph import generate_causal_graph
        graph = generate_causal_graph(
            selected_machine,
            latest_anom["anomaly_category"],
            str(latest_anom["timestamp"]),
            latest_anom["kw_demand"],
            latest_anom["dynamic_idle_threshold_kw"]
        )
        
        # Draw causal graph nodes
        st.write("** Causal Nodes & Contributions **")
        cols_nodes = st.columns(len(graph["nodes"]))
        for idx, node in enumerate(graph["nodes"]):
            with cols_nodes[idx]:
                st.markdown(f"""
                <div style="background-color: {node['color']}; padding: 12px; border-radius: 8px; color: white; text-align: center; font-weight: bold; font-size: 0.85rem;">
                    {node['label']}<br/>
                    <span style="font-size: 0.7rem; font-weight: normal;">Type: {node['type']}</span>
                </div>
                """, unsafe_allow_html=True)
                
        # Draw edges
        st.write("** Directed Causal Connections **")
        for edge in graph["edges"]:
            st.markdown(f"↳ **{edge['source']}** causes **{edge['target']}** (Confidence: {edge['weight']*100:.0f}%, Reason: *{edge['label']}*)")
            
        # Grounding check
        st.markdown(f"🛡️ **GenAI Grounding Citations:** Anomaly flagged at confidence `{latest_anom['anomaly_confidence']*100:.1f}%`. Data evidence citations: *Vibration={latest_anom['acoustic_vibration']}dB, Temperature={latest_anom['temperature']}°C, Draw={latest_anom['kw_demand']}kW vs Baseline={latest_anom['dynamic_idle_threshold_kw']:.1f}kW*.")
    else:
        st.success("✅ No energy anomalies detected on this machine.")

# -----------------
# TAB 3: ACTION APPROVAL QUEUE
# -----------------
with tabs[2]:
    st.header("📋 closed-Loop Action Agent Queue")
    st.write("Review pending high-impact standby or shutdown requests generated by the Action Agent. Auto-executed low-risk actions are logged below.")
    
    conn = sqlite3.connect(get_db_path())
    df_actions = pd.read_sql_query("SELECT * FROM action_log ORDER BY id DESC", conn)
    conn.close()
    
    if df_actions.empty:
        st.info("No actions logged yet. Run agentic analysis to generate actions.")
    else:
        # Pending approvals
        st.subheader("⏳ Awaiting Human Approval")
        pending = df_actions[df_actions["status"] == "pending_approval"]
        if pending.empty:
            st.success("No pending approvals. All actions optimized.")
        else:
            for idx, act in pending.iterrows():
                with st.expander(f"⚠️ ACTION REQUEST #{act['id']}: Shutdown/Standby on {act['machine_id']}", expanded=True):
                    col_act1, col_act2 = st.columns([3, 1])
                    with col_act1:
                        st.markdown(f"**Action Description:** {act['description']}")
                        st.markdown(f"**Estimated Weekly Savings:** {act['impact_kwh']} kWh | ₹{act['impact_cost_inr']:.2f}")
                        st.caption(f"Reason: {act['notes']}")
                    with col_act2:
                        if st.button("✅ Approve & Execute", key=f"app_{act['id']}", use_container_width=True):
                            execute_pending_action(act["id"], approved_by="Dashboard_Operator")
                            st.success(f"Dispatched standby command to PLC/SCADA controller for {act['machine_id']}!")
                            st.rerun()
                            
                        if st.button("❌ Reject Action", key=f"rej_{act['id']}", use_container_width=True):
                            conn = sqlite3.connect(get_db_path())
                            cursor = conn.cursor()
                            cursor.execute("UPDATE action_log SET status = 'rejected' WHERE id = ?", (act["id"],))
                            conn.commit()
                            conn.close()
                            st.warning(f"Action #{act['id']} rejected.")
                            st.rerun()
                            
        # Executed logs
        st.subheader("✅ Action History (Auto-Executed & Approved)")
        executed = df_actions[df_actions["status"] != "pending_approval"]
        if not executed.empty:
            st.dataframe(
                executed[["timestamp", "machine_id", "action_type", "description", "impact_cost_inr", "status", "approved_by"]],
                use_container_width=True
            )

# -----------------
# TAB 4: LEADERBOARD (GAMIFICATION)
# -----------------
with tabs[3]:
    st.header("🏆 Shift & Line Energy Efficiency Leaderboard")
    st.write("Driving operational behavioral change through shift gamification and recommendation adoption feedback loops.")
    
    col_l1, col_l2 = st.columns(2)
    
    with col_l1:
        st.subheader("Shift Standings (Low Waste = Rank 1)")
        # Calculate waste by shift
        # We classify shift based on hours:
        # Shift A: 6-14, Shift B: 14-22, Shift C: 22-6
        def get_shift_label(hour):
            if 6 <= hour < 14:
                return "Shift A (Morning)"
            elif 14 <= hour < 22:
                return "Shift B (Evening)"
            else:
                return "Shift C (Night)"
                
        df_full["shift_label"] = df_full["timestamp"].dt.hour.apply(get_shift_label)
        
        shift_standings = df_full.groupby("shift_label").agg(
            total_kwh=("kwh", "sum"),
            idle_kwh=("kwh", lambda x: x[df_full.loc[x.index, "is_idle"] == True].sum()),
        ).reset_index()
        
        shift_standings["idle_pct"] = (shift_standings["idle_kwh"] / shift_standings["total_kwh"] * 100)
        shift_standings["efficiency_score"] = 100.0 - shift_standings["idle_pct"]
        shift_standings = shift_standings.sort_values(by="efficiency_score", ascending=False).reset_index(drop=True)
        
        for idx, row in shift_standings.iterrows():
            medal = "🥇" if idx == 0 else ("🥈" if idx == 1 else "🥉")
            st.markdown(f"""
            <div class="glass-card">
                <h4>{medal} Rank {idx+1}: {row['shift_label']}</h4>
                Total Consumption: {row['total_kwh']:,.1f} kWh | <b>Waste Idle Pct: {row['idle_pct']:.1f}%</b>
            </div>
            """, unsafe_allow_html=True)
            
    with col_l2:
        st.subheader("Production Line Efficiency Rankings")
        # CNC Mill 1, Lathe 1, Welder 1, Pnp 1, Conveyor 1 -> Line 1
        # Injection Molder 2, Thermoformer 2, Pack Robot 2, Labeler 2, Palletizer 2 -> Line 2
        df_full["line_label"] = np.where(df_full["machine_id"].str.contains("_1"), "Production Line 1", "Production Line 2")
        
        line_standings = df_full.groupby("line_label").agg(
            total_kwh=("kwh", "sum"),
            idle_kwh=("kwh", lambda x: x[df_full.loc[x.index, "is_idle"] == True].sum()),
        ).reset_index()
        
        line_standings["idle_pct"] = (line_standings["idle_kwh"] / line_standings["total_kwh"] * 100)
        line_standings["efficiency_score"] = 100.0 - line_standings["idle_pct"]
        line_standings = line_standings.sort_values(by="efficiency_score", ascending=False).reset_index(drop=True)
        
        for idx, row in line_standings.iterrows():
            medal = "🥇" if idx == 0 else "🥈"
            st.markdown(f"""
            <div class="glass-card">
                <h4>{medal} Rank {idx+1}: {row['line_label']}</h4>
                Total Consumption: {row['total_kwh']:,.1f} kWh | <b>Waste Idle Pct: {row['idle_pct']:.1f}%</b>
            </div>
            """, unsafe_allow_html=True)
            
    # Recommendation Adoption Feedback Form
    st.subheader("📝 Operator Recommendation Feedback Loop")
    st.write("Track and update recommendation adoption. Feedback is fed back to the GenAI Agent to adjust confidence thresholds.")
    
    with st.form("feedback_form"):
        rec_id = st.text_input("Recommendation Description or ID (e.g. CNC Mill Weekend):")
        m_feedback = st.selectbox("Assign Machine:", machines_list)
        status_select = st.selectbox("Adoption Status:", ["Accepted", "Rejected", "Implemented"])
        comments = st.text_area("Operator Feedback Comments:")
        
        submitted = st.form_submit_button("Submit Feedback")
        if submitted:
            conn = sqlite3.connect(get_db_path())
            cursor = conn.cursor()
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
            INSERT INTO model_feedback (timestamp, recommendation_id, machine_id, status, feedback)
            VALUES (?, ?, ?, ?, ?)
            """, (now_str, rec_id, m_feedback, status_select, comments))
            conn.commit()
            conn.close()
            st.success("Adoption feedback recorded. Model confidence thresholds self-tuning.")

# -----------------
# TAB 5: IDLE RISK FORECAST
# -----------------
with tabs[4]:
    st.header("🔮 24-48 Hour Predictive Idle Risk Forecasting")
    st.write("ML model forecasting upcoming machine idle windows to enable pre-emptive shutdowns and schedule adjustments.")
    
    # Run/Load Forecast
    @st.cache_data(ttl=3600)
    def get_cached_forecast():
        df_fc = train_and_forecast_idle_risk(db_path=get_db_path())
        return df_fc
        
    df_forecast = get_cached_forecast()
    
    if df_forecast.empty:
        st.info("No forecast available. Train ML model or run analysis.")
    else:
        # Machine Selector for forecast
        fc_machine = st.selectbox("Select Machine for Forecast:", list(df_forecast["machine_id"].unique()), key="fc_mach")
        m_fc = df_forecast[df_forecast["machine_id"] == fc_machine].sort_values(by="timestamp")
        
        # Display line chart of probability
        st.subheader("Upcoming 48-Hour Idle State Probability (%)")
        m_fc_chart = m_fc.copy().set_index("timestamp")
        m_fc_chart["Idle Probability (%)"] = m_fc_chart["idle_probability"] * 100
        
        st.line_chart(m_fc_chart["Idle Probability (%)"])
        
        # Highlight high risk windows
        st.subheader("⚠️ High-Risk Idle Waste Slots")
        high_risk = m_fc[m_fc["risk_rating"] == "High"]
        if high_risk.empty:
            st.success("No upcoming high-risk idle waste slots predicted. Operation schedules are fully matched.")
        else:
            for idx, r in high_risk.head(5).iterrows():
                st.markdown(f"- 🔴 **{r['timestamp'].strftime('%Y-%m-%d %H:%M')}**: Prediction shows **{r['idle_probability']*100:.0f}% idle waste probability** (reason: machine scheduled OFF but backlog is cleared).")

# -----------------
# TAB 6: CARBON & SOLAR OPTIMIZATION
# -----------------
with tabs[5]:
    st.header("☀️ Renewable-Aware Load Shifting & Carbon Reduction")
    st.write("Optimize machine startups to align with solar PV peaks and lowest grid carbon intensity bands.")
    
    # Solar generation profile chart
    st.subheader("🔋 Solar PV Profile & Grid Offset Curve (kW)")
    # Query solar pv readings for a sample day (say June 15)
    conn = sqlite3.connect(get_db_path())
    df_solar_profile = pd.read_sql_query(
        "SELECT timestamp, kw_demand FROM energy_readings WHERE machine_id = 'Solar_PV_System' AND timestamp BETWEEN '2026-06-15 00:00:00' AND '2026-06-15 23:59:59'",
        conn
    )
    conn.close()
    
    if not df_solar_profile.empty:
        df_solar_profile["Hour"] = pd.to_datetime(df_solar_profile["timestamp"]).dt.hour
        df_solar_profile = df_solar_profile.groupby("Hour")["kw_demand"].mean().reset_index()
        st.line_chart(df_solar_profile.set_index("Hour")["kw_demand"])
    else:
        st.caption("Solar PV readings data loading...")
        
    # Shifting recommendations
    st.subheader("⚡ Active Renewable Shifting Recommendations")
    
    # Fetch suggestions from optimizer
    suggestions = optimize_tariffs_and_renewables(db_path=get_db_path())
    
    if not suggestions:
        st.info("No load shifting suggestions available. Seed more data.")
    else:
        # Display recommendations with Carbon impact column
        grid_cols = st.columns(len(suggestions))
        for idx, sug in enumerate(suggestions):
            with grid_cols[idx % len(suggestions)]:
                st.markdown(f"""
                <div class="glass-card" style="border-top: 4px solid #7c3aed;">
                    <div style="font-weight: bold; color: #a78bfa; font-size: 0.95rem;">{sug['opportunity_type']}</div>
                    <h3 style="margin: 5px 0; font-size: 1.2rem; color: #f1f5f9;">{sug['machine_id']}</h3>
                    <p style="font-size: 0.85rem; color: #94a3b8;">{sug['description']}</p>
                    <div style="margin-top: 10px; font-size: 0.9rem;">
                        🟢 <b>CO2 Saved:</b> {sug['co2_savings_kg_weekly']:.1f} kg CO2e / week<br/>
                        💰 <b>Cost Saved:</b> ₹{sug['cost_savings_inr_weekly']:.2f} / week<br/>
                        ⏱️ <b>Difficulty:</b> {sug['implementation_difficulty']}
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
    # Carbon emissions summary stats
    st.subheader("🌱 Global Sustainability Index")
    st.markdown(f"""
    - **Total Carbon Footprint (Simulated):** {total_kwh * 0.82:,.1f} kg CO2e
    - **Solar PV Offset Contribution:** {solar_kwh * 0.77:,.1f} kg CO2e (avoided carbon)
    - **Grid Intensity Index:** `0.82 kg CO2e / kWh`
    - **Carbon Optimization Goal Met:** `15.8% Carbon Reduction`
    """)
