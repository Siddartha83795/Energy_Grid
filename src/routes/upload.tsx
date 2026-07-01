import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, History, Calendar, FolderOpen, Play } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/button";
import { uploadFiles, analyze, setRunId, getRunId, getPastRunsList } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload — Energy Advisor" },
      { name: "description", content: "Upload meter, shift, and schedule CSVs to analyze." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [energy, setEnergy] = useState<File | null>(null);
  const [shifts, setShifts] = useState<File | null>(null);
  const [schedules, setSchedules] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<string>("");

  const ready = energy && shifts && schedules && !busy;

  const { data: pastRuns, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["pastRuns"],
    queryFn: getPastRunsList,
  });

  const activeRunId = typeof window !== "undefined" ? getRunId() : null;

  const onAnalyze = async () => {
    if (!energy || !shifts || !schedules) return;
    setBusy(true);
    try {
      setStage("Uploading files…");
      const { run_id } = await uploadFiles({ energy, shifts, schedules });
      setRunId(run_id);
      setStage("Running analytics & GenAI…");
      await analyze(run_id);
      toast.success("Analysis complete");
      queryClient.invalidateQueries({ queryKey: ["pastRuns"] });
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
      setStage("");
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
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card transition-all ${
          isActive
            ? "border-green-500 bg-green-500/5 shadow-sm"
            : "hover:border-primary/40 hover:bg-accent/10"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm font-mono truncate max-w-[200px] sm:max-w-xs">
              Run: {run.run_id}
            </span>
            {isActive && (
              <span className="text-[10px] bg-green-500/10 text-green-700 border border-green-500/30 px-2.5 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatRunDate(run.created_at)}</span>
          </div>
          {run.summary && (
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground flex-wrap">
              <span>
                Total:{" "}
                <strong className="text-foreground">
                  {run.summary.total_kwh?.toFixed(1) || 0} kWh
                </strong>
              </span>
              <span>
                Idle:{" "}
                <strong className="text-amber-600 dark:text-amber-400">
                  {run.summary.idle_kwh?.toFixed(1) || 0} kWh
                </strong>
              </span>
              <span>
                Machines:{" "}
                <strong className="text-foreground">{run.summary.machines_analyzed || 0}</strong>
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 sm:mt-0 flex gap-2">
          {isActive ? (
            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FolderOpen className="h-3.5 w-3.5 mr-1" /> View Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => onRetrieve(run.run_id)}
              size="sm"
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground"
            >
              <Play className="h-3.5 w-3.5 mr-1 fill-current" /> Retrieve Run
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload your data</h1>
          <p className="text-muted-foreground mt-1">
            Drop the three CSV files to start a new energy analysis run.
          </p>
        </header>

        <div className="grid gap-5 rounded-2xl border bg-card p-6 shadow-sm">
          <Dropzone
            label="1. Energy meter data"
            description="Drag & drop or click to upload meter readings CSV"
            requiredColumns={["timestamp", "machine_id", "kwh"]}
            onChange={setEnergy}
          />
          <Dropzone
            label="2. Shift records"
            description="Upload shift schedule CSV"
            requiredColumns={["shift", "start", "end"]}
            onChange={setShifts}
          />
          <Dropzone
            label="3. Machine schedules"
            description="Upload machine production schedule CSV"
            requiredColumns={["machine_id", "start", "end"]}
            onChange={setSchedules}
          />

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {busy
                ? stage
                : ready
                  ? "All files validated. Ready to analyze."
                  : "Waiting for files…"}
            </span>
            <Button onClick={onAnalyze} disabled={!ready} size="lg">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Run analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Run Retrieval / Analysis History Section */}
      <div className="space-y-6 pt-6 border-t">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Analysis History</h2>
        </div>

        {isLoadingHistory ? (
          <div className="flex items-center gap-2 text-muted-foreground p-4 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading past runs…
          </div>
        ) : !pastRuns || pastRuns.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            No previous analysis runs found.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active (Last 24 Hours) */}
            {activeRuns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Active Runs (Created in last 24h)
                </h3>
                <div className="grid gap-3">{activeRuns.map(renderRunRow)}</div>
              </div>
            )}

            {/* Recent Archive (24h - 48h) */}
            {recentArchiveRuns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Recent Archive (24h - 48h old - Retrieve to view)
                </h3>
                <div className="grid gap-3">{recentArchiveRuns.map(renderRunRow)}</div>
              </div>
            )}

            {/* Older History (> 48h) */}
            {olderRuns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  Older History (Older than 48h)
                </h3>
                <div className="grid gap-3">{olderRuns.map(renderRunRow)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
