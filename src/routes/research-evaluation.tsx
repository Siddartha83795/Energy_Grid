import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ResearchTopNav } from "@/components/energy-advisor/ResearchTopNav";
import { ResearchSidebar } from "@/components/energy-advisor/ResearchSidebar";
import { RESEARCH_METRICS } from "@/lib/energy-advisor-research";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Layers,
  LineChart,
  Percent,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/research-evaluation")({
  head: () => ({
    meta: [{ title: "Research Evaluation & Benchmark — Energy Advisor" }],
  }),
  component: ResearchEvaluationPage,
});

export function ResearchEvaluationPage() {
  const {
    operatingStateClassification: osc,
    expectedEnergyModel: eem,
    excessEnergyDetection: eed,
    causeAttribution: ca,
    baselineComparison,
  } = RESEARCH_METRICS;

  const [selectedCategory, setSelectedCategory] = React.useState<
    | "all"
    | "expected-energy"
    | "excess-detection"
    | "cause-level"
    | "counterfactual"
    | "recommendation"
  >("all");

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Academic Research Evaluation &amp; Benchmark Metrics
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Comprehensive IEEE Manuscript Metrics: Paper Table V, ML baselines, and statistical
                hypothesis validation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Metric Dropdown Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Comprehensive Metrics (Table V)</option>
                <option value="expected-energy">Expected-Energy Metrics</option>
                <option value="excess-detection">Excess-Detection Metrics</option>
                <option value="cause-level">Cause-Level Ledger Metrics</option>
                <option value="counterfactual">Counterfactual Metrics</option>
                <option value="recommendation">Recommendation Metrics</option>
              </select>

              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs font-mono"
              >
                IEEE Validated Data
              </Badge>
            </div>
          </div>

          {/* 4 Core Research ML Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            {/* 1. State Classification */}
            <div className="p-5 rounded-2xl bg-[#0d131f] border border-cyan-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Operating State Classifier
                </span>
                <Cpu className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {(osc.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">Classification Accuracy</div>
              </div>
              <div className="space-y-1 pt-2 border-t border-white/5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Precision:</span>
                  <span className="font-bold text-cyan-300">
                    {(osc.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recall:</span>
                  <span className="font-bold text-cyan-300">{(osc.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">F1 Score:</span>
                  <span className="font-bold text-emerald-400">
                    {(osc.f1Score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Expected Energy Model */}
            <div className="p-5 rounded-2xl bg-[#0d131f] border border-cyan-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Expected Energy Model
                </span>
                <LineChart className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">{eem.mae} W</div>
                <div className="text-[10px] text-slate-400">Mean Absolute Error (MAE)</div>
              </div>
              <div className="space-y-1 pt-2 border-t border-white/5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">RMSE:</span>
                  <span className="font-bold text-cyan-300">{eem.rmse} W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Goodness of Fit (R²):</span>
                  <span className="font-bold text-emerald-400">{eem.rSquared}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model Type:</span>
                  <span className="font-semibold text-slate-300">State-Specific</span>
                </div>
              </div>
            </div>

            {/* 3. Excess Detection */}
            <div className="p-5 rounded-2xl bg-[#0d131f] border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Excess Detection
                </span>
                <Target className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-400">
                  {(eed.precision * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">Detection Precision</div>
              </div>
              <div className="space-y-1 pt-2 border-t border-white/5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recall:</span>
                  <span className="font-bold text-amber-300">{(eed.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">F1 Score:</span>
                  <span className="font-bold text-emerald-400">
                    {(eed.f1Score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">False Positive Rate:</span>
                  <span className="font-bold text-emerald-400">
                    {(eed.falsePositiveRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Cause Attribution */}
            <div className="p-5 rounded-2xl bg-[#0d131f] border border-emerald-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Cause Attribution
                </span>
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">
                  {(ca.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">Attribution Accuracy</div>
              </div>
              <div className="space-y-1 pt-2 border-t border-white/5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Confidence:</span>
                  <span className="font-bold text-emerald-400">
                    {(ca.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signals Used:</span>
                  <span className="font-bold text-cyan-300">5-Modality</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hypotheses Checked:</span>
                  <span className="font-semibold text-slate-300">Top-3 Ranked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 17: BASELINE COMPARISON TABLE */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Scale className="h-4 w-4 text-cyan-400" />
                  Comparative Baseline Evaluation: Method A vs Method B
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Proving superiority of state-conditioned dynamic baseline over static threshold
                  alerting.
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-emerald-500/30 text-emerald-300"
              >
                PROPOSED RESEARCH CONTRIBUTION
              </Badge>
            </div>

            <Table>
              <TableHeader className="bg-slate-900/80 border-b border-white/5 font-mono text-[11px]">
                <TableRow>
                  <TableHead className="text-slate-300">Evaluation Dimension</TableHead>
                  <TableHead className="text-slate-300">Method A (Fixed Threshold)</TableHead>
                  <TableHead className="text-cyan-300">
                    Method B (State-Specific Baseline - Proposed)
                  </TableHead>
                  <TableHead className="text-right text-emerald-400">
                    Research Gain / Improvement
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono text-xs divide-y divide-white/5">
                {baselineComparison.map((row: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-slate-900/40">
                    <TableCell className="font-bold text-white">{row.metric}</TableCell>
                    <TableCell className="text-slate-400">{row.methodA_FixedThreshold}</TableCell>
                    <TableCell className="text-cyan-300 font-bold">
                      {row.methodB_StateSpecific}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-400">
                      {row.improvement}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Academic Viva & Project Note */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <BookOpen className="h-4 w-4" />
              B.Tech Project Demonstration & Technical Viva Notes:
            </div>
            <p className="leading-relaxed">
              • Static power thresholds fail when machines undergo variable computational workloads
              (e.g. video rendering vs idle). A 90 W draw is normal during heavy execution but
              represents major excess wastage during idle user absence.
            </p>
            <p className="leading-relaxed">
              • The Energy Advisor research system couples multi-modal telemetry (power, ambient
              temperature, vibration, user activity) with state classification models to formulate
              true context-aware expected baselines, eliminating 90.1% of false positive anomaly
              alerts.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
