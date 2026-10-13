import React, { useState } from 'react';
import { RESEARCH_PIPELINE_STEPS } from '@/lib/energy-advisor-research';
import { ArrowRight, Sparkles, Info, CheckCircle2, ChevronRight, Activity, Cpu, Layers } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function ResearchPipelineBanner() {
  const [selectedStep, setSelectedStep] = useState<typeof RESEARCH_PIPELINE_STEPS[0] | null>(null);

  return (
    <>
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#0d1527] via-[#09101d] to-[#0d1b2a] p-5 shadow-lg backdrop-blur-md relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-0 w-96 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Cpu className="h-3 w-3" /> Core Research Architecture
              </span>
              <span className="text-xs font-mono text-emerald-400/80">B.Tech Computer Science Project</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              Context-Aware Excess Energy Detection & Cause Attribution Workflow
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl mt-0.5">
              Distinguishing legitimate compute load from genuine idle waste through multi-signal correlation and state-specific regression baselines.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Click any stage to inspect logic:</span>
          </div>
        </div>

        {/* Pipeline Horizontal Flow */}
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          <div className="flex items-stretch gap-1.5 min-w-[1000px]">
            {RESEARCH_PIPELINE_STEPS.map((step, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === RESEARCH_PIPELINE_STEPS.length - 1;
              const isHighlight = step.step === 4 || step.step === 7 || step.step === 10;

              return (
                <React.Fragment key={step.step}>
                  <button
                    onClick={() => setSelectedStep(step)}
                    className={`flex-1 min-w-[120px] rounded-xl p-2.5 text-left transition-all duration-200 border relative group cursor-pointer ${
                      isHighlight
                        ? 'bg-cyan-950/40 border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-900/40 shadow-sm shadow-cyan-950'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-cyan-400">
                        {String(step.step).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          isHighlight
                            ? 'bg-cyan-400/20 text-cyan-300 font-semibold'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight line-clamp-2">
                      {step.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 font-normal leading-relaxed">
                      {step.desc}
                    </div>
                  </button>
                  {!isLast && (
                    <div className="flex items-center justify-center text-slate-600 px-0.5">
                      <ChevronRight className="h-3.5 w-3.5 text-cyan-500/50" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Inspector Modal */}
      <Dialog open={!!selectedStep} onOpenChange={(open) => !open && setSelectedStep(null)}>
        <DialogContent className="max-w-md bg-[#0f172a] border-cyan-500/30 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono">
                Stage {selectedStep?.step} of 10
              </Badge>
              <span className="text-xs font-mono text-slate-400">{selectedStep?.badge}</span>
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              {selectedStep?.title}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm mt-2 leading-relaxed">
              {selectedStep?.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 space-y-2 font-mono">
            <div className="text-cyan-400 font-semibold">Research Implementation:</div>
            <div>• Formulated to eliminate false positives in dynamic multi-state industrial/laboratory computing hardware.</div>
            <div>• Verifies hardware telemetry signals against physical baseline models instead of static load thresholds.</div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
