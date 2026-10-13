import { createFileRoute, Link } from "@tanstack/react-router";
import { useEnergyAdvisor } from "@/lib/energy-advisor-context";
import { ResearchTopNav } from "@/components/energy-advisor/ResearchTopNav";
import { ResearchSidebar } from "@/components/energy-advisor/ResearchSidebar";
import { ResearchPipelineBanner } from "@/components/energy-advisor/ResearchPipelineBanner";
import { ActualVsExpectedChart } from "@/components/energy-advisor/ActualVsExpectedChart";
import { OperatingStateCards } from "@/components/energy-advisor/OperatingStateCards";
import { ExcessEnergyAnalysisCard } from "@/components/energy-advisor/ExcessEnergyAnalysisCard";
import { MultiSignalVerificationCard } from "@/components/energy-advisor/MultiSignalVerificationCard";
import { TemporalPatternCard } from "@/components/energy-advisor/TemporalPatternCard";
import { CauseAttributionCard } from "@/components/energy-advisor/CauseAttributionCard";
import { LiveTelemetryPanel } from "@/components/energy-advisor/LiveTelemetryPanel";
import { AlertsDrawer } from "@/components/energy-advisor/AlertsDrawer";
import { BeforeAfterSavingCard } from "@/components/energy-advisor/BeforeAfterSavingCard";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Cpu,
  Layers,
  Leaf,
  Pause,
  Radio,
  ShieldAlert,
  Sparkles,
  Split,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/research-dashboard")({
  head: () => ({
    meta: [
      {
        title:
          "ENERGY ADVISOR — Context-Aware Energy Monitoring, Excess Energy Detection & Energy-Saving Analysis",
      },
    ],
  }),
  component: ResearchDashboardPage,
});

export function ResearchDashboardPage() {
  const {
    devices,
    selectedDevice,
    setSelectedDeviceId,
    timeSeriesData,
    causeAttribution,
    beforeAfterList,
    alerts,
    acknowledgeAlert,
    dismissAlert,
    liveLastSyncSeconds,
  } = useEnergyAdvisor();

  // Aggregate stats across all devices
  const totalActualPower = devices.reduce((sum, d) => sum + d.currentPowerW, 0);
  const totalExpectedPower = devices.reduce((sum, d) => sum + d.expectedPowerW, 0);
  const totalExcessPower = Math.max(0, totalActualPower - totalExpectedPower);
  const excessPercentage = Math.round((totalExcessPower / totalExpectedPower) * 100 * 10) / 10;
  const devicesRequiringAttention = devices.filter(
    (d) => d.status === "VERIFIED" || d.status === "DETECTED" || d.status === "UNDER_REVIEW",
  ).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Header */}
      <ResearchTopNav />

      <div className="flex-1 flex">
        {/* Left Navigation Sidebar */}
        <ResearchSidebar />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Subtitle & Research Header Notice */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                  ENERGY ADVISOR
                </h1>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
                  B.Tech CS Final Project
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                Context-Aware Energy Monitoring, Excess Energy Detection & Energy-Saving Analysis
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Edge Telemetry Active:</span>
              <span className="text-white font-bold">3 Nodes</span>
            </div>
          </div>

          {/* RESEARCH KPI SUMMARY BAR */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-[#0b162c] via-[#091122] to-[#0d1e38] border border-cyan-500/40 shadow-xl font-mono">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <div className="border-r border-white/10 pr-3">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-semibold">
                    Total Excess Energy
                  </span>
                  <span className="text-xl font-bold text-white mt-0.5 block">2,840 Wh</span>
                  <span className="text-[10px] text-slate-400">Cumulative today</span>
                </div>
                <div className="border-r border-white/10 pr-3">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">
                    Top Waste Cause
                  </span>
                  <span className="text-xl font-bold text-amber-300 mt-0.5 block truncate">
                    PROLONGED IDLE
                  </span>
                  <span className="text-[10px] text-slate-400">48.2% of total excess</span>
                </div>
                <div className="border-r border-white/10 pr-3">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">
                    Estimated Saving
                  </span>
                  <span className="text-xl font-bold text-emerald-300 mt-0.5 block">1,420 Wh</span>
                  <span className="text-[10px] text-slate-400">Under approved actions</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-400 uppercase tracking-wider block font-semibold">
                    Rec. Effectiveness
                  </span>
                  <span className="text-xl font-bold text-purple-300 mt-0.5 block">91.3%</span>
                  <span className="text-[10px] text-slate-400">Compliance & fidelity</span>
                </div>
              </div>

              {/* Quick Actions to Paper Experiments */}
              <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-4">
                <Button
                  asChild
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs gap-1"
                >
                  <Link to="/experiment-runner">
                    <Play className="h-3 w-3 fill-current" /> Run Experiments
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-xs bg-slate-900/60 hover:bg-slate-800 text-slate-200"
                >
                  <Link to="/latex-export">
                    <FileText className="h-3 w-3 text-cyan-400" /> Export LaTeX
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* EXCESS DEVIATION VIEW: TOP WORST OFFENDING DEVICES */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-4 shadow-lg font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Device Excess Deviation Ranking (Worst-to-Best)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Sorted by excess power descending</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
              {[...devices]
                .sort((a, b) => b.excessPowerW - a.excessPowerW)
                .map((d, idx) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDeviceId(d.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      d.id === selectedDevice.id
                        ? "bg-cyan-950/40 border-cyan-500/50 shadow-md"
                        : "bg-slate-900/60 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold">
                        #{idx + 1} {d.name}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          d.excessPowerW > 20
                            ? "bg-red-500/20 text-red-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        +{d.excessPowerW} W
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>
                        State: <strong className="text-cyan-300">{d.currentState}</strong>
                      </span>
                      <span>
                        Act: {d.currentPowerW}W / Exp: {d.expectedPowerW}W
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 4: 6 KPI CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* CARD 1: Current Power */}
            <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono font-medium">Current Power</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                  LIVE
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-white font-mono">
                  {Math.round(totalActualPower)} W
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-cyan-400" /> Across 4 lab machines
                </div>
              </div>
            </div>

            {/* CARD 2: Expected Power */}
            <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono font-medium">Expected Power</span>
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-cyan-300 font-mono">
                  {totalExpectedPower} W
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Based on operating states
                </div>
              </div>
            </div>

            {/* CARD 3: Excess Power (Visually Prominent!) */}
            <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-[#1a1309] to-[#0d131f] p-4 shadow-xl shadow-amber-950/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-mono font-bold tracking-wider uppercase">
                  Excess Power
                </span>
                <ShieldAlert className="h-4 w-4 text-amber-400 animate-pulse" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-amber-400 font-mono">
                  +{totalExcessPower} W
                </div>
                <div className="text-[11px] text-amber-300 font-mono mt-1 font-semibold">
                  {excessPercentage}% above expected
                </div>
              </div>
            </div>

            {/* CARD 4: Today's Excess Energy */}
            <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono font-medium">Today's Excess Energy</span>
                <Clock className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-amber-300 font-mono">2.84 kWh</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Potential energy lost
                </div>
              </div>
            </div>

            {/* CARD 5: Energy Saved Today */}
            <div className="rounded-2xl border border-emerald-500/30 bg-[#0a1618] p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-xs font-mono font-medium">Energy Saved Today</span>
                <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-emerald-400 font-mono">1.42 kWh</div>
                <div className="text-[10px] text-emerald-400/80 font-mono mt-1">
                  Verified after actions
                </div>
              </div>
            </div>

            {/* CARD 6: Devices Requiring Attention */}
            <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono font-medium">Attention Required</span>
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-red-400 font-mono">
                  {devicesRequiringAttention}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Verified / Review anomalies
                </div>
              </div>
            </div>
          </section>

          {/* Section 22: VISUAL RESEARCH WORKFLOW PIPELINE */}
          <section>
            <ResearchPipelineBanner />
          </section>

          {/* Section 5: OPERATING STATE OVERVIEW */}
          <section>
            <OperatingStateCards devices={devices} onSelectDevice={setSelectedDeviceId} />
          </section>

          {/* Section 6: CORE RESEARCH VISUALIZATION (Actual vs Expected Chart) */}
          <section>
            <ActualVsExpectedChart data={timeSeriesData} deviceName={selectedDevice.name} />
          </section>

          {/* Section 7 & 8: EXCESS ENERGY ANALYSIS & MULTI-SIGNAL SENSOR VERIFICATION */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExcessEnergyAnalysisCard
              currentState={selectedDevice.currentState}
              expectedPowerW={selectedDevice.expectedPowerW}
              actualPowerW={selectedDevice.currentPowerW}
              durationMinutes={38}
              estimatedExcessWh={31}
              confidencePercent={91}
              verificationStatus={selectedDevice.status}
            />

            <MultiSignalVerificationCard
              powerW={selectedDevice.currentPowerW}
              temperatureC={selectedDevice.temperatureC}
              vibrationG={selectedDevice.vibrationG}
              activityLevel={selectedDevice.activityLevel}
              operatingState={selectedDevice.currentState}
              verificationStatus={selectedDevice.status}
              confidencePercent={91}
              explanation="Power consumption is significantly above the expected idle baseline while activity and vibration remain low."
            />
          </section>

          {/* Section 9 & 10: TEMPORAL PATTERN ANALYSIS & CAUSE ATTRIBUTION */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TemporalPatternCard />
            <CauseAttributionCard attribution={causeAttribution} deviceName={selectedDevice.name} />
          </section>

          {/* Section 15: MEASURED ENERGY-SAVING IMPACT (BEFORE VS AFTER) */}
          <section>
            <BeforeAfterSavingCard measurement={beforeAfterList[0]} />
          </section>

          {/* PRIMARY RESEARCH CONTRIBUTIONS 1 & 2 HIGHLIGHTS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
            {/* Contribution 1: Cause-Level Energy Ledger */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px]">
                    PRIMARY CONTRIBUTION 1
                  </Badge>
                  <span className="text-[11px] text-slate-400">Section 13 & 49</span>
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  Cause-Level Excess-Energy Accounting
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Moving from dimensionless anomaly scores to physical Watt-hour quantities:{" "}
                  <span className="text-cyan-300">
                    E_excess = E_actual - E_expected(state, workload, context)
                  </span>
                  . Filterable cause ledger validated via controlled hardware trials.
                </p>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-cyan-400 font-bold">Total Excess: 61.25 Wh</span>
                <Button
                  asChild
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs gap-1.5"
                >
                  <Link to="/excess-ledger">
                    Open Excess Ledger <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Contribution 2: Workload-Conditioned Counterfactual */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                    PRIMARY CONTRIBUTION 2
                  </Badge>
                  <span className="text-[11px] text-slate-400">Section 17 & 48</span>
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  Workload-Conditioned Counterfactual Evaluation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulating what the device would have consumed under the OLD policy (π0) during
                  the exact observed post-intervention workload (W_post):{" "}
                  <span className="text-emerald-300">E_saved = E_cf - E_post</span>. Eliminates
                  workload-shift bias.
                </p>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-bold">Verified Saved: +63 Wh</span>
                <Button
                  asChild
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs gap-1.5"
                >
                  <Link to="/counterfactual-analysis">
                    Open Counterfactual <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Section 19 & 20: LIVE TELEMETRY STREAM & REAL-TIME ALERTS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiveTelemetryPanel device={selectedDevice} syncSeconds={liveLastSyncSeconds} />
            <AlertsDrawer
              alerts={alerts}
              onAcknowledge={acknowledgeAlert}
              onDismiss={dismissAlert}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
