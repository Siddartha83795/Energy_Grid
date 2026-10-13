import React from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, Gauge, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Props {
  currentState?: string;
  expectedPowerW?: number;
  actualPowerW?: number;
  durationMinutes?: number;
  estimatedExcessWh?: number;
  confidencePercent?: number;
  verificationStatus?: 'NORMAL' | 'DETECTED' | 'VERIFIED' | 'UNDER_REVIEW';
}

export function ExcessEnergyAnalysisCard({
  currentState = 'IDLE',
  expectedPowerW = 43,
  actualPowerW = 92,
  durationMinutes = 38,
  estimatedExcessWh = 31,
  confidencePercent = 91,
  verificationStatus = 'VERIFIED',
}: Props) {
  const excessPowerW = Math.max(0, actualPowerW - expectedPowerW);
  const excessPercentage = Math.round((excessPowerW / expectedPowerW) * 100);

  // Ratio for the visual comparison meter
  const maxBarValue = 120;
  const expectedWidthPercent = Math.min(100, Math.round((expectedPowerW / maxBarValue) * 100));
  const actualWidthPercent = Math.min(100, Math.round((actualPowerW / maxBarValue) * 100));

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-[#0d1424] p-6 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Excess Energy Analysis
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              State-conditioned baseline discrepancy quantifier
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-mono px-2.5 py-1"
          >
            {verificationStatus === 'VERIFIED' ? 'Verified Excess' : 'Potential Excess Energy'}
          </Badge>
        </div>

        {/* Top Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current State</span>
            <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{currentState}</span>
            <span className="text-[9px] text-slate-400">Classified State</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Expected Power</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">{expectedPowerW} W</span>
            <span className="text-[9px] text-slate-400">Learned Baseline</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Actual Power</span>
            <span className="text-sm font-bold text-red-400 mt-0.5 block">{actualPowerW} W</span>
            <span className="text-[9px] text-red-400/80">Real-time Draw</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
            <span className="text-[10px] text-amber-300 uppercase tracking-wider block">Excess Power</span>
            <span className="text-sm font-bold text-amber-400 mt-0.5 block">+{excessPowerW} W</span>
            <span className="text-[9px] text-amber-300">+{excessPercentage}% above baseline</span>
          </div>
        </div>

        {/* Visual Dual Comparison Bars */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="font-semibold text-slate-400 text-[11px]">BASELINE VS MEASURED CONSUMPTION METER</span>
            <span className="text-[10px] text-cyan-400">Scale: 0 – {maxBarValue} W</span>
          </div>

          {/* Expected Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Expected Baseline
              </span>
              <span className="font-bold text-white">{expectedPowerW} W</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${expectedWidthPercent}%` }}
              />
            </div>
          </div>

          {/* Actual Bar with Excess Segment */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Actual Measured Load
              </span>
              <span className="font-bold text-red-400">{actualPowerW} W</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 via-amber-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${actualWidthPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Quantification Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center gap-3">
            <Clock className="h-5 w-5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] block">Duration of Deviation</span>
              <span className="text-white font-bold text-sm">{durationMinutes} minutes</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] block">Estimated Excess Energy</span>
              <span className="text-amber-400 font-bold text-sm">{estimatedExcessWh} Wh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Verification Summary */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-amber-500/20 grid place-items-center text-amber-400 shrink-0">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-200">
              Potential Excess Energy Detected
            </div>
            <div className="text-[10px] text-amber-300/80 font-mono">
              Model confidence: <span className="font-bold text-white">{confidencePercent}%</span> based on multi-signal correlation
            </div>
          </div>
        </div>
        <Badge className="bg-amber-500 text-slate-950 font-bold font-mono text-[10px] hover:bg-amber-400">
          {confidencePercent}% CONFIDENCE
        </Badge>
      </div>
    </div>
  );
}
