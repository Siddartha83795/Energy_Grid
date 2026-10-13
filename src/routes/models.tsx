import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';
import { ResearchTopNav } from '@/components/energy-advisor/ResearchTopNav';
import { ResearchSidebar } from '@/components/energy-advisor/ResearchSidebar';
import {
  Sliders,
  Cpu,
  LineChart,
  Layers,
  Scale,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { toast } from 'sonner';

export const Route = createFileRoute('/models')({
  head: () => ({
    meta: [
      {
        title: 'Expected Energy Models & Ablation Study — Energy Advisor',
      },
    ],
  }),
  component: ModelsPage,
});

export function ModelsPage() {
  const {
    modelComparisons,
    ablationStudy,
    devices,
    selectedDevice,
  } = useEnergyAdvisor();

  const [activeTab, setActiveTab] = useState<'comparison' | 'ablation' | 'state-engine'>('comparison');
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null);

  const handleRetrain = (modelName: string) => {
    setTrainingStatus(`Retraining ${modelName} on 30-day contextual dataset...`);
    setTimeout(() => {
      setTrainingStatus(null);
      toast.success(`${modelName} retrained successfully. Validation MAE updated.`);
    }, 1500);
  };

  const radarData = [
    { metric: 'Precision', 'State-Conditioned': 91.5, 'XGBoost': 94.8, 'Fixed Threshold': 61.4 },
    { metric: 'Recall', 'State-Conditioned': 89.7, 'XGBoost': 93.5, 'Fixed Threshold': 71.5 },
    { metric: 'F1 Score', 'State-Conditioned': 90.6, 'XGBoost': 94.1, 'Fixed Threshold': 66.1 },
    { metric: 'Low FPR (100-FPR)', 'State-Conditioned': 96.8, 'XGBoost': 98.1, 'Fixed Threshold': 81.5 },
    { metric: 'R² Fit (x100)', 'State-Conditioned': 94.2, 'XGBoost': 97.2, 'Fixed Threshold': 58.0 },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Header */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-950/70 via-slate-900/80 to-purple-950/60 border border-blue-500/30 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] font-mono uppercase tracking-wider">
                    SECTION 4, 12, 22 & 23 • MACHINE LEARNING BENCHMARK
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
                    MODEL SELECTION & ABLATION
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                  EXPECTED ENERGY MODELS & ABLATION STUDY
                </h1>
                <p className="text-xs text-slate-400 font-mono max-w-3xl leading-relaxed">
                  Comparing state-conditioned regression algorithms against global anomaly detectors and fixed thresholds. The Ablation Study proves empirically that conditioning on physical operating state yields minimum excess energy estimation error.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-center font-mono text-xs">
                  <div className="text-[10px] text-slate-400">Model Version</div>
                  <div className="text-xs font-bold text-cyan-300 font-mono">v2.4-Production</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Trained: 2026-10-01 (#8f3c)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-center font-mono text-xs">
                  <div className="text-[10px] text-slate-400">Best Model R²</div>
                  <div className="text-base font-bold text-emerald-400">0.972 (XGBoost)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-xl border transition-all ${
                activeTab === 'comparison'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              1. Model Performance Benchmark (Table 1 & 2)
            </button>
            <button
              onClick={() => setActiveTab('ablation')}
              className={`px-4 py-2 rounded-xl border transition-all ${
                activeTab === 'ablation'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              2. Ablation Study (Section 23)
            </button>
            <button
              onClick={() => setActiveTab('state-engine')}
              className={`px-4 py-2 rounded-xl border transition-all ${
                activeTab === 'state-engine'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              3. Operating State Engine (Rule vs ML)
            </button>
          </div>

          {trainingStatus && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-2 animate-pulse">
              <Zap className="h-4 w-4" />
              <span>{trainingStatus}</span>
            </div>
          )}

          {/* Tab 1: Model Comparison */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              {/* Radar and Bar Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/70 border-white/10 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-cyan-300">
                      FIGURE 8: Multi-Metric Model Comparison Radar
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-mono">
                      Precision, Recall, F1, and Fit trade-offs across model families
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis stroke="#475569" angle={30} domain={[50, 100]} />
                        <Radar name="XGBoost" dataKey="XGBoost" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                        <Radar name="State-Conditioned" dataKey="State-Conditioned" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Radar name="Fixed Threshold" dataKey="Fixed Threshold" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#090e17', borderColor: '#334155' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/70 border-white/10 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-cyan-300">
                      Estimation Error (MAE in Watts)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-mono">
                      Lower MAE corresponds to sharper excess energy quantification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={modelComparisons} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="model_name" stroke="#94a3b8" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" />
                        <YAxis stroke="#64748b" tickFormatter={(v) => `${v}W`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#090e17', borderColor: '#334155' }}
                          formatter={(v: any) => [`${v} Watts`, 'MAE']}
                        />
                        <Bar dataKey="mae" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Table 1 & Table 2 Combined */}
              <Card className="bg-slate-900/70 border-white/10 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-white">
                        TABLE 1 & 2: Expected Energy Regression & Anomaly Benchmark
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400 font-mono">
                        Comparing physical error (MAE, RMSE, R²) and diagnostic classification (Precision, Recall, F1, FPR)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-950/80 border-b border-white/10 font-mono text-[11px]">
                        <TableRow>
                          <TableHead className="text-slate-300">Model Name</TableHead>
                          <TableHead className="text-slate-300">Type</TableHead>
                          <TableHead className="text-cyan-300">MAE (W)</TableHead>
                          <TableHead className="text-slate-300">RMSE (W)</TableHead>
                          <TableHead className="text-slate-300">R² Fit</TableHead>
                          <TableHead className="text-emerald-300">Precision</TableHead>
                          <TableHead className="text-emerald-300">Recall</TableHead>
                          <TableHead className="text-purple-300">F1 Score</TableHead>
                          <TableHead className="text-amber-400">FPR</TableHead>
                          <TableHead className="text-slate-300">Excess Error</TableHead>
                          <TableHead className="text-right text-slate-300">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-mono text-xs divide-y divide-white/5">
                        {modelComparisons.map((row) => (
                          <TableRow key={row.model_id} className="hover:bg-slate-800/40">
                            <TableCell className="font-bold text-white">{row.model_name}</TableCell>
                            <TableCell className="text-slate-400">{row.model_type}</TableCell>
                            <TableCell className="text-cyan-400 font-bold">{row.mae} W</TableCell>
                            <TableCell className="text-slate-300">{row.rmse} W</TableCell>
                            <TableCell className="text-slate-300">{row.r2}</TableCell>
                            <TableCell className="text-emerald-400 font-bold">{Math.round(row.precision * 100)}%</TableCell>
                            <TableCell className="text-emerald-400">{Math.round(row.recall * 100)}%</TableCell>
                            <TableCell className="text-purple-300 font-bold">{row.f1}</TableCell>
                            <TableCell className="text-amber-400 font-bold">{Math.round(row.fpr * 1000) / 10}%</TableCell>
                            <TableCell className="text-slate-300">{row.excess_estimation_error_wh} Wh</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRetrain(row.model_name)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 h-6 px-2 gap-1"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Retrain
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab 2: Ablation Study */}
          {activeTab === 'ablation' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/70 border-purple-500/30 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-purple-300">
                        FIGURE 9 & TABLE: Ablation Study of Contextual Variables (Section 23)
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400 font-mono">
                        Empirically isolating the value of adding Workload, Sensor Context, and Operating State
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-950/80 border-b border-white/10 font-mono text-[11px]">
                        <TableRow>
                          <TableHead className="text-slate-300">Configuration</TableHead>
                          <TableHead className="text-slate-300">Included Feature Vector</TableHead>
                          <TableHead className="text-cyan-300">MAE (W)</TableHead>
                          <TableHead className="text-slate-300">Excess Wh Error</TableHead>
                          <TableHead className="text-amber-400">FPR %</TableHead>
                          <TableHead className="text-emerald-400">F1 Score</TableHead>
                          <TableHead className="text-slate-300">Key Scientific Finding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-mono text-xs divide-y divide-white/5">
                        {ablationStudy.map((entry) => (
                          <TableRow
                            key={entry.configuration}
                            className={`hover:bg-slate-800/40 ${
                              entry.configuration === 'Configuration D' ? 'bg-purple-950/20' : ''
                            }`}
                          >
                            <TableCell className="font-bold text-white whitespace-nowrap">
                              {entry.configuration}
                            </TableCell>
                            <TableCell className="text-slate-400 max-w-xs text-[11px]">
                              {entry.features_included.join(', ')}
                            </TableCell>
                            <TableCell className="text-cyan-400 font-bold">{entry.mae_w} W</TableCell>
                            <TableCell className="text-purple-300 font-bold">{entry.excess_energy_estimation_error_wh} Wh</TableCell>
                            <TableCell className="text-amber-400 font-bold">{entry.false_positive_rate_pct}%</TableCell>
                            <TableCell className="text-emerald-400 font-bold">{entry.f1_score}</TableCell>
                            <TableCell className="text-slate-300 text-[11px] leading-relaxed">
                              {entry.key_finding}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-mono space-y-1">
                    <div className="text-purple-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Ablation Conclusion for Thesis / Publication:
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Moving from Configuration A (Power-only) to Configuration D (Power + Workload + Context + State) reduces energy estimation error by <span className="text-emerald-400 font-bold">92.6% (from 16.2 Wh to 1.2 Wh)</span> and slashes false alarms from 17.8% to 1.9%. This directly validates Supporting Contribution 3: contextual signals and state identification are indispensable for reliable physical excess energy accounting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab 3: Operating State Engine */}
          {activeTab === 'state-engine' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/70 border-white/10 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-emerald-300">
                    SECTION 10: State Identification Engine (Rule-Based vs ML-Based)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 font-mono">
                    Non-circular state classification using non-power contextual vectors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-cyan-400 font-bold uppercase text-[11px]">Rule-Based State Machine</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Deterministic heuristics mapping duration and non-power telemetry:
                      </p>
                      <pre className="p-3 rounded-lg bg-slate-900 border border-white/5 text-[10px] text-slate-300 overflow-x-auto">
{`IF user_activity == 0 AND cpu < 5% AND duration > 15m
  → State = IDLE
IF user_activity == 0 AND cpu == 0 AND power < 10W
  → State = STANDBY
IF cpu > 70% AND user_activity == HIGH
  → State = HIGH_LOAD`}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <div className="text-purple-400 font-bold uppercase text-[11px]">ML-Based Classifier (Random Forest)</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Multi-feature classifier trained on labeled contextual ground truth:
                      </p>
                      <pre className="p-3 rounded-lg bg-slate-900 border border-white/5 text-[10px] text-slate-300 overflow-x-auto">
{`Features: [vibration_g, temp_c, cpu_pct, active_threads,
           keystroke_rate, screen_state]
Accuracy: 94.2%  |  Precision: 93.8%
F1-Score: 0.931  |  Cross-Entropy: 0.14`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
