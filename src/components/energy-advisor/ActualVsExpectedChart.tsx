import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { TimeSeriesPoint } from "@/lib/energy-advisor-research";
import { Activity, AlertCircle, Info, Zap, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  data: TimeSeriesPoint[];
  deviceName?: string;
}

export function ActualVsExpectedChart({ data, deviceName = "Desktop PC (Workstation)" }: Props) {
  const [selectedInterval, setSelectedInterval] = useState<"realtime" | "1h" | "24h">("realtime");

  // Format data for difference shading
  const chartData = data.map((d) => ({
    ...d,
    // When actual > expected, excessRegion is actual, otherwise expected
    excessAreaTop: d.actualPower > d.expectedPower ? d.actualPower : d.expectedPower,
    excessAreaBottom: d.expectedPower,
    excessDelta: Math.max(0, d.actualPower - d.expectedPower),
  }));

  const maxPower = Math.max(...data.map((d) => d.actualPower), 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Actual vs Expected Energy
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-amber-500/30 bg-amber-500/10 text-amber-300"
            >
              EXCESS DETECTED
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-state baseline tracking for{" "}
            <span className="text-slate-200 font-semibold">{deviceName}</span>. Excess energy is
            shaded in amber.
          </p>
        </div>

        {/* Legend pills & Interval toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-4 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#ef4444] inline-block shadow-sm shadow-red-500" />
              <span className="text-slate-300">Actual Power (W)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#06b6d4] inline-block shadow-sm shadow-cyan-500" />
              <span className="text-slate-300">Expected Baseline (W)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/40 border border-amber-400/80 inline-block" />
              <span className="text-amber-300 font-semibold">Excess Region</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[340px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="excessGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              dy={8}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              domain={[0, Math.ceil(maxPower * 1.15)]}
              unit=" W"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as (typeof chartData)[0];
                const delta = d.actualPower - d.expectedPower;
                const isAbove = delta > 0;

                return (
                  <div className="rounded-xl border border-white/10 bg-[#0f172a]/95 p-3 shadow-2xl backdrop-blur-md text-xs font-mono">
                    <div className="font-bold text-white border-b border-white/10 pb-1.5 mb-2 flex items-center justify-between gap-4">
                      <span>Time: {label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                        State: {d.state}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-6 text-slate-300">
                        <span className="flex items-center gap-1.5 text-red-400 font-medium">
                          <span className="h-2 w-2 rounded-full bg-red-500" /> Actual Power:
                        </span>
                        <span className="font-bold text-white">{d.actualPower} W</span>
                      </div>
                      <div className="flex items-center justify-between gap-6 text-slate-300">
                        <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                          <span className="h-2 w-2 rounded-full bg-cyan-400" /> Expected Baseline:
                        </span>
                        <span className="font-bold text-white">{d.expectedPower} W</span>
                      </div>
                      <div className="flex items-center justify-between gap-6 pt-1.5 border-t border-white/5 font-semibold">
                        <span className={isAbove ? "text-amber-400" : "text-emerald-400"}>
                          {isAbove ? "Excess Power (Deviation):" : "Efficiency Surplus:"}
                        </span>
                        <span
                          className={`text-sm ${isAbove ? "text-amber-400 font-bold" : "text-emerald-400"}`}
                        >
                          {isAbove ? `+${delta} W` : `${delta} W`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Shaded Excess Energy Area */}
            <Area
              type="monotone"
              dataKey="actualPower"
              stroke="none"
              fill="url(#excessGradient)"
              name="Excess Region"
            />

            {/* Expected Power Baseline Line */}
            <Line
              type="monotone"
              dataKey="expectedPower"
              stroke="#06b6d4"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={false}
              name="Expected Power (W)"
            />

            {/* Actual Power Line */}
            <Line
              type="monotone"
              dataKey="actualPower"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#ef4444", strokeWidth: 1, stroke: "#ffffff" }}
              activeDot={{ r: 6, fill: "#ef4444", stroke: "#ffffff" }}
              name="Actual Power (W)"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Floating Callout for Excess Energy Region */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full shadow-lg backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-amber-300 tracking-wide uppercase">
            EXCESS ENERGY REGION (09:18 – 10:00)
          </span>
        </div>
      </div>

      {/* Bottom Insights row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5">
          <span className="text-slate-400 block text-[11px]">Learned State Baseline:</span>
          <span className="text-sm font-bold text-cyan-400 mt-0.5 block">43 W (Idle Model)</span>
          <span className="text-[10px] text-slate-400">Trained on 12,480 samples (MAE: 4.8W)</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5">
          <span className="text-slate-400 block text-[11px]">Peak Excess Encountered:</span>
          <span className="text-sm font-bold text-amber-400 mt-0.5 block">
            +50 W (+116% above model)
          </span>
          <span className="text-[10px] text-slate-400">At timestamp 09:35 AM</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5">
          <span className="text-slate-400 block text-[11px]">Corrective Action Response:</span>
          <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
            Sleep Policy Applied (10:05)
          </span>
          <span className="text-[10px] text-slate-400">Consumption dropped to 44 W</span>
        </div>
      </div>
    </div>
  );
}
