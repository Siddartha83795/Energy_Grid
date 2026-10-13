import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEnergyAdvisor } from "@/lib/energy-advisor-context";
import { ResearchTopNav } from "@/components/energy-advisor/ResearchTopNav";
import { ResearchSidebar } from "@/components/energy-advisor/ResearchSidebar";
import { CauseAttributionCard } from "@/components/energy-advisor/CauseAttributionCard";
import { TemporalPatternCard } from "@/components/energy-advisor/TemporalPatternCard";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  HelpCircle,
  History,
  Layers,
  Sparkles,
  Thermometer,
  Vibrate,
  Zap,
  ArrowRight,
  GitFork,
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
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/cause-analysis")({
  head: () => ({
    meta: [{ title: "Cause Analysis & Attribution — Energy Advisor" }],
  }),
  component: CauseAnalysisPage,
});

export function CauseAnalysisPage() {
  const { selectedDevice, evidenceList, causeAttribution } = useEnergyAdvisor();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Root Cause Analysis & Multi-Signal Attribution
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Bayesian hypothesis ranking conditioned on multi-modal IoT sensor telemetry.
              </p>
            </div>

            <Badge
              variant="outline"
              className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-xs font-mono"
            >
              EVENT: 09:18 AM – 09:56 AM
            </Badge>
          </div>

          {/* Section 13: Selected Event Summary Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
                  ACTIVE INVESTIGATION EVENT
                </span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {selectedDevice.name} — Laboratory Anomaly Event #2026-0928
                </div>
              </div>
              <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs">
                VERIFIED IDLE ANOMALY
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Operating State</span>
                <span className="text-sm font-bold text-cyan-300 mt-0.5 block">
                  {selectedDevice.currentState}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Expected Power</span>
                <span className="text-sm font-bold text-slate-200 mt-0.5 block">
                  {selectedDevice.expectedPowerW} W
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Actual Power</span>
                <span className="text-sm font-bold text-red-400 mt-0.5 block">
                  {selectedDevice.currentPowerW} W
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
                <span className="text-[10px] text-amber-300 uppercase block font-bold">
                  Excess Power
                </span>
                <span className="text-sm font-bold text-amber-400 mt-0.5 block">
                  +{selectedDevice.excessPowerW} W
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Event Duration</span>
                <span className="text-sm font-bold text-white mt-0.5 block">38 minutes</span>
              </div>
            </div>
          </div>

          {/* Section 13: Evidence Matrix Table */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                Multi-Signal Evidence Matrix
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Sensor observations validating idle excess without CPU/GPU active computation
              </p>
            </div>

            <Table>
              <TableHeader className="bg-slate-900/80 border-b border-white/5 font-mono text-[11px]">
                <TableRow>
                  <TableHead className="text-slate-300">Evidence Dimension</TableHead>
                  <TableHead className="text-slate-300">Observation Value</TableHead>
                  <TableHead className="text-slate-300">Sensor Status</TableHead>
                  <TableHead className="text-slate-300">Analytical Interpretation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono text-xs divide-y divide-white/5">
                {evidenceList.map((ev, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-900/40">
                    <TableCell className="font-bold text-white">{ev.metric}</TableCell>
                    <TableCell className="text-cyan-300 font-semibold">{ev.value}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.status === "High"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : ev.status === "Normal" || ev.status === "Low"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300">{ev.interpretation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MULTI-SIGNAL SENSOR FUSION OVERLAY CHART */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Multi-Modal Signal Fusion Overlay (Telemetry Stream)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cross-validation: High electrical draw (+48W) accompanied by cold temperature
                  (24°C) and zero vibration (&lt;0.05g) confirms true idle waste.
                </p>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                SYNCHRONIZED 1Hz STREAM
              </Badge>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { time: "09:00", powerW: 15, tempC: 23, vibrationG: 0.02, acousticDb: 28 },
                    { time: "09:10", powerW: 16, tempC: 23.5, vibrationG: 0.03, acousticDb: 29 },
                    { time: "09:18", powerW: 68, tempC: 24.0, vibrationG: 0.02, acousticDb: 30 },
                    { time: "09:25", powerW: 67, tempC: 24.2, vibrationG: 0.02, acousticDb: 29 },
                    { time: "09:35", powerW: 69, tempC: 24.5, vibrationG: 0.03, acousticDb: 31 },
                    { time: "09:45", powerW: 68, tempC: 24.3, vibrationG: 0.02, acousticDb: 30 },
                    { time: "09:56", powerW: 16, tempC: 23.8, vibrationG: 0.02, acousticDb: 28 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fontSize: 11 }} unit=" W" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#f59e0b"
                    tick={{ fontSize: 11 }}
                    unit=" °C"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="powerW"
                    name="Electrical Draw (W)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="tempC"
                    name="Surface Temp (°C)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="acousticDb"
                    name="Acoustic Noise (dB)"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CAUSAL EVIDENCE GRAPH VISUALIZATION */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <GitFork className="h-4 w-4 text-purple-400" />
                  Directed Causal Evidence Network (DAG)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Root Cause Inference: Evidence path links shift schedule transition to verified
                  prolonged idle excess.
                </p>
              </div>
              <Badge className="bg-purple-950/60 text-purple-300 border-purple-500/40 text-xs">
                CONFIDENCE: 94.2%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                  Root Trigger
                </span>
                <span className="text-xs font-bold text-white block">Shift Transition Gap</span>
                <span className="text-[10px] text-slate-400 block">
                  Operator logged out at 09:18 AM
                </span>
              </div>

              <div className="flex justify-center text-cyan-400">
                <ArrowRight className="h-5 w-5" />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center space-y-1">
                <span className="text-[10px] text-amber-400 font-bold block uppercase">
                  Physical State
                </span>
                <span className="text-xs font-bold text-white block">Standby Inaction</span>
                <span className="text-[10px] text-slate-400 block">
                  Zero user input & CPU &lt; 2%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-center space-y-1">
                <span className="text-[10px] text-rose-300 font-bold block uppercase">
                  Attributed Cause
                </span>
                <span className="text-xs font-bold text-rose-200 block">PROLONGED IDLE</span>
                <span className="text-[10px] text-rose-300/80 block">Excess: 48.2 Wh wasted</span>
              </div>
            </div>
          </div>
          <CauseAttributionCard attribution={causeAttribution} deviceName={selectedDevice.name} />

          {/* Temporal Pattern Flow */}
          <TemporalPatternCard />
        </main>
      </div>
    </div>
  );
}
