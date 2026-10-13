import React from 'react';
import { CauseAttribution } from '@/lib/energy-advisor-research';
import { AlertCircle, CheckCircle2, HelpCircle, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Props {
  attribution: CauseAttribution;
  deviceName?: string;
}

export function CauseAttributionCard({ attribution, deviceName = 'Desktop PC (Workstation)' }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Probable Cause Attribution
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            Bayesian sensor-conditioned root cause hypothesis for {deviceName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-xs font-mono">
            {attribution.confidencePercent}% Model Confidence
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Primary Probable Cause & Evidence Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold mb-1">
              PRIMARY PROBABLE CAUSE
            </span>
            <div className="text-base font-bold text-white tracking-tight">
              {attribution.probableCause}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10 font-mono text-xs text-slate-300">
              <span className="text-cyan-400 font-bold">Confidence: {attribution.confidencePercent}%</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Classification: Context-Aware Idle Anomaly</span>
            </div>
          </div>

          {/* Evidence Checklist */}
          <div>
            <span className="text-xs font-mono font-semibold text-slate-300 block mb-2.5">
              CORROBORATING MULTI-SIGNAL EVIDENCE:
            </span>
            <div className="space-y-1.5">
              {attribution.evidencePoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-white/5 text-xs text-slate-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Alternative Causes Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold text-slate-300">
                  ALTERNATIVE HYPOTHESES:
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Ranked Probability</span>
              </div>

              <div className="space-y-3">
                {attribution.alternativeCauses.map((alt, idx) => (
                  <div key={idx} className="space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-medium text-slate-200">{idx + 1}. {alt.cause}</span>
                      <span className="font-bold text-cyan-400">{alt.probabilityPercent}%</span>
                    </div>
                    <Progress value={alt.probabilityPercent} className="h-1.5 bg-slate-800" />
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {alt.notes}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-white/5 text-[11px] text-slate-400 font-mono">
              <span className="text-cyan-400 font-bold">Research Note:</span> Terminology reflects probabilistic estimation rather than confirmed physical failure until telemetry feedback verifies the corrective action.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
