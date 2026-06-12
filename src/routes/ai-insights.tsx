import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { analyzeEnergy, type AiInsights } from "@/lib/ai.functions";
import { getRunId } from "@/lib/api";

export const Route = createFileRoute("/ai-insights")({
  head: () => ({ meta: [{ title: "AI insights — Energy Advisor" }] }),
  component: AiInsightsPage,
});

function AiInsightsPage() {
  const { user } = useAuth();
  const run = useServerFn(analyzeEnergy);
  const [busy, setBusy] = useState(false);
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [loaded, setLoaded] = useState(false);

  const runId = typeof window !== "undefined" ? getRunId() : null;

  useEffect(() => {
    if (user && runId && !loaded) {
      setLoaded(true);
      setBusy(true);
      run({ data: { runId } })
        .then((result) => {
          setInsights(result);
        })
        .catch((e) => {
          console.error("Failed to auto-fetch AI insights:", e);
        })
        .finally(() => {
          setBusy(false);
        });
    }
  }, [user, runId, loaded, run]);

  const analyze = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const result = await run({ data: { runId: getRunId() ?? undefined } });
      setInsights(result);
      toast.success("Analysis ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI analysis failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> AI insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Predictive analysis & prioritized actions, powered by Groq Llama 3.3.
          </p>
        </div>
        <Button onClick={analyze} disabled={busy} size="lg">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Run AI analysis
            </>
          )}
        </Button>
      </header>

      {!insights && !busy && (
        <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
          Click "Run AI analysis" to get a narrative summary, predictions, and a ranked action list
          based on your data.
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-card p-5">
              <div className="text-xs uppercase text-muted-foreground">
                Potential monthly savings
              </div>
              <div className="text-3xl font-bold mt-1">
                {insights.total_potential_savings_kwh.toFixed(0)}{" "}
                <span className="text-base font-normal text-muted-foreground">kWh</span>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <div className="text-xs uppercase text-muted-foreground">Predicted next month</div>
              <div className="text-3xl font-bold mt-1">
                {insights.predicted_next_month_kwh.toFixed(0)}{" "}
                <span className="text-base font-normal text-muted-foreground">kWh</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold mb-2">Summary</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights.summary_narrative}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold">Recommendations</h2>
            {insights.recommendations.map((r) => (
              <div key={r.rank} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    #{r.rank} · {r.machine_name}
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        r.priority === "high"
                          ? "destructive"
                          : r.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {r.priority}
                    </Badge>
                    <Badge variant="outline">{r.implementation_effort}</Badge>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Issue: </span>
                  {r.issue}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Action: </span>
                  {r.action}
                </div>
                <div className="text-xs text-muted-foreground">
                  Est. savings: {r.estimated_monthly_savings_kwh.toFixed(0)} kWh / ₹
                  {r.estimated_monthly_savings_inr.toFixed(0)} per month
                </div>
              </div>
            ))}
          </div>

          {insights.quick_wins.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold mb-2">Quick wins</h2>
              <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                {insights.quick_wins.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
