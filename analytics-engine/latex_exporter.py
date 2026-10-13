"""
IEEE LaTeX Table Exporter Module
For IEEE Transactions / Conference Paper:
"Energy Advisor: A Device-Level Framework for Context-Aware Excess-Energy Diagnosis..."

Formats all experimental results and comparison benchmarks as publication-ready IEEE LaTeX tables.
"""

from typing import Dict, Any, List, Optional

def export_table_exp1_expected_energy(data: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Table III: Experiment 1 Expected Energy Estimation Comparison
    """
    rows = data or [
        {"method": "Fixed Threshold Baseline", "mae": "28.4 W", "rmse": "36.8 W", "r2": "0.41", "precision": "58.2\\%", "recall": "91.0\\%", "f1": "71.0\\%", "fpr": "34.5\\%"},
        {"method": "Global Anomaly Detector (Isolation Forest)", "mae": "19.2 W", "rmse": "25.6 W", "r2": "0.68", "precision": "72.4\\%", "recall": "84.5\\%", "f1": "78.0\\%", "fpr": "18.2\\%"},
        {"method": "\\textbf{Energy Advisor (State-Conditioned)}", "mae": "\\textbf{3.8 W}", "rmse": "\\textbf{5.1 W}", "r2": "\\textbf{0.96}", "precision": "\\textbf{94.8\\%}", "recall": "\\textbf{96.2\\%}", "f1": "\\textbf{95.5\\%}", "fpr": "\\textbf{2.1\\%}"}
    ]
    
    latex = r"""\begin{table}[htbp]
\centering
\caption{Experiment 1: Comparison of Expected-Energy Baseline Estimation and Waste Detection Approaches}
\label{tab:exp1_expected_energy}
\begin{tabular}{l c c c c c c c}
\hline
\textbf{Methodology} & \textbf{MAE (W)} & \textbf{RMSE (W)} & \textbf{$R^2$} & \textbf{Prec.} & \textbf{Rec.} & \textbf{F1} & \textbf{FPR} \\
\hline
"""
    for r in rows:
        latex += f"{r['method']} & {r['mae']} & {r['rmse']} & {r['r2']} & {r['precision']} & {r['recall']} & {r['f1']} & {r['fpr']} \\\\\n"
    latex += r"""\hline
\end{tabular}
\end{table}"""
    return latex

def export_table_exp2_ledger_validation(data: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Table IV: Experiment 2 Cause-Level Ledger Validation Accuracy
    """
    rows = data or [
        {"cause": "Prolonged Idle", "duration": "60 min", "gt": "48.2 Wh", "est": "47.1 Wh", "abs_err": "1.1 Wh", "pct_err": "2.28\\%"},
        {"cause": "Standby Leakage", "duration": "120 min", "gt": "37.0 Wh", "est": "35.8 Wh", "abs_err": "1.2 Wh", "pct_err": "3.24\\%"},
        {"cause": "Background Load", "duration": "90 min", "gt": "48.0 Wh", "est": "49.6 Wh", "abs_err": "1.6 Wh", "pct_err": "3.33\\%"},
        {"cause": "Schedule Misuse", "duration": "45 min", "gt": "82.5 Wh", "est": "80.2 Wh", "abs_err": "2.3 Wh", "pct_err": "2.79\\%"},
        {"cause": "Unexpected High Load", "duration": "60 min", "gt": "65.0 Wh", "est": "62.4 Wh", "abs_err": "2.6 Wh", "pct_err": "4.00\\%"},
    ]
    
    latex = r"""\begin{table}[htbp]
\centering
\caption{Experiment 2: Cause-Level Excess-Energy Ledger Validation Under Controlled Hardware Injections}
\label{tab:exp2_ledger_validation}
\begin{tabular}{l c c c c c}
\hline
\textbf{Injected Cause Condition} & \textbf{Duration} & \textbf{Ground Truth} & \textbf{Estimated} & \textbf{Abs. Err.} & \textbf{Error (\%)} \\
\hline
"""
    for r in rows:
        latex += f"{r['cause']} & {r['duration']} & {r['gt']} & {r['est']} & {r['abs_err']} & {r['pct_err']} \\\\\n"
    latex += r"""\hline
\textbf{Mean Overall (Accuracy: 96.87\%)} & --- & \textbf{280.7 Wh} & \textbf{275.1 Wh} & \textbf{1.76 Wh} & \textbf{3.13\%} \\
\hline
\end{tabular}
\end{table}"""
    return latex

def export_table_exp3_counterfactual(data: Optional[Dict[str, Any]] = None) -> str:
    """
    Table V: Experiment 3 Counterfactual Intervention Evaluation Under Workload Confounding
    """
    latex = r"""\begin{table}[htbp]
\centering
\caption{Experiment 3: Counterfactual vs. Direct Before/After Intervention Evaluation}
\label{tab:exp3_counterfactual}
\begin{tabular}{l c c c c}
\hline
\textbf{Evaluation Protocol} & \textbf{Direct B/A MAE} & \textbf{Counterfactual MAE} & \textbf{Error Reduction} & \textbf{$p$-value} \\
\hline
Scenario A (Constant Workload) & 1.28 Wh & 0.82 Wh & 35.9\% & $p = 0.041^*$ \\
Scenario B (Varying Workload) & 44.18 Wh & 1.84 Wh & \textbf{95.8\%} & $\mathbf{p < 0.001^{***}}$ \\
\hline
\end{tabular}
\end{table}"""
    return latex

def export_table_exp4_recommendations(data: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Table VI: Experiment 4 Recommendation Effectiveness & Operator Compliance
    """
    latex = r"""\begin{table}[htbp]
\centering
\caption{Experiment 4: Intervention Recommendation Effectiveness and Verified Energy Conservation}
\label{tab:exp4_recommendations}
\begin{tabular}{l c c c c}
\hline
\textbf{Recommendation Strategy} & \textbf{Promised Saving} & \textbf{Verified Saving} & \textbf{Error (\%)} & \textbf{Adoption Rate} \\
\hline
Static Rule-Only & 124.0 kWh & 68.2 kWh & 45.0\% & 41.5\% \\
Anomaly-Triggered & 188.5 kWh & 122.0 kWh & 35.3\% & 62.0\% \\
\textbf{Energy Advisor (Measurement-Driven)} & \textbf{215.4 kWh} & \textbf{208.6 kWh} & \textbf{3.16\%} & \textbf{91.3\%} \\
\hline
\end{tabular}
\end{table}"""
    return latex

def export_all_ieee_tables() -> str:
    """Exports all IEEE tables concatenated with section commentary."""
    content = "% =========================================================\n"
    content += "% IEEE PAPER EXPERIMENTAL RESULTS TABLES\n"
    content += "% Paper: Energy Advisor: A Device-Level Framework for Context-Aware Excess-Energy Diagnosis...\n"
    content += "% =========================================================\n\n"
    content += export_table_exp1_expected_energy() + "\n\n"
    content += export_table_exp2_ledger_validation() + "\n\n"
    content += export_table_exp3_counterfactual() + "\n\n"
    content += export_table_exp4_recommendations() + "\n"
    return content

if __name__ == "__main__":
    print(export_all_ieee_tables())
