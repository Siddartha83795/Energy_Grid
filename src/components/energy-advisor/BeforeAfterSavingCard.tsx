import React from "react";
import { BeforeAfterMeasurement } from "@/lib/energy-advisor-research";
import {
  ArrowDownRight,
  Award,
  CheckCircle2,
  Clock,
  Leaf,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  measurement: BeforeAfterMeasurement;
}

export function BeforeAfterSavingCard({ measurement }: Props) {
  const maxW = 100;
  const beforeWidth = Math.min(100, Math.round((measurement.beforePowerW / maxW) * 100));
  const afterWidth = Math.min(100, Math.round((measurement.afterPowerW / maxW) * 100));

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-[#0c161a] p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Measured Energy-Saving Impact
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {measurement.deviceName} — {measurement.actionTaken}
          </p>
        </div>

        <Badge
          variant="outline"
          className={`text-xs font-mono px-2.5 py-1 ${
            measurement.isMeasured
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
          }`}
        >
          {measurement.isMeasured
            ? "✓ Measured Post-Action Sensor Data"
            : "⏳ Awaiting Post-Action Measurement"}
        </Badge>
      </div>

      {/* 4 Quantitative KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 font-mono">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Before Action
          </span>
          <span className="text-base font-bold text-slate-200 mt-0.5 block">
            {measurement.beforePowerW} W
          </span>
          <span className="text-[9px] text-red-400 block mt-0.5">Pre-intervention load</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
            After Action
          </span>
          <span className="text-base font-bold text-emerald-400 mt-0.5 block">
            {measurement.afterPowerW} W
          </span>
          <span className="text-[9px] text-emerald-400/80 block mt-0.5">Verified steady-state</span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
          <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">
            Reduction
          </span>
          <span className="text-base font-bold text-emerald-300 mt-0.5 block">
            -{measurement.reductionW} W ({measurement.reductionPercent}%)
          </span>
          <span className="text-[9px] text-emerald-400/80 block mt-0.5">Active drop</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Energy Saved
          </span>
          <span className="text-base font-bold text-cyan-400 mt-0.5 block">
            {measurement.measuredEnergySavedKWh} kWh
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {measurement.durationMinutes} min interval
          </span>
        </div>
      </div>

      {/* Visual Before vs After Progress Comparison Bars */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 space-y-4 mb-4 font-mono">
        <div className="text-xs font-semibold text-slate-300">
          POWER DRAW REDUCTION VISUAL COMPARISON
        </div>

        {/* BEFORE BAR */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500" /> BEFORE INTERVENTION
            </span>
            <span className="font-bold text-white">{measurement.beforePowerW} W</span>
          </div>
          <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${beforeWidth}%` }}
            />
          </div>
        </div>

        {/* AFTER BAR */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> AFTER ACTION (SLEEP POLICY
              APPLIED)
            </span>
            <span className="font-bold text-emerald-400">{measurement.afterPowerW} W</span>
          </div>
          <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${afterWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom status line */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Measured from real-time ESP32 edge telemetry after policy actuation
        </span>
        <span>{measurement.timestamp}</span>
      </div>
    </div>
  );
}
