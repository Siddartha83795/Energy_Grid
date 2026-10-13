import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Calendar,
  FolderOpen,
  Play,
  Upload as UploadIcon,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Zap,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Database,
  Info,
  RotateCcw,
  History,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { uploadFiles, analyze, setRunId, getRunId, getPastRunsList } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useEnergyAdvisor } from "@/lib/energy-advisor-context";
import {
  ENERGY_METER_TEMPLATE_CSV,
  MACHINE_OPERATION_TEMPLATE_CSV,
  PRODUCTION_CONTEXT_TEMPLATE_CSV,
  downloadCsvFile,
} from "@/lib/templates";
import { PRELOADED_DATASETS, PreloadedDatasetPackage } from "@/lib/preloaded-datasets";
import {
  inspectCsv,
  runEnergyAdvisorAnalysis,
  InspectionSummary,
  UnifiedAnalysisOutput,
} from "@/lib/energy-analysis-runner";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Energy Advisor Data — Research Pipeline" },
      {
        name: "description",
        content:
          "Upload energy, machine operation, and workload data to build a context-aware energy analysis.",
      },
    ],
  }),
  component: UploadPage,
});

type FileSlotType = "energy" | "operation" | "context";

interface SlotState {
  file: File | null;
  rawCsv: string | null;
  fileName: string | null;
  summary: InspectionSummary | null;
  isValidating: boolean;
}

export function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { applyAnalysisOutput } = useEnergyAdvisor();

  // Slots for 3 cards
  const [energySlot, setEnergySlot] = useState<SlotState>({
    file: null,
    rawCsv: null,
    fileName: null,
    summary: null,
    isValidating: false,
  });

  const [operationSlot, setOperationSlot] = useState<SlotState>({
    file: null,
    rawCsv: null,
    fileName: null,
    summary: null,
    isValidating: false,
  });

  const [contextSlot, setContextSlot] = useState<SlotState>({
    file: null,
    rawCsv: null,
    fileName: null,
    summary: null,
    isValidating: false,
  });

  // Preview Dialog State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewSummary, setPreviewSummary] = useState<InspectionSummary | null>(null);

  // Execution state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [latestAnalysis, setLatestAnalysis] = useState<UnifiedAnalysisOutput | null>(null);

  // Past runs
  const { data: pastRuns, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["pastRuns"],
    queryFn: getPastRunsList,
  });

  const activeRunId = typeof window !== "undefined" ? getRunId() : null;

  // Check readiness
  const isEnergyReady = Boolean(energySlot.file || energySlot.rawCsv);
  const isOperationReady = Boolean(operationSlot.file || operationSlot.rawCsv);
  const isContextReady = Boolean(contextSlot.file || contextSlot.rawCsv);
  const isReady = isEnergyReady && isOperationReady && isContextReady && !isAnalyzing;

  // Handler to inspect and load a file
  const handleFileUpload = async (type: FileSlotType, file: File) => {
    const setSlot =
      type === "energy" ? setEnergySlot : type === "operation" ? setOperationSlot : setContextSlot;

    setSlot((prev) => ({ ...prev, isValidating: true }));

    try {
      const summary = await inspectCsv(file, type);
      setSlot({
        file,
        rawCsv: null,
        fileName: file.name,
        summary,
        isValidating: false,
      });
      if (summary.status === "error") {
        toast.error(`Validation warning in ${file.name}: ${summary.statusMessage}`);
      } else {
        toast.success(`Loaded and validated ${file.name}`);
      }
    } catch (err) {
      toast.error(`Could not parse ${file.name}`);
      setSlot((prev) => ({ ...prev, isValidating: false }));
    }
  };

  // Handler to clear a slot
  const handleClearSlot = (type: FileSlotType) => {
    const setSlot =
      type === "energy" ? setEnergySlot : type === "operation" ? setOperationSlot : setContextSlot;

    setSlot({
      file: null,
      rawCsv: null,
      fileName: null,
      summary: null,
      isValidating: false,
    });
    toast.info(`Cleared ${type} data`);
  };

  // Handler to load preloaded benchmark dataset
  const handleLoadPreloaded = async (pkg: PreloadedDatasetPackage) => {
    toast.info(`Loading ${pkg.name}...`);

    setEnergySlot((prev) => ({ ...prev, isValidating: true }));
    setOperationSlot((prev) => ({ ...prev, isValidating: true }));
    setContextSlot((prev) => ({ ...prev, isValidating: true }));

    try {
      const [energySum, opSum, ctxSum] = await Promise.all([
        inspectCsv(pkg.energyCsv, "energy"),
        inspectCsv(pkg.operationCsv, "operation"),
        inspectCsv(pkg.contextCsv, "context"),
      ]);

      setEnergySlot({
        file: null,
        rawCsv: pkg.energyCsv,
        fileName: `${pkg.id}_energy.csv`,
        summary: energySum,
        isValidating: false,
      });

      setOperationSlot({
        file: null,
        rawCsv: pkg.operationCsv,
        fileName: `${pkg.id}_operation.csv`,
        summary: opSum,
        isValidating: false,
      });

      setContextSlot({
        file: null,
        rawCsv: pkg.contextCsv,
        fileName: `${pkg.id}_context.csv`,
        summary: ctxSum,
        isValidating: false,
      });

      toast.success(`Successfully loaded ${pkg.name} with validated inspection summaries!`);
    } catch (err) {
      toast.error("Failed to load preloaded dataset");
    }
  };

  // Open Preview Modal
  const openPreview = (title: string, summary: InspectionSummary | null) => {
    if (!summary) return;
    setPreviewTitle(title);
    setPreviewSummary(summary);
    setPreviewOpen(true);
  };

  // Run full analysis
  const onRunAnalysis = async () => {
    if (!isReady) return;
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStage("1/5: Parsing multi-source CSV files & validating schemas...");

    try {
      const energyData = energySlot.file || energySlot.rawCsv;
      const opData = operationSlot.file || operationSlot.rawCsv;
      const ctxData = contextSlot.file || contextSlot.rawCsv;

      if (!energyData || !opData || !ctxData) {
        throw new Error("Missing required dataset input");
      }

      await new Promise((r) => setTimeout(r, 400));
      setAnalysisProgress(30);
      setAnalysisStage("2/5: Aligning intervals & inferring operating states...");

      await new Promise((r) => setTimeout(r, 500));
      setAnalysisProgress(55);
      setAnalysisStage("3/5: Calculating expected energy P_exp & excess Wh...");

      // Execute unified engine
      const output = await runEnergyAdvisorAnalysis(energyData, opData, ctxData);

      setAnalysisProgress(75);
      setAnalysisStage("4/5: Generating Cause Ledger & Counterfactual evaluations...");

      // Update React context
      applyAnalysisOutput(output);
      setLatestAnalysis(output);

      // Backend sync if files are physical File objects
      try {
        let fEnergy = energySlot.file;
        let fOp = operationSlot.file;
        let fCtx = contextSlot.file;

        if (!fEnergy && energySlot.rawCsv) {
          fEnergy = new File([energySlot.rawCsv], energySlot.fileName || "energy.csv", {
            type: "text/csv",
          });
        }
        if (!fOp && operationSlot.rawCsv) {
          fOp = new File([operationSlot.rawCsv], operationSlot.fileName || "schedules.csv", {
            type: "text/csv",
          });
        }
        if (!fCtx && contextSlot.rawCsv) {
          fCtx = new File([contextSlot.rawCsv], contextSlot.fileName || "shifts.csv", {
            type: "text/csv",
          });
        }

        if (fEnergy && fOp && fCtx) {
          const { run_id } = await uploadFiles({
            energy: fEnergy,
            shifts: fCtx,
            schedules: fOp,
          });
          setRunId(run_id);
          await analyze(run_id);
          queryClient.invalidateQueries({ queryKey: ["pastRuns"] });
        } else {
          setRunId(output.runId);
        }
      } catch (beError) {
        console.warn("Backend sync fallback, local context retained:", beError);
        setRunId(output.runId);
      }

      setAnalysisProgress(100);
      setAnalysisStage("5/5: Analysis complete! Generated cause ledger & counterfactual savings.");

      toast.success(
        `Analysis complete! Identified ${output.excessEnergyWh} Wh excess across ${output.machinesAnalyzed} machines.`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis run encountered an error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onRetrieve = (runId: string) => {
    setRunId(runId, Date.now());
    toast.success("Analysis run retrieved successfully");
    navigate({ to: "/dashboard" });
  };

  const formatRunDate = (dateString: string | Date) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    const dateFormatted = d.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffHrs < 1) {
      return `${dateFormatted} (Just now)`;
    } else if (diffHrs < 24) {
      return `${dateFormatted} (${diffHrs} hours ago)`;
    } else {
      const days = Math.floor(diffHrs / 24);
      const remainingHrs = diffHrs % 24;
      return `${dateFormatted} (${days}d ${remainingHrs}h ago)`;
    }
  };

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const twoDaysMs = 48 * 60 * 60 * 1000;

  const activeRuns =
    pastRuns?.filter((r) => {
      const age = now - new Date(r.created_at).getTime();
      return age <= oneDayMs;
    }) || [];

  const recentArchiveRuns =
    pastRuns?.filter((r) => {
      const age = now - new Date(r.created_at).getTime();
      return age > oneDayMs && age <= twoDaysMs;
    }) || [];

  const olderRuns =
    pastRuns?.filter((r) => {
      const age = now - new Date(r.created_at).getTime();
      return age > twoDaysMs;
    }) || [];

  const renderRunRow = (run: any) => {
    const isActive = run.run_id === activeRunId;
    return (
      <div
        key={run.run_id}
        className={`glassoneu-card flex flex-col sm:flex-row sm:items-center justify-between p-5 transition-all ${
          isActive
            ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            : "hover:border-white/25"
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm font-mono truncate max-w-[200px] sm:max-w-xs text-slate-900 dark:text-white">
              Run: {run.run_id}
            </span>
            {isActive && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-medium">
                Active Run
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>{formatRunDate(run.created_at)}</span>
          </div>
          {run.summary && (
            <div className="mt-2 flex gap-4 text-xs text-slate-600 dark:text-slate-300 flex-wrap font-mono">
              <span className="glassoneu-sunken px-2.5 py-1">
                Total:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {run.summary.total_kwh?.toFixed(1) || 0} kWh
                </strong>
              </span>
              <span className="glassoneu-sunken px-2.5 py-1">
                Idle:{" "}
                <strong className="text-amber-600 dark:text-amber-400">
                  {run.summary.idle_kwh?.toFixed(1) || 0} kWh
                </strong>
              </span>
              <span className="glassoneu-sunken px-2.5 py-1">
                Machines:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {run.summary.machines_analyzed || 0}
                </strong>
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          {isActive ? (
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="glassoneu-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <FolderOpen className="h-3.5 w-3.5" /> View Dashboard
            </button>
          ) : (
            <button
              onClick={() => onRetrieve(run.run_id)}
              className="glassoneu-btn px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Retrieve Run
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-10 pb-40 bg-transparent text-foreground font-sans">
      {/* Page Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="glassoneu-badge px-3 py-1 text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Research Ingestion Pipeline • Contribution 1 & 2
          </span>
          <span className="glassoneu-badge px-3 py-1 text-xs border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
            Multi-Source Alignment
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Upload Energy Advisor Data
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base max-w-3xl leading-relaxed">
          Upload energy, machine operation, and workload data to build a context-aware energy
          analysis.
        </p>

        {/* Methodological Context Alert */}
        <div className="glassoneu-sunken p-4 flex items-start gap-3 border border-sky-500/30 bg-sky-950/20 text-xs text-sky-200 mt-2">
          <Info className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-sky-300">Context-Aware Requirement: </span>
            Context-aware energy diagnosis requires energy meter data alongside machine operation
            schedules or production telemetry. If contextual data is omitted, the system falls back
            to standard baseline regression.
          </div>
        </div>
      </header>

      {/* Preloaded Datasets Quick-Load Section */}
      <div className="glassoneu-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quick-Load Preloaded Research Datasets
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Evaluate Energy Advisor immediately using real-world benchmark datasets with
                pre-configured ground truth anomalies.
              </p>
            </div>
          </div>
          <span className="glassoneu-badge px-3 py-1 text-[11px] text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
            Instant 1-Click Evaluation & Demo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {PRELOADED_DATASETS.map((pkg) => (
            <div
              key={pkg.id}
              className="glassoneu-sunken p-4 flex flex-col justify-between space-y-3 transition-all hover:border-emerald-500/40"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="glassoneu-badge px-2 py-0.5 text-[10px] text-sky-700 dark:text-sky-300 border-sky-500/30">
                    {pkg.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {pkg.machineCount} devices
                  </span>
                </div>
                <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-white">
                  {pkg.name}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {pkg.description}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {pkg.timeRange.split("(")[0]}
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadPreloaded(pkg)}
                  disabled={isAnalyzing}
                  className="glassoneu-btn px-3 py-1 text-xs font-semibold hover:text-emerald-300 disabled:opacity-50"
                >
                  Load Dataset
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Energy Meter Data */}
        <UploadCard
          cardNumber={1}
          icon={<Zap className="h-5 w-5 text-amber-400" />}
          label="Energy Meter Data"
          description="High-resolution power & cumulative energy readings from smart meters or CT clamps."
          requiredCols={["timestamp", "machine_id", "power_kw or energy_kwh"]}
          optionalCols={["voltage_v", "current_a", "power_factor"]}
          slotState={energySlot}
          templateCsv={ENERGY_METER_TEMPLATE_CSV}
          templateFileName="energy_meter_template.csv"
          onFileSelect={(file) => handleFileUpload("energy", file)}
          onClear={() => handleClearSlot("energy")}
          onPreview={() => openPreview("Energy Meter Data Preview", energySlot.summary)}
          disabled={isAnalyzing}
        />

        {/* CARD 2: Machine Operation & Workload */}
        <UploadCard
          cardNumber={2}
          icon={<Cpu className="h-5 w-5 text-sky-400" />}
          label="Machine Operation & Workload"
          description="Machine operating states (active, idle, off, standby) and production workload levels."
          requiredCols={["machine_id", "start", "end", "operating_state", "workload"]}
          optionalCols={["production_id", "units_planned", "units_produced"]}
          slotState={operationSlot}
          templateCsv={MACHINE_OPERATION_TEMPLATE_CSV}
          templateFileName="machine_operation_template.csv"
          onFileSelect={(file) => handleFileUpload("operation", file)}
          onClear={() => handleClearSlot("operation")}
          onPreview={() =>
            openPreview("Machine Operation & Workload Preview", operationSlot.summary)
          }
          disabled={isAnalyzing}
        />

        {/* CARD 3: Production & Context */}
        <UploadCard
          cardNumber={3}
          icon={<Layers className="h-5 w-5 text-emerald-400" />}
          label="Production & Context"
          description="Shift logs, units produced, and physical sensor telemetry (vibration, temperature)."
          requiredCols={["timestamp", "machine_id", "workload"]}
          optionalCols={["shift", "production_id", "units_produced", "temperature_c", "vibration"]}
          slotState={contextSlot}
          templateCsv={PRODUCTION_CONTEXT_TEMPLATE_CSV}
          templateFileName="production_context_template.csv"
          onFileSelect={(file) => handleFileUpload("context", file)}
          onClear={() => handleClearSlot("context")}
          onPreview={() => openPreview("Production & Context Preview", contextSlot.summary)}
          disabled={isAnalyzing}
        />
      </div>

      {/* Analysis Execution Action Bar */}
      <div
        className={cn(
          "glassoneu-card p-6 transition-all overflow-hidden relative",
          isReady ? "border-emerald-500/40 shadow-[0_0_30px_rgba(51,214,166,0.15)]" : "opacity-90",
          isAnalyzing && "loading-shimmer-flow",
        )}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Multi-Source Energy Analysis Engine
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Aligns high-frequency meter streams with operation schedules to attribute cause-level
              excess (Wh) and calculate workload-conditioned counterfactual savings.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              type="button"
              onClick={onRunAnalysis}
              disabled={!isReady || isAnalyzing}
              className="glassoneu-btn-primary w-full lg:w-auto font-bold px-8 text-sm h-12 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  RUN ENERGY ANALYSIS
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar & Stage Indicator when running */}
        {isAnalyzing && (
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-emerald-400 font-medium">{analysisStage}</span>
              <span className="text-white">{analysisProgress}%</span>
            </div>
            <div className="glassoneu-sunken h-2.5 w-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300 shadow-[0_0_10px_rgba(51,214,166,0.5)]"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Analysis Output Summary Modal / Card (if run completed) */}
      {latestAnalysis && (
        <div className="glassoneu-card p-6 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Analysis Run Completed Successfully</h3>
              <span className="glassoneu-badge px-2 py-0.5 text-xs font-mono text-emerald-300">
                {latestAnalysis.runId}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {new Date(latestAnalysis.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Aligned multi-source data across {latestAnalysis.machinesAnalyzed} machines and
            generated cause-level ledger entries.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glassoneu-sunken p-3.5 space-y-1">
              <span className="text-xs text-slate-400 block font-mono">Total Energy</span>
              <span className="text-xl font-bold font-mono text-white">
                {latestAnalysis.totalEnergyKwh} kWh
              </span>
            </div>
            <div className="glassoneu-sunken p-3.5 space-y-1">
              <span className="text-xs text-slate-400 block font-mono">Expected Energy</span>
              <span className="text-xl font-bold font-mono text-sky-400">
                {latestAnalysis.expectedEnergyKwh} kWh
              </span>
            </div>
            <div className="glassoneu-sunken p-3.5 space-y-1">
              <span className="text-xs text-slate-400 block font-mono">Excess Waste</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {latestAnalysis.excessEnergyWh} Wh
              </span>
            </div>
            <div className="glassoneu-sunken p-3.5 space-y-1">
              <span className="text-xs text-slate-400 block font-mono">Causes Identified</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {latestAnalysis.detectedCausesCount} entries
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
            <button
              onClick={() => navigate({ to: "/counterfactual-analysis" })}
              className="glassoneu-btn-primary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Activity className="h-3.5 w-3.5" />
              View Counterfactual Analysis
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => navigate({ to: "/excess-ledger" })}
              className="glassoneu-btn px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Layers className="h-3.5 w-3.5" />
              View Cause-Level Ledger
            </button>
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="glassoneu-btn px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              View Research Dashboard
            </button>
            <button
              onClick={() => navigate({ to: "/reports" })}
              className="glassoneu-btn px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Generate Research Report
            </button>
          </div>
        </div>
      )}

      {/* Analysis History Section */}
      <div className="space-y-6 pt-6 border-t border-slate-200/60 dark:border-white/10">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analysis History
          </h2>
        </div>

        {isLoadingHistory ? (
          <div className="flex items-center gap-2 text-slate-400 p-4 justify-center font-mono text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> Loading past runs…
          </div>
        ) : !pastRuns || pastRuns.length === 0 ? (
          <div className="glassoneu-sunken p-8 text-center text-slate-400 font-mono text-xs">
            No previous analysis runs found.
          </div>
        ) : (
          <div className="space-y-6">
            {activeRuns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Runs (Created in last 24h)
                </h3>
                <div className="grid gap-3">{activeRuns.map(renderRunRow)}</div>
              </div>
            )}

            {recentArchiveRuns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Recent Archive (24h - 48h old - Retrieve to view)
                </h3>
                <div className="grid gap-3">{recentArchiveRuns.map(renderRunRow)}</div>
              </div>
            )}

            {olderRuns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Older History (Older than 48h)
                </h3>
                <div className="grid gap-3">{olderRuns.map(renderRunRow)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSV Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto glassoneu-card border-white/20 bg-slate-950/90 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <Eye className="h-5 w-5 text-emerald-400" />
              {previewTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              Showing first {previewSummary?.sampleRows?.length || 0} rows of inspected CSV dataset
              ({previewSummary?.fileName}).
            </DialogDescription>
          </DialogHeader>

          {previewSummary && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="glassoneu-badge px-2.5 py-0.5 text-xs text-white">
                  Rows: {previewSummary.rowCount}
                </span>
                <span className="glassoneu-badge px-2.5 py-0.5 text-xs text-white">
                  Columns: {previewSummary.colCount}
                </span>
                {previewSummary.samplingIntervalMinutes && (
                  <span className="glassoneu-badge px-2.5 py-0.5 text-xs text-emerald-300">
                    Interval: {previewSummary.samplingIntervalMinutes} min
                  </span>
                )}
                {previewSummary.timeRange && (
                  <span className="glassoneu-badge px-2.5 py-0.5 text-xs text-sky-300">
                    Range: {previewSummary.timeRange.start} → {previewSummary.timeRange.end}
                  </span>
                )}
              </div>

              <div className="glassoneu-sunken overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10">
                      {previewSummary.columns.map((c) => (
                        <TableHead
                          key={c}
                          className="text-xs font-semibold font-mono whitespace-nowrap text-emerald-400"
                        >
                          {c}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewSummary.sampleRows.map((row, idx) => (
                      <TableRow key={idx} className="border-b border-white/5 hover:bg-white/5">
                        {previewSummary.columns.map((c) => (
                          <TableCell
                            key={c}
                            className="text-xs font-mono whitespace-nowrap py-2 text-slate-200"
                          >
                            {String(row[c] ?? "—")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component: Individual Upload Card (Transformed to GlassoNeumorphism)
interface UploadCardProps {
  cardNumber: number;
  icon: React.ReactNode;
  label: string;
  description: string;
  requiredCols: string[];
  optionalCols?: string[];
  slotState: SlotState;
  templateCsv: string;
  templateFileName: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onPreview: () => void;
  disabled?: boolean;
}

function UploadCard({
  cardNumber,
  icon,
  label,
  description,
  requiredCols,
  optionalCols,
  slotState,
  templateCsv,
  templateFileName,
  onFileSelect,
  onClear,
  onPreview,
  disabled,
}: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoaded = Boolean(slotState.file || slotState.rawCsv);
  const summary = slotState.summary;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      onFileSelect(file);
    } else {
      toast.error("Please drop a valid .csv file");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={cn(
        "glassoneu-card p-6 flex flex-col justify-between space-y-4 transition-all duration-300",
        isLoaded
          ? "border-emerald-500/40 shadow-[0_0_24px_rgba(51,214,166,0.12)]"
          : "hover:border-white/20",
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs font-mono shadow-[0_0_10px_rgba(51,214,166,0.2)]">
              {cardNumber}
            </span>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15)]">
              {icon}
            </div>
          </div>
          {isLoaded && summary && (
            <span
              className={cn(
                "glassoneu-badge text-[10px] px-2.5 py-0.5 font-bold uppercase",
                summary.status === "valid"
                  ? "text-emerald-400 border-emerald-500/30"
                  : "text-amber-400 border-amber-500/30",
              )}
            >
              {summary.status === "valid" ? "✓ Validated" : "⚠ Warning"}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {label}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/10">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Required: </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400/90">
            {requiredCols.join(", ")}
          </span>
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {slotState.isValidating ? (
          <div className="glassoneu-sunken h-36 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500 dark:text-emerald-400" />
            <span>Validating dataset schema...</span>
          </div>
        ) : !isLoaded ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="glassoneu-sunken h-36 border-2 border-dashed border-slate-300/60 dark:border-white/15 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all flex flex-col items-center justify-center gap-2 p-4 cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              accept=".csv"
              className="hidden"
            />
            <div className="p-2.5 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:border-emerald-400/40 group-hover:bg-emerald-500/10 transition-all shadow-xs">
              <UploadIcon className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              Click or drop CSV here
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Standard industrial CSV format
            </span>
          </div>
        ) : (
          <div className="glassoneu-sunken p-3.5 space-y-2 border border-slate-200/60 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold font-mono truncate max-w-[170px] text-slate-800 dark:text-white">
                  {slotState.fileName}
                </span>
              </div>
              <span className="glassoneu-badge text-[10px] px-2 py-0.5 font-mono text-emerald-600 dark:text-emerald-300">
                {summary?.rowCount || 0} rows
              </span>
            </div>

            {/* Inspection details */}
            {summary && (
              <div className="space-y-1.5 text-[11px] text-slate-300 border-t border-white/10 pt-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Columns detected:</span>
                  <span className="font-medium text-white">{summary.colCount}</span>
                </div>
                {summary.detectedMachines && summary.detectedMachines.length > 0 && (
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-slate-400">Detected devices:</span>
                    <span className="text-[10px] truncate max-w-[130px] text-emerald-300">
                      {summary.detectedMachines.join(", ")}
                    </span>
                  </div>
                )}
                {summary.samplingIntervalMinutes && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interval cadence:</span>
                    <span className="text-white font-medium">
                      ~{summary.samplingIntervalMinutes} min
                    </span>
                  </div>
                )}
                {summary.timeRange && (
                  <div className="text-[10px] text-slate-400 truncate">
                    <span>
                      Time: {summary.timeRange.start.slice(5, 16)} →{" "}
                      {summary.timeRange.end.slice(5, 16)}
                    </span>
                  </div>
                )}
                {summary.warnings && summary.warnings.length > 0 && (
                  <div className="flex items-start gap-1 text-[10px] text-amber-400 mt-1">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{summary.warnings[0]}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => downloadCsvFile(templateFileName, templateCsv)}
          className="glassoneu-btn h-8 text-xs px-2.5 inline-flex items-center gap-1 text-slate-300 hover:text-white"
        >
          <Download className="h-3.5 w-3.5" />
          Template
        </button>

        <div className="flex items-center gap-1.5">
          {isLoaded && (
            <>
              <button
                type="button"
                onClick={onPreview}
                className="glassoneu-btn h-8 text-xs px-2.5 inline-flex items-center gap-1 text-white hover:text-emerald-300"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="glassoneu-btn h-8 text-xs px-2.5 inline-flex items-center gap-1 text-slate-300 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={onClear}
                className="glassoneu-btn h-8 text-xs px-2.5 text-red-400 hover:text-red-300 hover:border-red-500/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                accept=".csv"
                className="hidden"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
