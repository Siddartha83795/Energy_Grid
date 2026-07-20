import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Play } from "lucide-react";
import { getActionQueue, updateActionStatus } from "@/lib/new-features.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AgentPersonaBadge } from "@/components/AgentPersonaBadge";

export const Route = createFileRoute("/approval-queue")({
  head: () => ({ meta: [{ title: "Approvals — Energy Advisor" }] }),
  component: ApprovalQueuePage,
});

function ApprovalQueuePage() {
  const queryClient = useQueryClient();
  const getQueue = useServerFn(getActionQueue);
  const mutateStatus = useServerFn(updateActionStatus);
  const [transitioningIds, setTransitioningIds] = useState<Record<string, "Approved" | "Rejected">>(
    {},
  );
  const [errorIds, setErrorIds] = useState<Record<string, string>>({});
  const [simulateError, setSimulateError] = useState(false);

  const {
    data: actions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["actionQueue"],
    queryFn: () => getQueue(),
  });

  const updateMutation = useMutation({
    mutationFn: async (args: { actionId: string; status: "Approved" | "Rejected" }) => {
      if (simulateError) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        throw new Error("Couldn't save — try again");
      }
      return mutateStatus({ data: args });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["actionQueue"] });
      toast.success("Action updated successfully");
      setErrorIds((prev) => {
        const copy = { ...prev };
        delete copy[variables.actionId];
        return copy;
      });
      setTimeout(() => {
        setTransitioningIds((prev) => {
          const copy = { ...prev };
          delete copy[variables.actionId];
          return copy;
        });
      }, 1000);
    },
    onError: (err, variables) => {
      toast.error(err instanceof Error ? err.message : "Failed to update action");
      setTransitioningIds((prev) => {
        const copy = { ...prev };
        delete copy[variables.actionId];
        return copy;
      });
      setErrorIds((prev) => ({
        ...prev,
        [variables.actionId]: err instanceof Error ? err.message : "Failed to update action",
      }));
    },
  });

  const handleAction = (actionId: string, status: "Approved" | "Rejected") => {
    setErrorIds((prev) => {
      const copy = { ...prev };
      delete copy[actionId];
      return copy;
    });
    setTransitioningIds((prev) => ({ ...prev, [actionId]: status }));
    // 800ms delay to allow the local flow/ripple sweep animation to complete
    setTimeout(() => {
      updateMutation.mutate({ actionId, status });
    }, 800);
  };

  const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" /> Approval Queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Agentic Action Layer — Review and approve high-impact energy optimization actions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-lg text-xs font-semibold text-red-700 dark:text-red-400 shrink-0">
          <input
            type="checkbox"
            id="simulate-error-toggle"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
            className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
          />
          <label htmlFor="simulate-error-toggle" className="cursor-pointer select-none">
            Simulate DB Failure
          </label>
        </div>
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading action queue…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border bg-card p-6 text-destructive text-center max-w-md mx-auto">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Failed to load queue</h2>
          <p className="text-sm text-muted-foreground mt-1">Please try reloading the page.</p>
        </div>
      )}

      {actions && actions.length === 0 && (
        <div className="rounded-2xl border bg-card p-10 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">
              Approval queue is empty
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 font-body leading-relaxed max-w-sm mx-auto">
              No high-impact actions currently pending human authorization. Upload meter telemetry
              or run AI analysis to detect standby waste events.
            </p>
          </div>
          <Button asChild className="font-bold cursor-pointer">
            <Link to="/upload">Upload energy dataset</Link>
          </Button>
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className="space-y-4">
          {actions.map((act) => {
            const isTransitioning = act.id in transitioningIds;
            const transitioningStatus = transitioningIds[act.id];
            const hasError = act.id in errorIds;
            const statusClass = isTransitioning
              ? transitioningStatus === "Approved"
                ? "status-approved-sweep"
                : "status-rejected-sweep"
              : hasError
                ? "border-destructive/40 bg-destructive/5 dark:bg-destructive/10"
                : "";

            return (
              <div
                key={act.id}
                className={cn(
                  "rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:border-primary/20 transition-all relative overflow-hidden",
                  statusClass,
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{act.machine_id}</h3>
                      <AgentPersonaBadge persona="Watch" size="sm" showRole={false} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{act.issue}</p>
                  </div>
                  <Badge
                    variant={
                      act.status === "Approved" || act.status === "Executed"
                        ? "default"
                        : act.status === "Rejected"
                          ? "destructive"
                          : act.status === "Pending"
                            ? "secondary"
                            : "outline"
                    }
                    className={cn(
                      act.status === "Approved" &&
                        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
                      act.status === "Executed" &&
                        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
                      act.status === "Pending" &&
                        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
                    )}
                  >
                    {isTransitioning ? transitioningStatus.toUpperCase() : act.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="bg-muted/40 p-3.5 rounded-xl border border-dashed space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                    <AgentPersonaBadge persona="Diagnose" size="sm" />
                    <span>Causal Explanation</span>
                  </div>
                  <div className="text-sm text-muted-foreground italic pl-1">
                    "{act.root_cause}"
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t">
                  <div>
                    <span className="text-muted-foreground block text-xs">Risk Level</span>
                    <span
                      className={cn(
                        "font-semibold",
                        act.risk_level === "High" ? "text-red-500" : "text-blue-500",
                      )}
                    >
                      {act.risk_level}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Est. Weekly Savings</span>
                    <span className="font-semibold text-primary">
                      {inr(act.estimated_weekly_savings_inr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Est. Weekly kWh</span>
                    <span className="font-semibold text-primary">
                      {((act.estimated_weekly_savings_inr ?? 0) / 8).toFixed(1)} kWh
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground block text-xs">Action Plan</span>
                      <AgentPersonaBadge persona="Act" size="sm" showRole={false} />
                    </div>
                    <span
                      className="font-medium text-foreground block truncate max-w-[200px]"
                      title={act.action}
                    >
                      {act.action}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t gap-3">
                  <div>
                    {hasError && (
                      <span className="text-xs text-destructive font-semibold flex items-center gap-1.5 animate-pulse bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 px-2.5 py-1 rounded-md">
                        ⚠️ {errorIds[act.id]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end flex-wrap gap-2">
                    {!isTransitioning && act.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAction(act.id, "Approved")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(act.id, "Rejected")}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30 flex items-center gap-1.5"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}

                    {isTransitioning && (
                      <div
                        className={cn(
                          "text-xs font-medium flex items-center gap-1.5",
                          transitioningStatus === "Approved"
                            ? "text-green-600"
                            : "text-destructive",
                        )}
                      >
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispatching control
                        directive and saving audit log...
                      </div>
                    )}

                    {!isTransitioning && act.status === "Approved" && (
                      <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Action approved and simulated
                        control signal sent
                      </div>
                    )}
                    {!isTransitioning && act.status === "Rejected" && (
                      <div className="text-xs text-destructive font-medium flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Optimization action rejected by operator
                      </div>
                    )}
                    {!isTransitioning && act.status === "Executed" && (
                      <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                        <Play className="h-3.5 w-3.5" /> Auto-executed: safe standby low-risk
                        command dispatched
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
