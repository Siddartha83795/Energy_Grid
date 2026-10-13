import React from "react";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Layers,
  ShieldCheck,
  Thermometer,
  Vibrate,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  powerW?: number;
  temperatureC?: number;
  vibrationG?: number;
  activityLevel?: string;
  operatingState?: string;
  verificationStatus?: "NORMAL" | "DETECTED" | "VERIFIED" | "UNDER_REVIEW";
  confidencePercent?: number;
  explanation?: string;
}

export function MultiSignalVerificationCard({
  powerW = 92,
  temperatureC = 31.4,
  vibrationG = 0.08,
  activityLevel = "Low",
  operatingState = "Idle",
  verificationStatus = "VERIFIED",
  confidencePercent = 91,
  explanation = "Power consumption is significantly above the expected idle baseline while activity and vibration remain low.",
}: Props) {
  const getStatusBadge = (status: typeof verificationStatus) => {
    switch (status) {
      case "NORMAL":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono text-xs">
            NORMAL
          </Badge>
        );
      case "DETECTED":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-mono text-xs">
            DETECTED
          </Badge>
        );
      case "VERIFIED":
        return (
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-mono text-xs">
            VERIFIED
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono text-xs">
            UNDER REVIEW
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Supporting Sensor Evidence
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Cross-validation across multi-modal IoT sensor telemetry
            </p>
          </div>
          {getStatusBadge(verificationStatus)}
        </div>

        {/* 5 Sensor Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-5 font-mono">
          {/* POWER */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-red-500/30">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold text-red-400">Power</span>
              <Zap className="h-3.5 w-3.5 text-red-400" />
            </div>
            <div className="text-base font-bold text-white flex items-center gap-1">
              {powerW} W <span className="text-xs text-red-400 font-bold">↑</span>
            </div>
            <span className="text-[9px] text-red-400/80 block mt-0.5">High (+114%)</span>
          </div>

          {/* TEMPERATURE */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400">Temperature</span>
              <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-bold text-white">{temperatureC} °C</div>
            <span className="text-[9px] text-emerald-400 block mt-0.5">Normal (Cool)</span>
          </div>

          {/* VIBRATION */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-300">Vibration</span>
              <Vibrate className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="text-base font-bold text-white">{vibrationG} g</div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Low (No motor)</span>
          </div>

          {/* DEVICE ACTIVITY */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-300">Activity</span>
              <Activity className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="text-base font-bold text-white">{activityLevel}</div>
            <span className="text-[9px] text-slate-400 block mt-0.5">User Inactive</span>
          </div>

          {/* OPERATING STATE */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400">State</span>
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-bold text-cyan-300">{operatingState}</div>
            <span className="text-[9px] text-cyan-400/80 block mt-0.5">ACPI Baseline</span>
          </div>
        </div>
      </div>

      {/* Verification Result Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-900/60 border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white font-mono">
              Evidence Consistency: <span className="text-cyan-400 uppercase">Verified</span>
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
            Confidence: {confidencePercent}%
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          &ldquo;{explanation}&rdquo;
        </p>
      </div>
    </div>
  );
}
