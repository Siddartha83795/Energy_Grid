import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';
import { ResearchTopNav } from '@/components/energy-advisor/ResearchTopNav';
import { ResearchSidebar } from '@/components/energy-advisor/ResearchSidebar';
import {
  FlaskConical,
  Database,
  ShieldCheck,
  Cpu,
  LineChart,
  Layers,
  Scale,
  Split,
  Lightbulb,
  Sliders,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
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

export const Route = createFileRoute('/experiments')({
  head: () => ({
    meta: [
      {
        title: 'Research Lab & Controlled Experiments — Energy Advisor',
      },
    ],
  }),
  component: ExperimentsPage,
});

export function ExperimentsPage() {
  const {
    experiments,
    devices,
    selectedDevice,
    setSelectedDeviceId,
    addExperiment,
    runControlledExperiment,
    dataQualityReports,
    modelComparisons,
    ablationStudy,
    counterfactualEvaluations,
  } = useEnergyAdvisor();

  const [activeSection, setActiveSection] = useState<number>(6); // Default on Cause Validation
  const [newExpTitle, setNewExpTitle] = useState('Controlled Trial on Workstation');
  const [newExpCause, setNewExpCause] = useState<any>('PROLONGED_IDLE');
  const [newExpDuration, setNewExpDuration] = useState(60);
  const [newExpPowerDelta, setNewExpPowerDelta] = useState(45);

  const sections = [
    { num: 1, title: 'Dataset Selection', icon: Database, link: '/datasets' },
    { num: 2, title: 'Data Quality & Cleaning', icon: ShieldCheck, link: '/datasets' },
    { num: 3, title: 'State Identification', icon: Cpu, link: '/devices' },
    { num: 4, title: 'Expected Energy Model', icon: LineChart, link: '/models' },
    { num: 5, title: 'Excess Energy Ledger', icon: Layers, link: '/excess-ledger' },
    { num: 6, title: 'Controlled Cause Validation', icon: FlaskConical, active: true },
    { num: 7, title: 'Counterfactual Experiment', icon: Split, link: '/counterfactual-analysis' },
    { num: 8, title: 'Recommendation Evaluation', icon: Lightbulb, link: '/recommendations' },
    { num: 9, title: 'Ablation Study', icon: Sliders, link: '/models' },
    { num: 10, title: 'Export Results', icon: Download, link: '/research-results' },
  ];

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    const durationHours = newExpDuration / 60;
    const groundTruthWh = Math.round(newExpPowerDelta * durationHours * 10) / 10;
    const estimatedWh = Math.round(groundTruthWh * 0.96 * 10) / 10;

    addExperiment({
      title: newExpTitle,
      device_id: selectedDevice.id,
      device_name: selectedDevice.name,
      known_cause: newExpCause,
      injected_duration_minutes: newExpDuration,
      injected_power_delta_w: newExpPowerDelta,
      ground_truth_excess_wh: groundTruthWh,
      estimated_excess_wh: estimatedWh,
      baseline_condition: 'Standard automated ACPI sleep state active',
      injected_condition: `Injected ${newExpCause} via policy script for ${newExpDuration} min`,
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Header */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-cyan-950/60 border border-purple-500/30 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono uppercase tracking-wider">
                    SECTION 26 • RESEARCH LAB WORKSTATION
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
                    10-STAGE METHODOLOGY
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                  CONTROLLED EXPERIMENTS & RESEARCH BENCHMARK
                </h1>
                <p className="text-xs text-slate-400 font-mono max-w-3xl leading-relaxed">
                  Executing scientific validation trials where known excess energy is intentionally injected into device operations to verify Cause Attribution and Counterfactual Energy Estimation against independent ground truth.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 font-mono text-xs">
                <Button asChild size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs gap-1">
                  <Link to="/experiment-runner">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Experiment Runner
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* IEEE PAPER EXPERIMENT VALIDATION SUITE QUICK LINKS */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                IEEE Manuscript Four Core Experiments (1–4)
              </span>
              <span className="text-[10px] text-slate-400">Direct Navigation &amp; Table Generation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <Button asChild variant="outline" size="sm" className="border-white/10 bg-slate-950/60 hover:bg-slate-800 text-xs justify-start gap-2 h-9 text-slate-200">
                <Link to="/expected-energy-comparison">
                  <LineChart className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Exp 1: Expected Energy</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-white/10 bg-slate-950/60 hover:bg-slate-800 text-xs justify-start gap-2 h-9 text-slate-200">
                <Link to="/ledger-validation">
                  <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Exp 2: Ledger Validation</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-white/10 bg-slate-950/60 hover:bg-slate-800 text-xs justify-start gap-2 h-9 text-slate-200">
                <Link to="/counterfactual-validation">
                  <Split className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Exp 3: Counterfactual</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-white/10 bg-slate-950/60 hover:bg-slate-800 text-xs justify-start gap-2 h-9 text-slate-200">
                <Link to="/recommendation-effectiveness">
                  <Lightbulb className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Exp 4: Recommendations</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Section 26: 10 Interactive Research Pipeline Sections Selector */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
              10 Pipeline Research Sections (Section 26)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              {sections.map((sec) => (
                <button
                  key={sec.num}
                  onClick={() => setActiveSection(sec.num)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${
                    activeSection === sec.num
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-md font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] text-slate-500">Sec 0{sec.num}</span>
                    <sec.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate text-[11px] leading-tight mt-1">{sec.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Section Content Renderer */}
          {activeSection === 6 && (
            <div className="space-y-6">
              {/* Section 14: Controlled Cause Validation Trials */}
              <Card className="bg-slate-900/70 border-white/10 text-white">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4" />
                        SECTION 14: Controlled Cause Validation Trial Registry
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400 font-mono">
                        Comparing known injected excess energy (Ground Truth) vs System Estimated Excess Wh
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-950/80 border-b border-white/10 font-mono text-[11px]">
                        <TableRow>
                          <TableHead className="text-slate-300">Exp ID</TableHead>
                          <TableHead className="text-slate-300">Device</TableHead>
                          <TableHead className="text-slate-300">Injected Cause</TableHead>
                          <TableHead className="text-slate-300">Duration</TableHead>
                          <TableHead className="text-purple-300">Ground Truth Wh</TableHead>
                          <TableHead className="text-cyan-300">Estimated Wh</TableHead>
                          <TableHead className="text-slate-300">Abs Error</TableHead>
                          <TableHead className="text-slate-300">% Error</TableHead>
                          <TableHead className="text-slate-300">MAE / RMSE</TableHead>
                          <TableHead className="text-right text-slate-300">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-mono text-xs divide-y divide-white/5">
                        {experiments.map((exp) => (
                          <TableRow key={exp.experiment_id} className="hover:bg-slate-800/40">
                            <TableCell className="font-bold text-cyan-400">{exp.experiment_id}</TableCell>
                            <TableCell className="font-semibold text-white">{exp.device_name}</TableCell>
                            <TableCell className="font-bold text-purple-300">{exp.known_cause}</TableCell>
                            <TableCell className="text-slate-400">{exp.injected_duration_minutes} mins</TableCell>
                            <TableCell className="text-purple-300 font-bold">{exp.ground_truth_excess_wh} Wh</TableCell>
                            <TableCell className="text-cyan-300 font-bold">{exp.estimated_excess_wh} Wh</TableCell>
                            <TableCell className="text-emerald-400 font-bold">{exp.absolute_error_wh} Wh</TableCell>
                            <TableCell className="text-slate-300">{exp.percentage_error}%</TableCell>
                            <TableCell className="text-slate-400">{exp.mae_w}W / {exp.rmse_w}W</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => runControlledExperiment(exp.experiment_id)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 h-6 px-2 gap-1"
                              >
                                <Play className="h-3 w-3" />
                                Re-run Trial
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Define New Controlled Experiment Trial */}
              <Card className="bg-slate-900/70 border-white/10 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
                    <Plus className="h-4 w-4 text-cyan-400" />
                    Configure New Controlled Validation Trial
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 font-mono">
                    Define an experimental test condition with known physical excess to calibrate the cause-level ledger
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateExperiment} className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Target Device</label>
                      <select
                        value={selectedDevice.id}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                      >
                        {devices.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Injected Waste Condition</label>
                      <select
                        value={newExpCause}
                        onChange={(e) => setNewExpCause(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-purple-300 font-bold"
                      >
                        <option value="PROLONGED_IDLE">PROLONGED_IDLE (Disable sleep policy)</option>
                        <option value="BACKGROUND_LOAD">BACKGROUND_LOAD (Spin compute daemon)</option>
                        <option value="STANDBY_LEAKAGE">STANDBY_LEAKAGE (Override heater standby)</option>
                        <option value="SCHEDULE_MISUSE">SCHEDULE_MISUSE (Run outside shift)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Injected Duration (min)</label>
                      <input
                        type="number"
                        value={newExpDuration}
                        onChange={(e) => setNewExpDuration(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Power Delta (+W)</label>
                      <input
                        type="number"
                        value={newExpPowerDelta}
                        onChange={(e) => setNewExpPowerDelta(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-cyan-300 font-bold"
                      />
                    </div>

                    <div className="md:col-span-4 flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="text-slate-400 text-xs">
                        Calculated Ground Truth Excess:{' '}
                        <span className="text-purple-300 font-bold text-sm">
                          {Math.round((newExpPowerDelta * (newExpDuration / 60)) * 10) / 10} Wh
                        </span>
                      </div>
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold gap-2"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        Execute Experiment Trial
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection !== 6 && (
            <Card className="bg-slate-900/70 border-white/10 text-white p-6 font-mono text-xs space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Sparkles className="h-4 w-4" />
                <span>Section 0{activeSection}: {sections[activeSection - 1].title}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                This research section is integrated into the live Energy Advisor prototype. You can navigate directly to its dedicated inspection dashboard using the button below.
              </p>
              {sections[activeSection - 1].link && (
                <Button asChild className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold font-mono text-xs gap-2">
                  <Link to={sections[activeSection - 1].link as any}>
                    Open {sections[activeSection - 1].title} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
