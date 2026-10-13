import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';
import { ResearchTopNav } from '@/components/energy-advisor/ResearchTopNav';
import { ResearchSidebar } from '@/components/energy-advisor/ResearchSidebar';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  IndianRupee,
  Leaf,
  Lightbulb,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/recommendations')({
  head: () => ({
    meta: [{ title: 'AI Energy Recommendations — Energy Advisor' }],
  }),
  component: RecommendationsPage,
});

export function RecommendationsPage() {
  const { recommendations, applyRecommendation, completeRecommendation } = useEnergyAdvisor();

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
                <Lightbulb className="h-5 w-5 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Context-Aware Energy Recommendations
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Prescriptive actions generated from verified excess energy causes and baseline deviations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-xs font-mono">
                {recommendations.length} Actionable Proposals
              </Badge>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-6">
            {recommendations.map((rec) => {
              const isPending = rec.status === 'PENDING';
              const isApplied = rec.status === 'APPLIED';
              const isCompleted = rec.status === 'COMPLETED';

              return (
                <div
                  key={rec.id}
                  className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md transition-all ${
                    isApplied
                      ? 'bg-[#0f1d1f] border-cyan-500/40 shadow-cyan-950/20'
                      : isCompleted
                      ? 'bg-[#0c1815] border-emerald-500/40 shadow-emerald-950/20'
                      : 'bg-[#0d131f] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
                        <span className="text-cyan-400 font-bold">{rec.deviceName}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">Recommendation #{rec.id}</span>
                      </div>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        {rec.title}
                      </h2>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs font-mono px-3 py-1 shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : isApplied
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {rec.status}
                    </Badge>
                  </div>

                  {/* Description & Reason */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2.5 mb-5 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block font-bold">RESEARCH RATIONALE:</span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed">&ldquo;{rec.reason}&rdquo;</p>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-cyan-400 text-[11px] block font-bold">ACTION IMPLEMENTATION:</span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>

                  {/* Section 14: ESTIMATED IMPACT BOUNDS (Explicitly Labeled) */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-cyan-400 text-[11px] uppercase tracking-wider">
                        ESTIMATED IMPACT (PREDICTED BOUNDS)
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                        Notice: Labeled as Estimated Impact prior to sensor validation
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                        <span className="text-[10px] text-slate-400 uppercase block">Estimated Reduction</span>
                        <span className="text-base font-bold text-emerald-400 mt-1 block">
                          35–50 W
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Average load drop</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                        <span className="text-[10px] text-slate-400 uppercase block">Potential Daily Saving</span>
                        <span className="text-base font-bold text-cyan-400 mt-1 block">
                          0.5–1.0 kWh / day
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Lab operating window</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                        <span className="text-[10px] text-slate-400 uppercase block">Estimated Monthly Benefit</span>
                        <span className="text-base font-bold text-white mt-1 block">
                          ₹{rec.estimatedImpact.monthlyCostSavingINR} / month
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Electricity tariff model</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Section 14: [ Apply / Record Action ] and [ Mark as Completed ]) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 font-mono text-xs">
                    <div className="text-slate-400 text-[11px]">
                      {isApplied && <span className="text-cyan-400">Action applied at {rec.appliedAt} • Sensor tracking live</span>}
                      {isCompleted && <span className="text-emerald-400">✓ Completed & verified on telemetry grid</span>}
                      {isPending && <span>Awaiting operator or script actuation</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Button
                          onClick={() => applyRecommendation(rec.id)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-9 px-4 cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Apply / Record Action
                        </Button>
                      )}

                      {isApplied && (
                        <>
                          <Button
                            asChild
                            variant="outline"
                            className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 text-xs h-9 cursor-pointer"
                          >
                            <Link to="/energy-saving">
                              View Measured Savings <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                          <Button
                            onClick={() => completeRecommendation(rec.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs h-9 px-4 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark as Completed
                          </Button>
                        </>
                      )}

                      {isCompleted && (
                        <Button
                          asChild
                          variant="outline"
                          className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950 text-xs h-9 cursor-pointer"
                        >
                          <Link to="/energy-saving">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Measured Result Verified
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
