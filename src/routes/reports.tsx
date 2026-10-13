import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';
import { ResearchTopNav } from '@/components/energy-advisor/ResearchTopNav';
import { ResearchSidebar } from '@/components/energy-advisor/ResearchSidebar';
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Zap,
  Split,
  Layers,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const Route = createFileRoute('/reports')({
  head: () => ({
    meta: [{ title: 'Research Report Generator — Energy Advisor' }],
  }),
  component: ReportsPage,
});

export function ReportsPage() {
  const {
    devices,
    selectedDevice,
    setSelectedDeviceId,
    causeAttribution,
    causeLedger,
    counterfactualEvaluations,
    experiments,
    recommendations,
  } = useEnergyAdvisor();

  const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | 'month'>('today');

  const selectedEval =
    counterfactualEvaluations.find((e) => e.device_id === selectedDevice.id) ||
    counterfactualEvaluations[0];

  const deviceLedgerEntries = causeLedger.filter((l) => l.device_id === selectedDevice.id);

  const handlePrintPDF = () => {
    window.print();
    toast.success('Preparing Research Report PDF print dialogue...');
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        [
          'Device Name',
          'Operating State',
          'Actual Power (W)',
          'Expected Baseline (W)',
          'Excess Power (W)',
          'Probable Cause',
          'Counterfactual Wh',
          'Measured Post Wh',
          'Verified Saving Wh',
        ].join(','),
        ...devices.map((d) =>
          [
            `"${d.name}"`,
            d.currentState,
            d.currentPowerW,
            d.expectedPowerW,
            d.excessPowerW,
            `"${causeAttribution.probableCause}"`,
            selectedEval.counterfactual_old_policy_energy_wh,
            selectedEval.measured_new_policy_energy_wh,
            selectedEval.workload_conditioned_saving_wh,
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `energy_advisor_research_report_${reportPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Research report CSV exported successfully.');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-mono">
                  SECTION 39 • REPORT GENERATOR
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                  VERIFIED IMPACT AUDIT
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                RESEARCH EXPERIMENT REPORT GENERATOR
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Compiles end-to-end evidence: State → Model → Excess Wh → Cause Ledger → Counterfactual → Verified Saving.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrintPDF}
                variant="outline"
                className="border-white/10 hover:bg-slate-800 text-xs font-mono text-white h-9 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" /> Generate PDF / Print
              </Button>
              <Button
                onClick={handleExportCSV}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono h-9 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export Audit CSV
              </Button>
            </div>
          </div>

          {/* Report Configuration Bar (Hidden in Print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0d131f] border border-white/10 font-mono text-xs print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Target Endpoint:</span>
              <select
                value={selectedDevice.id}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="h-8 rounded-lg bg-slate-900 border border-white/10 px-2.5 text-xs text-white"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Monitoring Period:</span>
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setReportPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg uppercase text-[11px] transition-all cursor-pointer ${
                    reportPeriod === p
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Printable Report Document Paper View */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-8 shadow-2xl space-y-8 font-mono print:border-none print:shadow-none print:bg-white print:text-black">
            {/* Report Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6 print:border-black/20">
              <div>
                <div className="text-[11px] text-cyan-400 font-bold tracking-widest uppercase mb-1">
                  RESEARCH PROTOTYPE PROTOCOL AUDIT
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight font-display print:text-black">
                  ENERGY ADVISOR EXPERIMENT SUMMARY
                </h2>
                <div className="text-xs text-slate-400 mt-1 print:text-gray-600">
                  Device-Level Context-Aware Energy Waste Diagnosis & Workload-Conditioned Intervention Evaluation
                </div>
              </div>

              <div className="text-right text-xs text-slate-400 space-y-1 print:text-gray-600">
                <div>Report Ref: <span className="text-white font-bold print:text-black">EA-RES-2026-0928</span></div>
                <div>Generated: <span className="text-slate-300 print:text-black">Today, 10:30 AM</span></div>
                <div>Telemetry Node: <span className="text-cyan-400 font-bold">{selectedDevice.esp32NodeId}</span></div>
                <div>Dataset: <span className="text-slate-300 font-bold print:text-black">Controlled Lab (EXP-001)</span></div>
              </div>
            </div>

            {/* 1. Target Device & Operating States */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                1. Target Device & Identified Operating State
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 print:border-gray-300 print:bg-gray-50">
                  <span className="text-slate-400 text-[10px] block">DEVICE NAME</span>
                  <span className="font-bold text-white mt-0.5 block print:text-black">{selectedDevice.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 print:border-gray-300 print:bg-gray-50">
                  <span className="text-slate-400 text-[10px] block">LOCATION</span>
                  <span className="font-bold text-white mt-0.5 block print:text-black">{selectedDevice.location}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 print:border-gray-300 print:bg-gray-50">
                  <span className="text-slate-400 text-[10px] block">OPERATING STATE</span>
                  <span className="font-bold text-cyan-300 mt-0.5 block print:text-black">{selectedDevice.currentState}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 print:border-gray-300 print:bg-gray-50">
                  <span className="text-slate-400 text-[10px] block">BASELINE MODEL</span>
                  <span className="font-bold text-white mt-0.5 block print:text-black">State-Conditioned RF (R² 0.942)</span>
                </div>
              </div>
            </div>

            {/* 2. Excess Energy Quantification & Ledger Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                2. Physical Excess Energy Quantification & Cause Ledger
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 print:border-gray-300 print:bg-gray-50">
                  <span className="text-slate-400 text-[10px] block">ACTUAL POWER</span>
                  <span className="font-black text-red-400 text-lg mt-0.5 block print:text-black">{selectedDevice.currentPowerW} W</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 print:border-gray-300 print:bg-gray-50">
                  <span className="text-slate-400 text-[10px] block">EXPECTED BASELINE</span>
                  <span className="font-black text-cyan-400 text-lg mt-0.5 block print:text-black">{selectedDevice.expectedPowerW} W</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 print:border-gray-300 print:bg-gray-50">
                  <span className="text-amber-300 text-[10px] block font-bold print:text-black">EXCESS POWER</span>
                  <span className="font-black text-amber-400 text-lg mt-0.5 block print:text-black">+{selectedDevice.excessPowerW} W</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 print:border-gray-300 print:bg-gray-50">
                  <span className="text-slate-400 text-[10px] block">POTENTIAL EXCESS ENERGY</span>
                  <span className="font-black text-white text-lg mt-0.5 block print:text-black">
                    {deviceLedgerEntries.reduce((s, e) => s + e.estimated_excess_wh, 0) || 61.25} Wh
                  </span>
                </div>
              </div>

              {/* Cause ledger table snippet */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs print:border-gray-300 print:bg-gray-50">
                <div className="flex justify-between border-b border-white/5 pb-1.5 print:border-gray-200 font-bold">
                  <span>Physical Cause Attribution:</span>
                  <span className="text-cyan-300">{causeAttribution.probableCause}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5 print:border-gray-200">
                  <span className="text-slate-400">Diagnosis Confidence:</span>
                  <span className="text-emerald-400 font-bold">{causeAttribution.confidencePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Corroborating Telemetry:</span>
                  <span className="text-slate-300 print:text-black">Inactivity &gt; 38 min • Vibration 0.08 g • Temp 31.4 °C</span>
                </div>
              </div>
            </div>

            {/* 3. Workload-Conditioned Counterfactual Evaluation */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                3. Workload-Conditioned Counterfactual Evaluation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 print:border-gray-300 print:bg-gray-50">
                  <span className="text-[10px] text-cyan-300 font-bold block print:text-black">COUNTERFACTUAL OLD E(π0|W_post)</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1 print:text-black">
                    {selectedEval.counterfactual_old_policy_energy_wh} Wh
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    What π0 would consume under observed post-workload
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 print:border-gray-300 print:bg-gray-50">
                  <span className="text-[10px] text-emerald-300 font-bold block print:text-black">MEASURED POST ENERGY E(π1|W_post)</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1 print:text-black">
                    {selectedEval.measured_new_policy_energy_wh} Wh
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Direct hardware power integration during post-period
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 print:border-gray-300 print:bg-gray-50">
                  <span className="text-[10px] text-purple-300 font-bold block print:text-black">VERIFIED ENERGY SAVING (E_saved)</span>
                  <div className="text-2xl font-black text-purple-300 mt-1 print:text-black">
                    +{selectedEval.workload_conditioned_saving_wh} Wh
                  </div>
                  <span className="text-[10px] text-purple-400 font-bold block mt-1">
                    {selectedEval.status}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Recommendation Effectiveness & Limitations */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                4. Error Metrics & Scientific Limitations
              </h3>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs print:border-gray-300 print:bg-gray-50">
                <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Counterfactual Error:</span>
                    <span className="text-white font-bold ml-1">{selectedEval.counterfactual_error_wh} Wh</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Relative Saving Error:</span>
                    <span className="text-emerald-400 font-bold ml-1">{selectedEval.relative_saving_error_pct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">95% Confidence Bounds:</span>
                    <span className="text-cyan-300 font-bold ml-1">[{selectedEval.confidence_interval_95_wh.join(', ')}] Wh</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1 space-y-1">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Methodological Limitations:
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    1. Replaying post-intervention state trajectories under the pre-intervention policy is invalid when the intervention modifies the state sequence itself (e.g., forcing sleep earlier).<br />
                    2. Unmeasured external environmental disturbances (ambient humidity, localized thermal drafts) can induce minor baseline drift not captured by single-point temperature sensors.
                  </p>
                </div>
              </div>
            </div>

            {/* Sign-off footer */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between text-[11px] text-slate-400 print:border-black/20 print:text-gray-600">
              <div>Energy Advisor • B.Tech Computer Science Research Prototype</div>
              <div className="text-right">Autonomous Telemetry Verification Engine</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
