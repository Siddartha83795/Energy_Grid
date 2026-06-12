import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/button";
import { uploadFiles, analyze, setRunId } from "@/lib/api";

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
  const [energy, setEnergy] = useState<File | null>(null);
  const [shifts, setShifts] = useState<File | null>(null);
  const [schedules, setSchedules] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<string>("");

  const ready = energy && shifts && schedules && !busy;

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
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
            {busy ? stage : ready ? "All files validated. Ready to analyze." : "Waiting for files…"}
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
  );
}