import React from 'react';
import { Check, ChevronRight, Clock, History, Repeat, Sparkles, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TemporalPatternCard() {
  const transitions = [
    { time: '08:30', label: 'Normal Operation', state: 'Work Load (85W)', type: 'normal' },
    { time: '09:10', label: 'State Shift: Idle', state: 'User Inactive', type: 'state' },
    { time: '09:18', label: 'Excess Detected', state: 'Power: 88W (+45W)', type: 'alert' },
    { time: '09:20', label: 'Multi-Signal Verified', state: 'Confidence: 91%', type: 'verified' },
    { time: '09:55', label: 'Recommendation Generated', state: 'Sleep Policy', type: 'rec' },
    { time: '10:05', label: 'Action Applied', state: 'Sleep Triggered', type: 'action' },
    { time: '10:15', label: 'Consumption Reduced', state: 'Down to 55W', type: 'success' },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Temporal Pattern Analysis
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            State-transition timeline and historical anomaly recurrence tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[11px] font-mono">
            <Repeat className="h-3 w-3 mr-1" /> Recurring: 4 occurrences this week
          </Badge>
        </div>
      </div>

      {/* Main Temporal Stat Callout */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 grid place-items-center text-amber-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              Excess Persisted for <span className="text-amber-400">38 minutes</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Window: 09:18 AM – 09:56 AM | Daily pattern correlated with lab lunch period
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Estimated Energy Lost:</span>
          <span className="text-base font-bold text-amber-400 font-mono">31 Wh (0.031 kWh)</span>
        </div>
      </div>

      {/* State Transitions Timeline */}
      <div>
        <span className="text-xs font-mono font-semibold text-slate-300 block mb-3">
          EVENT PROGRESSION & STATE TRANSITIONS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {transitions.map((t, idx) => {
            const isAlert = t.type === 'alert';
            const isSuccess = t.type === 'success';
            const isAction = t.type === 'action';
            const isVerified = t.type === 'verified';

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs font-mono relative transition-all ${
                  isAlert
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : isVerified
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                    : isSuccess
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : isAction
                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                    : 'bg-slate-900/60 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-white">{t.time}</span>
                  <span className="text-[9px] uppercase opacity-75">{t.type}</span>
                </div>
                <div className="font-bold text-xs leading-tight mb-1 text-slate-100">{t.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{t.state}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
