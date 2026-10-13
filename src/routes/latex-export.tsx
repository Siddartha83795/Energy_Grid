import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ResearchTopNav } from "@/components/energy-advisor/ResearchTopNav";
import { ResearchSidebar } from "@/components/energy-advisor/ResearchSidebar";
import {
  FileText,
  Copy,
  Download,
  Check,
  Code2,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/latex-export")({
  head: () => ({
    meta: [
      {
        title: "IEEE LaTeX Table Exporter — Energy Advisor Research",
      },
    ],
  }),
  component: LatexExportPage,
});

const TABLE_SNIPPETS: Record<string, { title: string; label: string; code: string }> = {
  tab1: {
    title: "Table I: Device State Power Baselines & Tolerances",
    label: "tab:device_states",
    code: `\\begin{table}[htbp]
\\centering
\\caption{Device Operating States, Power Baselines, and Tolerances}
\\label{tab:device_states}
\\begin{tabular}{l c c c c}
\\hline
\\textbf{Operating State} & \\textbf{Nominal (W)} & \\textbf{Tol. ($\\pm$W)} & \\textbf{Min Power (W)} & \\textbf{Max Power (W)} \\\\
\\hline
Active / Execution & 145.0 & 18.0 & 110.0 & 210.0 \\\\
Low Load / Standby & 32.5 & 4.0 & 26.0 & 40.0 \\\\
Idle & 12.0 & 2.5 & 8.0 & 16.0 \\\\
Deep Sleep / Off & 1.2 & 0.4 & 0.0 & 2.0 \\\\
\\hline
\\end{tabular}
\\end{table}`,
  },
  tab3: {
    title: "Table III: Experiment 1 Expected-Energy Estimation Comparison",
    label: "tab:exp1_expected_energy",
    code: `\\begin{table}[htbp]
\\centering
\\caption{Experiment 1: Comparison of Expected-Energy Baseline Estimation and Waste Detection Approaches}
\\label{tab:exp1_expected_energy}
\\begin{tabular}{l c c c c c c c}
\\hline
\\textbf{Methodology} & \\textbf{MAE (W)} & \\textbf{RMSE (W)} & \\textbf{$R^2$} & \\textbf{Prec.} & \\textbf{Rec.} & \\textbf{F1} & \\textbf{FPR} \\\\
\\hline
Fixed Threshold Baseline & 28.4 & 36.8 & 0.41 & 58.2\\% & 91.0\\% & 71.0\\% & 34.5\\% \\\\
Global Anomaly (IsoForest) & 19.2 & 25.6 & 0.68 & 72.4\\% & 84.5\\% & 78.0\\% & 18.2\\% \\\\
\\textbf{Energy Advisor (State-Cond.)} & \\textbf{3.8} & \\textbf{5.1} & \\textbf{0.96} & \\textbf{94.8\\%} & \\textbf{96.2\\%} & \\textbf{95.5\\%} & \\textbf{2.1\\%} \\\\
\\hline
\\end{tabular}
\\end{table}`,
  },
  tab4: {
    title: "Table IV: Experiment 2 Cause-Level Excess-Energy Ledger Validation",
    label: "tab:exp2_ledger_validation",
    code: `\\begin{table}[htbp]
\\centering
\\caption{Experiment 2: Cause-Level Excess-Energy Ledger Validation Under Controlled Hardware Injections}
\\label{tab:exp2_ledger_validation}
\\begin{tabular}{l c c c c c}
\\hline
\\textbf{Injected Cause Condition} & \\textbf{Duration} & \\textbf{Ground Truth} & \\textbf{Estimated} & \\textbf{Abs. Err.} & \\textbf{Error (\\%)} \\\\
\\hline
Prolonged Idle & 60 min & 48.2 Wh & 47.1 Wh & 1.1 Wh & 2.28\\% \\\\
Standby Leakage & 120 min & 37.0 Wh & 35.8 Wh & 1.2 Wh & 3.24\\% \\\\
Background Load & 90 min & 48.0 Wh & 49.6 Wh & 1.6 Wh & 3.33\\% \\\\
Schedule Misuse & 45 min & 82.5 Wh & 80.2 Wh & 2.3 Wh & 2.79\\% \\\\
Unexpected High Load & 60 min & 65.0 Wh & 62.4 Wh & 2.6 Wh & 4.00\\% \\\\
\\hline
\\textbf{Overall (Accuracy: 96.87\\%)} & --- & \\textbf{280.7 Wh} & \\textbf{275.1 Wh} & \\textbf{1.76 Wh} & \\textbf{3.13\\%} \\\\
\\hline
\\end{tabular}
\\end{table}`,
  },
  tab5: {
    title: "Table V: Experiment 3 Counterfactual Intervention Evaluation",
    label: "tab:exp3_counterfactual",
    code: `\\begin{table}[htbp]
\\centering
\\caption{Experiment 3: Counterfactual vs. Direct Before/After Intervention Evaluation}
\\label{tab:exp3_counterfactual}
\\begin{tabular}{l c c c c}
\\hline
\\textbf{Evaluation Protocol} & \\textbf{Direct B/A MAE} & \\textbf{Counterfactual MAE} & \\textbf{Error Reduction} & \\textbf{$p$-value} \\\\
\\hline
Scenario A (Constant Workload) & 1.28 Wh & 0.82 Wh & 35.9\\% & $p = 0.041^*$ \\\\
Scenario B (Varying Workload) & 44.18 Wh & 1.84 Wh & \\textbf{95.8\\%} & $\\mathbf{p < 0.001^{***}}$ \\\\
\\hline
\\end{tabular}
\\end{table}`,
  },
  tab6: {
    title: "Table VI: Experiment 4 Intervention Recommendation Effectiveness",
    label: "tab:exp4_recommendations",
    code: `\\begin{table}[htbp]
\\centering
\\caption{Experiment 4: Intervention Recommendation Effectiveness and Verified Energy Conservation}
\\label{tab:exp4_recommendations}
\\begin{tabular}{l c c c c}
\\hline
\\textbf{Recommendation Strategy} & \\textbf{Promised Saving} & \\textbf{Verified Saving} & \\textbf{Error (\\%)} & \\textbf{Adoption Rate} \\\\
\\hline
Static Rule-Only Heuristic & 124.0 kWh & 68.2 kWh & 45.0\\% & 41.5\\% \\\\
Anomaly-Triggered & 188.5 kWh & 122.0 kWh & 35.3\\% & 62.0\\% \\\\
\\textbf{Energy Advisor (Meas.-Driven)} & \\textbf{215.4 kWh} & \\textbf{208.6 kWh} & \\textbf{3.16\\%} & \\textbf{91.3\\%} \\\\
\\hline
\\end{tabular}
\\end{table}`,
  },
};

export function LatexExportPage() {
  const [selectedKey, setSelectedKey] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  const getCombinedCode = () => {
    if (selectedKey !== "ALL") {
      return TABLE_SNIPPETS[selectedKey]?.code || "";
    }
    return (
      `% ========================================================================\n` +
      `% IEEE TRANSACTIONS ON INDUSTRIAL INFORMATICS / SMART GRID\n` +
      `% Tables for: Energy Advisor: A Device-Level Framework for Context-Aware\n` +
      `% Excess-Energy Diagnosis and Workload-Conditioned Intervention Evaluation\n` +
      `% ========================================================================\n\n` +
      Object.values(TABLE_SNIPPETS)
        .map((s) => `% --- ${s.title} ---\n` + s.code)
        .join("\n\n")
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCombinedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([getCombinedCode()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download =
      selectedKey === "ALL" ? "energy_advisor_ieee_tables.tex" : `${selectedKey}.tex`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans">
      <ResearchSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <ResearchTopNav />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="border-cyan-500/40 text-cyan-300 bg-cyan-950/30 text-xs font-mono"
                >
                  MANUSCRIPT ASSETS
                </Badge>
                <Badge
                  variant="outline"
                  className="border-purple-500/40 text-purple-300 bg-purple-950/30 text-xs font-mono"
                >
                  IEEE TRANSACTION FORMAT
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-display">
                IEEE Publication LaTeX Table Exporter
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Export all experimental validation results directly as IEEE-formatted LaTeX tables
                with exact captions, labels, and alignment.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-white/10 bg-slate-900/60 hover:bg-slate-800 text-xs gap-1.5"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-cyan-400" />
                )}
                {copied ? "Copied to Clipboard" : "Copy LaTeX"}
              </Button>

              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download .tex File
              </Button>
            </div>
          </div>

          {/* Table Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedKey("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedKey === "ALL"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  : "bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white"
              }`}
            >
              All Tables Combined
            </button>
            {Object.entries(TABLE_SNIPPETS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedKey === key
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white"
                }`}
              >
                {item.title.split(":")[0]}
              </button>
            ))}
          </div>

          {/* Code Viewer Card */}
          <Card className="bg-[#0b1324] border-white/10">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-cyan-400" />
                  {selectedKey === "ALL"
                    ? "Complete Manuscript Tables (.tex)"
                    : TABLE_SNIPPETS[selectedKey]?.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Standard IEEE LaTeX table syntax using standard booktabs / tabular notation
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-[#060a12] p-5 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto border border-white/10 leading-relaxed">
                {getCombinedCode()}
              </pre>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
