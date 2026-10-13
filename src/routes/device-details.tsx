import React from 'react';
import { createFileRoute, useSearch, Link } from '@tanstack/react-router';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';
import { ResearchTopNav } from '@/components/energy-advisor/ResearchTopNav';
import { ResearchSidebar } from '@/components/energy-advisor/ResearchSidebar';
import { ActualVsExpectedChart } from '@/components/energy-advisor/ActualVsExpectedChart';
import { MultiSignalVerificationCard } from '@/components/energy-advisor/MultiSignalVerificationCard';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Layers,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/device-details')({
  head: () => ({
    meta: [{ title: 'Device Details & State Model — Energy Advisor' }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    deviceId: (search.deviceId as string) || 'dev-01',
  }),
  component: DeviceDetailsPage,
});

export function DeviceDetailsPage() {
  const { deviceId } = useSearch({ from: '/device-details' });
  const { devices, timeSeriesData } = useEnergyAdvisor();

  const device = devices.find((d) => d.id === deviceId) || devices[0];

  const barChartData = device.stateModels.map((m) => ({
    state: m.state,
    expectedPowerW: m.expectedPowerW,
    toleranceW: m.toleranceW,
    samples: m.sampleCount,
  }));

  const stateTimeline = [
    { time: '08:00 - 08:45', state: 'IDLE', power: '42 W', status: 'Baseline Matched' },
    { time: '08:45 - 09:15', state: 'BROWSING', power: '59 W', status: 'Baseline Matched' },
    { time: '09:15 - 09:56', state: 'IDLE (ANOMALOUS)', power: '92 W', status: 'Excess Detected (+49W)' },
    { time: '09:56 - 10:20', state: 'HEAVY LOAD', power: '95 W', status: 'Baseline Matched' },
    { time: '10:20 - Present', state: 'IDLE / SLEEP', power: '44 W', status: 'Action Active' },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Back & Device Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-mono text-slate-400 hover:text-white"
              >
                <Link to="/devices">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Devices
                </Link>
              </Button>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {device.name}
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">
                  {device.type} • {device.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                <Radio className="h-3 w-3 mr-1 text-emerald-400 animate-pulse" />
                {device.esp32NodeId}: ONLINE
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">
                STATE: {device.currentState}
              </Badge>
            </div>
          </div>

          {/* 4 Core Quantitative Metrics Banner (Section 11) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-[#0d131f] border border-white/10 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Power</span>
              <span className="text-2xl font-black text-white mt-1 block">{device.currentPowerW} W</span>
              <span className="text-[9px] text-red-400">Live edge telemetry</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d131f] border border-white/10 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Expected Power</span>
              <span className="text-2xl font-black text-cyan-300 mt-1 block">{device.expectedPowerW} W</span>
              <span className="text-[9px] text-slate-400">Learned for {device.currentState}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 shadow-lg">
              <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">Excess Power</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">+{device.excessPowerW} W</span>
              <span className="text-[9px] text-amber-300">+114% above baseline</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d131f] border border-white/10 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Excess Energy</span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block">31 Wh</span>
              <span className="text-[9px] text-slate-400">Integrated over 38 min</span>
            </div>
          </div>

          {/* Section 12: STATE-SPECIFIC ENERGY MODEL VISUALIZATION */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Expected Energy by Operating State
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Supervised regression model learned from historical operating state telemetry
                </p>
              </div>

              <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-mono">
                DEMO DATA
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Bar Chart of States */}
              <div className="lg:col-span-7 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="state" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                    <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" unit=" W" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white shadow-xl">
                            <div className="font-bold text-cyan-300 mb-1">State: {label}</div>
                            <div>Expected Power: <span className="font-bold">{d.expectedPowerW} W</span></div>
                            <div className="text-slate-400 text-[10px]">Trained Samples: {d.samples.toLocaleString()}</div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="expectedPowerW" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.state === device.currentState ? '#f59e0b' : '#06b6d4'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Model Metadata Card */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3 font-mono text-xs">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Machine Learning Model Specs
                </span>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Model Architecture:</span>
                    <span className="text-white font-semibold">State-Specific Baseline Model</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Training Window:</span>
                    <span className="text-white">30 days historical data</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Dataset Samples:</span>
                    <span className="text-cyan-300 font-bold">12,480 telemetry ticks</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Prediction Error (MAE):</span>
                    <span className="text-emerald-400 font-bold">4.8 W</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Root Mean Square (RMSE):</span>
                    <span className="text-emerald-400 font-bold">6.2 W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Goodness of Fit (R²):</span>
                    <span className="text-emerald-400 font-bold">0.942</span>
                  </div>
                </div>

                <div className="mt-3 p-2 rounded bg-amber-950/40 border border-amber-500/20 text-[10px] text-amber-300 leading-relaxed">
                  Notice: Model statistics displayed here are derived from laboratory calibration baseline dataset and explicitly marked as Demo Data.
                </div>
              </div>
            </div>
          </div>

          {/* Operating State Timeline (Section 11) */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              Operating State Timeline & Historical State Shifts
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {stateTimeline.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    item.status.includes('Excess')
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : 'bg-slate-900/60 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px] font-bold min-w-[120px]">
                      {item.time}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold text-[11px]">
                      {item.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-right justify-between sm:justify-end">
                    <span className="font-bold text-white">{item.power}</span>
                    <span className="text-[11px] font-semibold">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Series Chart */}
          <ActualVsExpectedChart data={timeSeriesData} deviceName={device.name} />
        </main>
      </div>
    </div>
  );
}
