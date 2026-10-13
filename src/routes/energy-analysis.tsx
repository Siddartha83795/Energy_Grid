import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEnergyAdvisor } from "@/lib/energy-advisor-context";
import { ResearchTopNav } from "@/components/energy-advisor/ResearchTopNav";
import { ResearchSidebar } from "@/components/energy-advisor/ResearchSidebar";
import { ActualVsExpectedChart } from "@/components/energy-advisor/ActualVsExpectedChart";
import { ExcessEnergyAnalysisCard } from "@/components/energy-advisor/ExcessEnergyAnalysisCard";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  Clock,
  Cpu,
  Layers,
  LineChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/energy-analysis")({
  head: () => ({
    meta: [{ title: "Energy Analysis & Excess Quantification — Energy Advisor" }],
  }),
  component: EnergyAnalysisPage,
});

export function EnergyAnalysisPage() {
  const { devices, selectedDevice, setSelectedDeviceId, timeSeriesData } = useEnergyAdvisor();
  const [selectedGranularity, setSelectedGranularity] = useState<"hourly" | "daily">("hourly");

  // Breakdown of cumulative excess power across devices
  const excessBreakdownData = devices.map((d) => ({
    name: d.name.split("(")[0].trim(),
    actualPowerW: d.currentPowerW,
    expectedPowerW: d.expectedPowerW,
    excessPowerW: d.excessPowerW,
    excessEnergyKWh: d.excessEnergyTodayKWh,
  }));

  const hourlyProfile = [
    { hour: "08:00", actualKWh: 0.42, expectedKWh: 0.4, excessKWh: 0.02 },
    { hour: "09:00", actualKWh: 0.88, expectedKWh: 0.43, excessKWh: 0.45 },
    { hour: "10:00", actualKWh: 0.92, expectedKWh: 0.43, excessKWh: 0.49 },
    { hour: "11:00", actualKWh: 0.89, expectedKWh: 0.42, excessKWh: 0.47 },
    { hour: "12:00", actualKWh: 0.55, expectedKWh: 0.43, excessKWh: 0.12 },
    { hour: "13:00", actualKWh: 0.44, expectedKWh: 0.41, excessKWh: 0.03 },
    { hour: "14:00", actualKWh: 0.78, expectedKWh: 0.72, excessKWh: 0.06 },
    { hour: "15:00", actualKWh: 0.85, expectedKWh: 0.81, excessKWh: 0.04 },
  ];

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
                <LineChart className="h-5 w-5 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Excess Energy Quantification & Analysis
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Comparative analysis of actual measured power vs state-conditioned expected
                baselines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Target Device:</span>
              <select
                value={selectedDevice.id}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="h-9 rounded-xl bg-slate-900 border border-white/10 px-3 text-xs font-mono text-white"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.currentState})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Core Chart */}
          <ActualVsExpectedChart data={timeSeriesData} deviceName={selectedDevice.name} />

          {/* Two-Column Deep-Dive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Device Breakdown Chart (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Device-Wise Excess Power Quantification
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Instantaneous baseline vs actual power comparison
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-cyan-500/30 text-cyan-300"
                >
                  WATT (W)
                </Badge>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={excessBreakdownData}
                    margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                    <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" unit=" W" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white shadow-xl">
                            <div className="font-bold text-cyan-300 mb-1">{label}</div>
                            <div>
                              Actual Power:{" "}
                              <span className="font-bold text-red-400">{d.actualPowerW} W</span>
                            </div>
                            <div>
                              Expected Power:{" "}
                              <span className="font-bold text-cyan-400">{d.expectedPowerW} W</span>
                            </div>
                            <div>
                              Excess Power:{" "}
                              <span className="font-bold text-amber-400">+{d.excessPowerW} W</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        paddingTop: "10px",
                      }}
                    />
                    <Bar
                      dataKey="expectedPowerW"
                      fill="#06b6d4"
                      name="Expected Baseline (W)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="excessPowerW"
                      fill="#f59e0b"
                      name="Excess Power (W)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Excess Energy Analysis Card (5 cols) */}
            <div className="lg:col-span-5">
              <ExcessEnergyAnalysisCard
                currentState={selectedDevice.currentState}
                expectedPowerW={selectedDevice.expectedPowerW}
                actualPowerW={selectedDevice.currentPowerW}
                durationMinutes={38}
                estimatedExcessWh={31}
                confidencePercent={91}
                verificationStatus={selectedDevice.status}
              />
            </div>
          </div>

          {/* Hourly Cumulative Excess Profile */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Hourly Energy Profile & Anomaly Distribution
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Quantified excess energy across 8-hour laboratory telemetry window
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-amber-500/30 text-amber-300"
              >
                PEAK LOSS AT 09:00 – 11:00 AM
              </Badge>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyProfile}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" unit=" kWh" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white shadow-xl">
                          <div className="font-bold text-cyan-300 mb-1">Time: {label}</div>
                          <div>Actual: {d.actualKWh} kWh</div>
                          <div>Expected: {d.expectedKWh} kWh</div>
                          <div className="text-amber-400 font-bold">Excess: +{d.excessKWh} kWh</div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actualKWh"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.15}
                    name="Actual kWh"
                  />
                  <Area
                    type="monotone"
                    dataKey="expectedKWh"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.1}
                    name="Expected kWh"
                  />
                  <Area
                    type="monotone"
                    dataKey="excessKWh"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.4}
                    name="Excess kWh"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
