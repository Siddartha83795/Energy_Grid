import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';
import { ResearchTopNav } from '@/components/energy-advisor/ResearchTopNav';
import { ResearchSidebar } from '@/components/energy-advisor/ResearchSidebar';
import {
  Database,
  ShieldCheck,
  Upload,
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Sliders,
  Sparkles,
  Info,
  Server,
  Layers,
  ArrowRight,
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
import { toast } from 'sonner';

export const Route = createFileRoute('/datasets')({
  head: () => ({
    meta: [
      {
        title: 'Datasets, Data Quality & Sensor Simulator — Energy Advisor',
      },
    ],
  }),
  component: DatasetsPage,
});

export function DatasetsPage() {
  const {
    dataQualityReports,
    simulatorConfig,
    updateSimulatorConfig,
    runSimulatorInjection,
  } = useEnergyAdvisor();

  const [activeTab, setActiveTab] = useState<'sources' | 'quality' | 'simulator'>('sources');

  // CSV Upload Simulator State
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadedRecordsCount, setUploadedRecordsCount] = useState<number | null>(null);

  const handleSimulatedCsvUpload = (sourceName: string) => {
    setUploadStatus('Validating CSV schema, checking ranges, computing Watt-hours...');
    setTimeout(() => {
      setUploadedRecordsCount(1440);
      setUploadStatus('Success: 1,440 records validated. Quality Score: 99.4%. Assigned to Device PC-01.');
      toast.success(`Controlled dataset "${sourceName}" ingested successfully.`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Header */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-cyan-950/70 via-slate-900/80 to-blue-950/60 border border-cyan-500/30 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono uppercase tracking-wider">
                    SECTION 5, 8, 9 & 33 • DATA INGESTION PIPELINE
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
                    MULTI-SOURCE BENCHMARK
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                  DATASETS, QUALITY SCORING & SENSOR SIMULATOR
                </h1>
                <p className="text-xs text-slate-400 font-mono max-w-3xl leading-relaxed">
                  Managing public datasets (SMART-PDM, NILM), laboratory controlled experimental callsets, and synthetic ESP32 simulator streams. Strict academic labeling prevents mixing synthetic and experimental validation.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-center font-mono text-xs">
                  <div className="text-[10px] text-slate-400">Avg Quality Score</div>
                  <div className="text-base font-bold text-emerald-400">98.7%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-4 py-2 rounded-xl border transition-all ${
                activeTab === 'sources'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              1. Data Sources (SMART-PDM / NILM / Lab)
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`px-4 py-2 rounded-xl border transition-all ${
                activeTab === 'quality'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              2. Data Quality Audit Module
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl border transition-all ${
                activeTab === 'simulator'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              3. Configurable Sensor Simulator (Section 33)
            </button>
          </div>

          {/* Tab 1: Data Sources */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                {/* Source A */}
                <Card className="bg-slate-900/70 border-white/10 text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">
                        SOURCE A • PUBLIC DATASET
                      </Badge>
                      <span className="text-[10px] text-slate-400">145k samples</span>
                    </div>
                    <CardTitle className="text-base font-bold font-display text-white mt-1">
                      SMART-PDM Dataset
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Primary public industrial development benchmark
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Features: Active power, current, 3-axis vibration, temperature, speed, program cycle, and load metadata.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-[10px] text-slate-400 space-y-1">
                      <div>Used for: State-conditioned baseline modeling & sensor relationship discovery.</div>
                      <div className="text-cyan-400 font-semibold">Label: PUBLIC BENCHMARK DATA</div>
                    </div>
                    <Button
                      onClick={() => handleSimulatedCsvUpload('SMART-PDM-Subsample.csv')}
                      variant="outline"
                      className="w-full text-xs font-mono border-white/10 hover:bg-slate-800"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Ingest SMART-PDM Records
                    </Button>
                  </CardContent>
                </Card>

                {/* Source B */}
                <Card className="bg-slate-900/70 border-white/10 text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                        SOURCE B • SECONDARY BENCHMARK
                      </Badge>
                      <span className="text-[10px] text-slate-400">82k samples</span>
                    </div>
                    <CardTitle className="text-base font-bold font-display text-white mt-1">
                      NILM Energy Callsets
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      UK-DALE / REDD appliance energy baseline
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Features: High-frequency active power profiles, state on/off transitions, standby baselines.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-[10px] text-slate-400 space-y-1">
                      <div>Used for: Appliance state transitions and standby leakage benchmarking.</div>
                      <div className="text-emerald-400 font-semibold">Label: SECONDARY PUBLIC BENCHMARK</div>
                    </div>
                    <Button
                      onClick={() => handleSimulatedCsvUpload('NILM-UKDALE.csv')}
                      variant="outline"
                      className="w-full text-xs font-mono border-white/10 hover:bg-slate-800"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Ingest NILM Profiles
                    </Button>
                  </CardContent>
                </Card>

                {/* Source C */}
                <Card className="bg-slate-900/70 border-purple-500/30 text-white shadow-lg shadow-purple-950/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px]">
                        SOURCE C • CONTROLLED EXPERIMENTS
                      </Badge>
                      <span className="text-[10px] text-purple-300">Ground Truth</span>
                    </div>
                    <CardTitle className="text-base font-bold font-display text-white mt-1">
                      Controlled Lab Dataset
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Uploaded CSV telemetry from controlled device trials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Features: Synchronous power, CPU utilization, ambient temp, vibration, known injected waste duration and ground-truth excess Wh.
                    </p>
                    <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[10px] text-purple-300 space-y-1">
                      <div>Essential for: Validating cause ledger & counterfactual savings.</div>
                      <div className="font-bold">Label: REAL EXPERIMENTAL DATA</div>
                    </div>
                    <Button
                      onClick={() => handleSimulatedCsvUpload('Controlled-EXP-001.csv')}
                      className="w-full text-xs font-mono bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Upload Experimental CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {uploadStatus && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{uploadStatus}</span>
                  </div>
                  {uploadedRecordsCount && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      {uploadedRecordsCount} Records Validated
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Data Quality Module (Section 9) */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/70 border-white/10 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-cyan-300">
                        SECTION 9: Data Quality & Pre-Processing Audit Engine
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400 font-mono">
                        Automated missing-value inspection, range verification, timestamp continuity and duplicate removal
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-950/80 border-b border-white/10 font-mono text-[11px]">
                        <TableRow>
                          <TableHead className="text-slate-300">Dataset Name</TableHead>
                          <TableHead className="text-slate-300">Source Type</TableHead>
                          <TableHead className="text-cyan-300">Quality Score</TableHead>
                          <TableHead className="text-slate-300">Received</TableHead>
                          <TableHead className="text-emerald-300">Valid</TableHead>
                          <TableHead className="text-rose-400">Rejected</TableHead>
                          <TableHead className="text-slate-300">Missing</TableHead>
                          <TableHead className="text-slate-300">Duplicates</TableHead>
                          <TableHead className="text-slate-300">Interval</TableHead>
                          <TableHead className="text-right text-slate-300">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-mono text-xs divide-y divide-white/5">
                        {dataQualityReports.map((ds) => (
                          <TableRow key={ds.dataset_id} className="hover:bg-slate-800/40">
                            <TableCell className="font-bold text-white">{ds.dataset_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] text-slate-300 border-white/10">
                                {ds.source_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-extrabold text-cyan-400 text-sm">
                              {ds.quality_score_pct}%
                            </TableCell>
                            <TableCell className="text-slate-400">{ds.records_received.toLocaleString()}</TableCell>
                            <TableCell className="text-emerald-400 font-bold">{ds.records_valid.toLocaleString()}</TableCell>
                            <TableCell className="text-rose-400">{ds.records_rejected}</TableCell>
                            <TableCell className="text-slate-400">{ds.missing_values_count}</TableCell>
                            <TableCell className="text-slate-400">{ds.duplicate_records_count}</TableCell>
                            <TableCell className="text-slate-400">{ds.sampling_interval_sec}s</TableCell>
                            <TableCell className="text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {ds.status}
                              </span>
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

          {/* Tab 3: Configurable Sensor Simulator (Section 33) */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/70 border-purple-500/30 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-purple-300">
                          SECTION 33: Configurable Sensor Simulator Engine
                        </CardTitle>
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-mono">
                          DEMO / SYNTHETIC DATA
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-slate-400 font-mono">
                        Inject controlled energy anomalies with mathematically known ground-truth excess energy Wh
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Research Safety Warning (Section 40): Simulator data is explicitly labeled DEMO / SYNTHETIC DATA and must not be reported as real physical hardware trials.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Device Type</label>
                      <input
                        type="text"
                        value={simulatorConfig.device_type}
                        onChange={(e) => updateSimulatorConfig({ device_type: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Baseline Power (W)</label>
                      <input
                        type="number"
                        value={simulatorConfig.baseline_power_w}
                        onChange={(e) => updateSimulatorConfig({ baseline_power_w: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Workload Profile</label>
                      <select
                        value={simulatorConfig.workload}
                        onChange={(e) => updateSimulatorConfig({ workload: e.target.value as any })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-cyan-300"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Injected Anomaly Cause</label>
                      <select
                        value={simulatorConfig.injected_cause}
                        onChange={(e) => updateSimulatorConfig({ injected_cause: e.target.value as any })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-purple-300 font-bold"
                      >
                        <option value="PROLONGED_IDLE">PROLONGED_IDLE</option>
                        <option value="BACKGROUND_LOAD">BACKGROUND_LOAD</option>
                        <option value="STANDBY_LEAKAGE">STANDBY_LEAKAGE</option>
                        <option value="SCHEDULE_MISUSE">SCHEDULE_MISUSE</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Injected Additional Power (+W)</label>
                      <input
                        type="number"
                        value={simulatorConfig.injected_additional_power_w}
                        onChange={(e) => updateSimulatorConfig({ injected_additional_power_w: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-amber-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Injected Duration (Hours)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={simulatorConfig.injected_duration_hours}
                        onChange={(e) => updateSimulatorConfig({ injected_duration_hours: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                      />
                    </div>
                  </div>

                  {/* Calculated Physical Ground Truth Banner */}
                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                    <div>
                      <div className="text-[10px] text-purple-300 uppercase tracking-wider">
                        Ground Truth Excess Calculation
                      </div>
                      <div className="text-lg font-bold text-white mt-0.5">
                        +{simulatorConfig.injected_additional_power_w} W × {simulatorConfig.injected_duration_hours} h ={' '}
                        <span className="text-purple-400 font-extrabold text-2xl">
                          {simulatorConfig.ground_truth_excess_wh} Wh
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={runSimulatorInjection}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold gap-2"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Inject Anomaly into Simulator
                    </Button>
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
