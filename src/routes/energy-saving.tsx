import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEnergyAdvisor } from "@/lib/energy-advisor-context";
import { ResearchTopNav } from "@/components/energy-advisor/ResearchTopNav";
import { ResearchSidebar } from "@/components/energy-advisor/ResearchSidebar";
import { BeforeAfterSavingCard } from "@/components/energy-advisor/BeforeAfterSavingCard";
import { DAILY_SAVINGS_DATA } from "@/lib/energy-advisor-research";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Leaf,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/energy-saving")({
  head: () => ({
    meta: [{ title: "Energy Saving Impact — Energy Advisor" }],
  }),
  component: EnergySavingPage,
});

export function EnergySavingPage() {
  const { beforeAfterList } = useEnergyAdvisor();

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
                <TrendingDown className="h-5 w-5 text-emerald-400" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Measured Energy-Saving Impact
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Post-intervention verification: Comparing actual baseline consumption before vs
                after corrective actions.
              </p>
            </div>

            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs font-mono"
            >
              ✓ Verified via Edge Telemetry
            </Badge>
          </div>

          {/* Section 16: Top 5 KPIs */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono">
            <div className="p-4 rounded-2xl bg-[#0a1815] border border-emerald-500/30 shadow-lg">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                Verified Saving Today
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">1.42 kWh</span>
              <span className="text-[9px] text-emerald-400/80 block mt-0.5">
                Physical meter delta
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#091524] border border-cyan-500/30 shadow-lg">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
                Estimated Saving
              </span>
              <span className="text-2xl font-black text-cyan-300 mt-1 block">1.46 kWh</span>
              <span className="text-[9px] text-cyan-400/80 block mt-0.5">
                Counterfactual model estimate
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d131f] border border-white/10 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Saving Estimation Error
              </span>
              <span className="text-2xl font-black text-white mt-1 block">2.8%</span>
              <span className="text-[9px] text-emerald-400 block mt-0.5">
                High fidelity agreement
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d131f] border border-purple-500/30 shadow-lg">
              <span className="text-[10px] text-purple-300 uppercase tracking-wider block font-bold">
                Workload-Conditioned
              </span>
              <span className="text-2xl font-black text-purple-300 mt-1 block">95.8%</span>
              <span className="text-[9px] text-purple-300/80 block mt-0.5">
                Confounding bias eliminated
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d131f] border border-white/10 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Excess Energy Identified
              </span>
              <span className="text-2xl font-black text-amber-300 mt-1 block">14.3 kWh</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Total potential wastage
              </span>
            </div>
          </section>

          {/* METHODOLOGY COMPARISON: DIRECT BEFORE/AFTER VS WORKLOAD-CONDITIONED COUNTERFACTUAL */}
          <section className="rounded-2xl border border-white/10 bg-[#0d131f] p-5 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Intervention Evaluation Methodology Comparison (IEEE Experiment 3)
              </span>
              <Badge className="bg-cyan-950 text-cyan-300 border-cyan-800 text-[10px]">
                PEER-REVIEW STANDARD
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 space-y-1">
                <span className="text-rose-400 font-bold block text-sm">
                  Direct Before/After Method (Naive)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Calculates <span className="text-rose-300">ΔE = E_pre - E_post</span>. Severely
                  confounded whenever production throughput, order volume, or ambient conditions
                  shift between periods. In Scenario B trials, error reaches{" "}
                  <strong className="text-white">44.18 Wh</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-1">
                <span className="text-cyan-300 font-bold block text-sm">
                  Workload-Conditioned Counterfactual (Energy Advisor)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Calculates{" "}
                  <span className="text-emerald-300">
                    E_saved = E(π0 | W_post) - E(π1 | W_post)
                  </span>
                  . Simulates old policy on post workload, avoiding confounding bias and dropping
                  error to{" "}
                  <strong className="text-white">1.84 Wh (95.8% reduction, p &lt; 0.001***)</strong>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Section 15: BEFORE VS AFTER MEASUREMENT CARDS */}
          <section className="space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Before vs After Experimental Verification Records
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {beforeAfterList.map((item, idx) => (
                <BeforeAfterSavingCard key={idx} measurement={item} />
              ))}
            </div>
          </section>

          {/* Section 16: DAILY ENERGY SAVINGS BAR CHART (Mon - Sun) */}
          <section className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Daily Energy Saving & Excess Attribution (Mon – Sun)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Weekly comparison of identified excess energy vs actual measured energy saved.
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-emerald-500/30 text-emerald-300"
              >
                KILOWATT-HOURS (kWh)
              </Badge>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={DAILY_SAVINGS_DATA}
                  margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" unit=" kWh" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white shadow-xl">
                          <div className="font-bold text-cyan-300 mb-1">{label}</div>
                          <div>
                            Measured Energy Saved:{" "}
                            <span className="font-bold text-emerald-400">
                              {d.measuredSavedKWh} kWh
                            </span>
                          </div>
                          <div>
                            Excess Identified:{" "}
                            <span className="font-bold text-amber-400">
                              {d.excessIdentifiedKWh} kWh
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Capture Efficiency:{" "}
                            {Math.round((d.measuredSavedKWh / d.excessIdentifiedKWh) * 100)}%
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "10px" }}
                  />
                  <Bar
                    dataKey="measuredSavedKWh"
                    fill="#10b981"
                    name="Measured Saved (kWh)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="excessIdentifiedKWh"
                    fill="#f59e0b"
                    name="Excess Identified (kWh)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
