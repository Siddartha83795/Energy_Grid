import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Server,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Copy,
  Check,
  Layers,
  Terminal,
  ShieldCheck,
  Activity,
  Sliders,
  Sparkles,
  Info,
  RefreshCw,
  Box,
  TrendingDown,
  Power,
  Leaf,
  Users,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  getClusterFleetStatus,
  generateClusterWorkloadConfig,
  scheduleGridComputeWithAi,
  type DeviceProfileRequest,
  type GeneratedConfigs,
  type GridSchedulingResponse,
} from "@/lib/cluster-devices.functions";

export const Route = createFileRoute("/cluster-devices")({
  head: () => ({
    meta: [{ title: "Cluster Device Orchestration & Slicing — Energy Advisor" }],
  }),
  component: ClusterDevicesPage,
});

function ClusterDevicesPage() {
  const fetchStatus = useServerFn(getClusterFleetStatus);
  const generateConfig = useServerFn(generateClusterWorkloadConfig);
  const runAiScheduler = useServerFn(scheduleGridComputeWithAi);

  const { data: fleetData } = useQuery({
    queryKey: ["clusterFleetStatus"],
    queryFn: () => fetchStatus(),
  });

  // Top-Level Main Section Tab
  const [mainView, setMainView] = useState<"scheduler" | "manual_builder">("scheduler");

  // Grid AI Scheduler State
  const [totalUsers, setTotalUsers] = useState<number>(1000);
  const [gridSurplusKw, setGridSurplusKw] = useState<number>(180);
  const [schedulingStrategy, setSchedulingStrategy] = useState<
    "green_surplus_boost" | "carbon_cost_minimizer" | "high_throughput_balanced"
  >("green_surplus_boost");
  const [schedulingResult, setSchedulingResult] = useState<GridSchedulingResponse | null>(null);
  const [schedulerBusy, setSchedulerBusy] = useState(false);

  // Manual Builder State
  const [tier, setTier] = useState<"tier1" | "tier2" | "tier3">("tier1");
  const [jobName, setJobName] = useState("pytorch-workload-01");
  const [workloadType, setWorkloadType] = useState<
    "jupyter" | "pytorch_training" | "vllm_inference" | "distributed_deepspeed"
  >("jupyter");
  const [gpuType, setGpuType] = useState<DeviceProfileRequest["gpuType"]>("mig_1g_10gb");
  const [gpuCount, setGpuCount] = useState<number>(1);
  const [cpuCores, setCpuCores] = useState<number>(4);
  const [cpuIsolation, setCpuIsolation] = useState<"shared" | "pinned_exclusive">("shared");
  const [numaBinding, setNumaBinding] = useState<boolean>(true);
  const [numaNode, setNumaNode] = useState<number>(0);
  const [systemMemoryGb, setSystemMemoryGb] = useState<number>(32);
  const [storageType, setStorageType] = useState<"ephemeral" | "nvme_local" | "shared_nfs">(
    "ephemeral",
  );
  const [storageSizeGb, setStorageSizeGb] = useState<number>(50);
  const [networkInterconnect, setNetworkInterconnect] = useState<
    "standard_eth" | "sriov_rdma_ib" | "roce_v2"
  >("standard_eth");

  const [builderTab, setBuilderTab] = useState<"k8s" | "slurm" | "jupyter" | "host_cli">("k8s");
  const [policyTab, setPolicyTab] = useState<"slurm_conf" | "k8s_kueue" | "power_script">(
    "slurm_conf",
  );
  const [copied, setCopied] = useState(false);
  const [configs, setConfigs] = useState<GeneratedConfigs | null>(null);

  // Auto-run AI scheduler on initial load
  useEffect(() => {
    handleRunScheduler();
  }, []);

  const handleRunScheduler = async () => {
    setSchedulerBusy(true);
    try {
      const res = await runAiScheduler({
        data: {
          totalUsers,
          gridSurplusKw,
          energyTariffInr: 8.0,
          schedulingStrategy,
        },
      });
      setSchedulingResult(res);
      toast.success("AI Energy-Grid Scheduling plan generated!");
    } catch (e: any) {
      toast.error(e?.message || "Scheduling optimization failed");
    } finally {
      setSchedulerBusy(false);
    }
  };

  // Re-generate manual configs on parameter changes
  useEffect(() => {
    generateConfig({
      data: {
        tier,
        gpuType,
        gpuCount,
        cpuCores,
        cpuIsolation,
        numaBinding,
        numaNode,
        systemMemoryGb,
        storageType,
        storageSizeGb,
        networkInterconnect,
        workloadType,
        jobName,
      },
    }).then((res) => {
      setConfigs(res);
    });
  }, [
    tier,
    gpuType,
    gpuCount,
    cpuCores,
    cpuIsolation,
    numaBinding,
    numaNode,
    systemMemoryGb,
    storageType,
    storageSizeGb,
    networkInterconnect,
    workloadType,
    jobName,
    generateConfig,
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Configuration copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Server className="h-6 w-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Energy Grid GPU & Multi-Device Orchestration
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
            Autonomous energy-aware GPU/CPU scheduling across 120 bare-metal nodes and 160 physical
            GPUs. Dynamically partitions hardware MIG, Time-Slices, and direct NVMe storage while
            routing grid surplus power and consolidating idle standby waste.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1.5 gap-1.5 font-mono text-xs"
          >
            <Activity className="h-3.5 w-3.5 animate-pulse" /> Fleet: 120 Nodes | 160 GPUs Online
          </Badge>
        </div>
      </div>

      {/* Cluster Telemetry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/50 space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
            <span>Fleet Inventory</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {fleetData?.fleet.totalNodes ?? 120}{" "}
            <span className="text-xs text-muted-foreground font-sans font-normal">nodes</span> /{" "}
            {fleetData?.fleet.totalGpus ?? 160}{" "}
            <span className="text-xs text-muted-foreground font-sans font-normal">GPUs</span>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            40x SXM4 A100 | 40x PCIe A100 | 80x RTX 4090
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/50 space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
            <span>Hardware MIG Slices</span>
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {fleetData?.slicingCapacity.migSlicesTotal ?? 1120}{" "}
            <span className="text-xs text-muted-foreground font-sans font-normal">total</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {fleetData?.slicingCapacity.migSlicesAllocated ?? 684} active hardware instances
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/50 space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
            <span>Time-Slice / MPS Slots</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {fleetData?.slicingCapacity.timeSlicesTotal ?? 1280}{" "}
            <span className="text-xs text-muted-foreground font-sans font-normal">virtual</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            8x–10x oversubscription multiplier
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/50 space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
            <span>Member Capacity</span>
            <ShieldCheck className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-violet-400">
            {totalUsers}{" "}
            <span className="text-xs text-muted-foreground font-sans font-normal">members</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            70% Dev | 25% Fine-Tune | 5% Heavy ML
          </div>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setMainView("scheduler")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            mainView === "scheduler"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Sparkles className="h-4 w-4" /> AI Energy-Grid Scheduler (1,000 Users & Power Slicing)
        </button>
        <button
          onClick={() => setMainView("manual_builder")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            mainView === "manual_builder"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Sliders className="h-4 w-4" /> Granular Multi-Device Customizer (Pod & #SBATCH)
        </button>
      </div>

      {/* VIEW 1: AI ENERGY-GRID SCHEDULER */}
      {mainView === "scheduler" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-emerald-400" /> Grid Energy & Capacity Scheduling
                  Parameters
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure member demand, grid renewable surplus, and power optimization goals for
                  Groq AI.
                </p>
              </div>
              <Button
                onClick={handleRunScheduler}
                disabled={schedulerBusy}
                className="gap-2 font-semibold shadow-md bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {schedulerBusy ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {schedulerBusy ? "Optimizing Fleet..." : "Run AI Grid Scheduler"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Member Count Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> Target Member Base
                  </span>
                  <span className="font-mono text-primary font-bold">{totalUsers} Users</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1500}
                  step={50}
                  value={totalUsers}
                  onChange={(e) => setTotalUsers(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>50 Users (Small Team)</span>
                  <span>1,000 (Full Fleet)</span>
                  <span>1,500 (Heavy)</span>
                </div>
              </div>

              {/* Grid Power Surplus */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Leaf className="h-4 w-4 text-emerald-400" /> Grid Renewable Surplus
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{gridSurplusKw} kW</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={20}
                  value={gridSurplusKw}
                  onChange={(e) => setGridSurplusKw(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0 kW (Off-Peak)</span>
                  <span>250 kW (Solar Peak)</span>
                  <span>500 kW (Max)</span>
                </div>
              </div>

              {/* Strategy Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" /> Optimization Strategy
                </label>
                <select
                  value={schedulingStrategy}
                  onChange={(e) => setSchedulingStrategy(e.target.value as any)}
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="green_surplus_boost">
                    🌿 Green Surplus Boost (Turbocharge high-impact jobs with solar kW)
                  </option>
                  <option value="carbon_cost_minimizer">
                    💰 Carbon & Cost Minimizer (Power down idle nodes & cap TDP)
                  </option>
                  <option value="high_throughput_balanced">
                    ⚖️ High Throughput Fair-Share (Maximize simultaneous active slots)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Scheduling Results */}
          {schedulingResult && (
            <div className="space-y-6">
              {/* Narrative Summary Alert */}
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <Sparkles className="h-4 w-4" /> Groq AI Fleet Orchestration Narrative
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {schedulingResult.summary_plan}
                </p>
              </div>

              {/* Impact Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/60 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
                    <span>Power Saved</span>
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {schedulingResult.power_saved_kw}{" "}
                    <span className="text-xs text-muted-foreground font-sans font-normal">kW</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    From dynamic node consolidation
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/60 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
                    <span>Monthly Cost Saved</span>
                    <Leaf className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    ₹{schedulingResult.monthly_savings_inr.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Based on ₹8.00 / kWh tariff
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/60 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
                    <span>Active vs Sleeping</span>
                    <Server className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {schedulingResult.active_nodes_count}{" "}
                    <span className="text-xs text-muted-foreground font-sans font-normal">
                      active
                    </span>{" "}
                    / {schedulingResult.sleeping_consolidated_nodes}{" "}
                    <span className="text-xs text-amber-400 font-sans font-normal">sleep</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {schedulingResult.sleeping_consolidated_nodes} idle nodes powered down (C6)
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-card/60 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
                    <span>Surplus Absorbed</span>
                    <Zap className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {schedulingResult.grid_surplus_utilized_kw}{" "}
                    <span className="text-xs text-muted-foreground font-sans font-normal">kW</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Directly routed into high-priority compute
                  </div>
                </div>
              </div>

              {/* Tier Allocation Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Member Cohort & GPU Slice Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {schedulingResult.tier_allocations.map((ta, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/50 bg-card p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <span className="font-bold text-sm text-foreground">{ta.tier}</span>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          {ta.member_count} Members
                        </Badge>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GPU Profile:</span>
                          <span className="font-mono font-medium text-foreground text-right">
                            {ta.gpu_profile}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assigned Nodes:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {ta.assigned_nodes}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Power Cap / GPU:</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {ta.power_cap_watts_per_gpu} Watts
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CPU Cores / User:</span>
                          <span className="font-mono text-foreground">
                            {ta.cpu_cores_per_user} Cores (Pinned)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Power State Matrix Table */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Power className="h-4 w-4 text-emerald-400" /> Node Fleet Power State & Slicing
                  Matrix
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Node Range</th>
                        <th className="py-2.5 px-3">Hardware Spec</th>
                        <th className="py-2.5 px-3">Power State</th>
                        <th className="py-2.5 px-3">Energy Action</th>
                        <th className="py-2.5 px-3">Target Workload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {schedulingResult.node_power_actions.map((act, i) => (
                        <tr key={i} className="hover:bg-accent/20 transition-colors">
                          <td className="py-3 px-3 font-bold text-foreground">{act.node_range}</td>
                          <td className="py-3 px-3 text-muted-foreground">{act.hardware}</td>
                          <td className="py-3 px-3">
                            <Badge
                              variant="outline"
                              className={`font-mono text-[10px] ${
                                act.power_state.includes("Sleep") || act.power_state.includes("0W")
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {act.power_state}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-cyan-300">{act.action}</td>
                          <td className="py-3 px-3 text-muted-foreground font-sans">
                            {act.target_users}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deployable Policies & Scripts */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold">
                      Deployable Energy Grid Scheduling Policies
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const code =
                        policyTab === "slurm_conf"
                          ? schedulingResult.slurm_dynamic_partition_conf
                          : policyTab === "k8s_kueue"
                            ? schedulingResult.k8s_kueue_energy_manifest
                            : schedulingResult.power_capping_bash_script;
                      copyToClipboard(code);
                    }}
                    className="gap-1.5 h-8 text-xs font-mono"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy Policy"}
                  </Button>
                </div>

                <Tabs
                  value={policyTab}
                  onValueChange={(v) => setPolicyTab(v as any)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full bg-background/80 p-1 border border-border/60 rounded-xl">
                    <TabsTrigger value="slurm_conf" className="text-xs gap-1">
                      ⚡ Slurm Dynamic Partitioning
                    </TabsTrigger>
                    <TabsTrigger value="k8s_kueue" className="text-xs gap-1">
                      ☸️ K8s Kueue Energy Queue
                    </TabsTrigger>
                    <TabsTrigger value="power_script" className="text-xs gap-1">
                      🛠️ Node Power-Capping Script
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="slurm_conf" className="mt-4">
                    <pre className="p-4 rounded-xl bg-black/90 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-[400px]">
                      <code>{schedulingResult.slurm_dynamic_partition_conf}</code>
                    </pre>
                  </TabsContent>

                  <TabsContent value="k8s_kueue" className="mt-4">
                    <pre className="p-4 rounded-xl bg-black/90 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-[400px]">
                      <code>{schedulingResult.k8s_kueue_energy_manifest}</code>
                    </pre>
                  </TabsContent>

                  <TabsContent value="power_script" className="mt-4">
                    <pre className="p-4 rounded-xl bg-black/90 text-amber-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-[400px]">
                      <code>{schedulingResult.power_capping_bash_script}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MANUAL WORKLOAD BUILDER */}
      {mainView === "manual_builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Device Selection Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tier Selection */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" /> Select User Access Tier
                </h2>
                <Badge variant="secondary" className="font-mono text-xs">
                  {tier.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setTier("tier1");
                    setGpuType("mig_1g_10gb");
                    setGpuCount(1);
                    setCpuCores(4);
                    setCpuIsolation("shared");
                    setSystemMemoryGb(32);
                    setStorageType("ephemeral");
                    setStorageSizeGb(50);
                    setNetworkInterconnect("standard_eth");
                    setWorkloadType("jupyter");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tier === "tier1"
                      ? "bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary/40"
                      : "border-border/50 hover:bg-accent/40 text-muted-foreground"
                  }`}
                >
                  <div className="font-bold text-xs">Tier 1: Dev</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    70% users (1/7 MIG, 4 Cores)
                  </div>
                </button>

                <button
                  onClick={() => {
                    setTier("tier2");
                    setGpuType("mig_2g_20gb");
                    setGpuCount(1);
                    setCpuCores(16);
                    setCpuIsolation("pinned_exclusive");
                    setSystemMemoryGb(64);
                    setStorageType("nvme_local");
                    setStorageSizeGb(200);
                    setNetworkInterconnect("standard_eth");
                    setWorkloadType("pytorch_training");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tier === "tier2"
                      ? "bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary/40"
                      : "border-border/50 hover:bg-accent/40 text-muted-foreground"
                  }`}
                >
                  <div className="font-bold text-xs">Tier 2: Fine-Tune</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    25% users (2/7 MIG, NVMe)
                  </div>
                </button>

                <button
                  onClick={() => {
                    setTier("tier3");
                    setGpuType("full_a100_80gb");
                    setGpuCount(4);
                    setCpuCores(32);
                    setCpuIsolation("pinned_exclusive");
                    setSystemMemoryGb(256);
                    setStorageType("nvme_local");
                    setStorageSizeGb(1000);
                    setNetworkInterconnect("sriov_rdma_ib");
                    setWorkloadType("distributed_deepspeed");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tier === "tier3"
                      ? "bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary/40"
                      : "border-border/50 hover:bg-accent/40 text-muted-foreground"
                  }`}
                >
                  <div className="font-bold text-xs">Tier 3: Full ML</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    5% users (Full SXM, RDMA)
                  </div>
                </button>
              </div>
            </div>

            {/* Device Selection Parameters */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Box className="h-4 w-4 text-emerald-400" /> Device Specification
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Job / Workspace Identifier
                </label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. pytorch-llama-finetune"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>GPU Acceleration & Slicing Model</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    MIG / MPS / Bare-Metal
                  </span>
                </label>
                <select
                  value={gpuType}
                  onChange={(e) => setGpuType(e.target.value as any)}
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="none">No GPU (CPU-Only Analytics Node)</option>
                  <option value="mig_1g_10gb">
                    NVIDIA A100/H100 1/7 Hardware MIG (1g.10gb - 10GB VRAM)
                  </option>
                  <option value="mig_2g_20gb">
                    NVIDIA A100/H100 2/7 Hardware MIG (2g.20gb - 20GB VRAM)
                  </option>
                  <option value="mig_3g_40gb">
                    NVIDIA A100/H100 3/7 Hardware MIG (3g.40gb - 40GB VRAM)
                  </option>
                  <option value="rtx4090_slice">
                    NVIDIA RTX 4090 Software Time-Slice / MPS (1/8th VRAM)
                  </option>
                  <option value="full_a100_80gb">
                    1x Full Physical NVIDIA A100/H100 (80GB VRAM, Un-sliced)
                  </option>
                  <option value="multi_gpu_4x">
                    4x Full Physical NVIDIA A100 SXM4 (320GB NVLink)
                  </option>
                  <option value="multi_gpu_8x">
                    8x Full Physical NVIDIA H100 SXM5 (640GB NVLink HGX)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-primary" /> CPU Cores
                  </label>
                  <select
                    value={cpuCores}
                    onChange={(e) => setCpuCores(Number(e.target.value))}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={2}>2 Cores (Burst)</option>
                    <option value={4}>4 Cores (Dev Standard)</option>
                    <option value={8}>8 Cores</option>
                    <option value={16}>16 Cores (Fine-Tuning)</option>
                    <option value={32}>32 Cores (Heavy)</option>
                    <option value={64}>64 Cores (Full Socket)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Memory (RAM)
                  </label>
                  <select
                    value={systemMemoryGb}
                    onChange={(e) => setSystemMemoryGb(Number(e.target.value))}
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={16}>16 GB</option>
                    <option value={32}>32 GB</option>
                    <option value={64}>64 GB</option>
                    <option value={128}>128 GB</option>
                    <option value={256}>256 GB</option>
                    <option value={512}>512 GB</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/20 border border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      NUMA Node & CPU Core Pinning
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Locks memory to GPU's local PCIe controller
                    </div>
                  </div>
                  <Switch checked={numaBinding} onCheckedChange={setNumaBinding} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-cyan-400" /> Scratch Storage Device
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {storageSizeGb} GB
                  </span>
                </label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value as any)}
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ephemeral">Ephemeral Host Overlay Storage (50-100GB)</option>
                  <option value="nvme_local">
                    Direct Dedicated NVMe Block Scratch (/dev/nvme0n1)
                  </option>
                  <option value="shared_nfs">Distributed High-Throughput NFS Home Storage</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Network className="h-3.5 w-3.5 text-violet-400" /> Network Interconnect
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">SR-IOV / RoCE</span>
                </label>
                <select
                  value={networkInterconnect}
                  onChange={(e) => setNetworkInterconnect(e.target.value as any)}
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="standard_eth">Standard Virtual Ethernet NIC (10GbE)</option>
                  <option value="sriov_rdma_ib">
                    InfiniBand Mellanox ConnectX-6/7 RDMA Direct VF (100/200Gbps)
                  </option>
                  <option value="roce_v2">RoCE v2 Low-Latency Lossless Ethernet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right: Live Generated Orchestration Manifests */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold">Generated Orchestration Artifact</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const code =
                      builderTab === "k8s"
                        ? configs?.kubernetesYaml
                        : builderTab === "slurm"
                          ? configs?.slurmScript
                          : builderTab === "jupyter"
                            ? configs?.jupyterHubProfile
                            : configs?.hostCliCommands;
                    if (code) copyToClipboard(code);
                  }}
                  className="gap-1.5 h-8 text-xs font-mono"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy Manifest"}
                </Button>
              </div>

              <Tabs
                value={builderTab}
                onValueChange={(v) => setBuilderTab(v as any)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 w-full bg-background/80 p-1 border border-border/60 rounded-xl">
                  <TabsTrigger value="k8s" className="text-xs gap-1">
                    ☸️ K8s Pod
                  </TabsTrigger>
                  <TabsTrigger value="slurm" className="text-xs gap-1">
                    ⚡ Slurm #SBATCH
                  </TabsTrigger>
                  <TabsTrigger value="jupyter" className="text-xs gap-1">
                    🪐 JupyterHub
                  </TabsTrigger>
                  <TabsTrigger value="host_cli" className="text-xs gap-1">
                    🛠️ Host Verify
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="k8s" className="mt-4">
                  <pre className="p-4 rounded-xl bg-black/90 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-[500px]">
                    <code>{configs?.kubernetesYaml ?? "# Generating Kubernetes YAML..."}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="slurm" className="mt-4">
                  <pre className="p-4 rounded-xl bg-black/90 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-[500px]">
                    <code>{configs?.slurmScript ?? "# Generating Slurm script..."}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="jupyter" className="mt-4">
                  <pre className="p-4 rounded-xl bg-black/90 text-amber-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-[500px]">
                    <code>{configs?.jupyterHubProfile ?? "# Generating JupyterHub config..."}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="host_cli" className="mt-4">
                  <pre className="p-4 rounded-xl bg-black/90 text-violet-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 max-h-[500px]">
                    <code>
                      {configs?.hostCliCommands ?? "# Generating host verification CLI commands..."}
                    </code>
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
