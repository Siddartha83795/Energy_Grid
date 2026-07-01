import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { getActionQueue, updateActionStatus } from "@/lib/new-features.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/approval-queue")({
  head: () => ({ meta: [{ title: "Approval Queue — Energy Advisor" }] }),
  component: ApprovalQueuePage,
});

function ApprovalQueuePage() {
  const queryClient = useQueryClient();
  const getQueue = useServerFn(getActionQueue);
  const mutateStatus = useServerFn(updateActionStatus);

  const {
    data: actions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["actionQueue"],
    queryFn: () => getQueue(),
  });

  const updateMutation = useMutation({
    mutationFn: (args: { actionId: string; status: "approved" | "rejected" }) =>
      mutateStatus({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionQueue"] });
      toast.success("Action updated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update action");
    },
  });

  const handleAction = (actionId: string, status: "approved" | "rejected") => {
    updateMutation.mutate({ actionId, status });
  };

  const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> Approval Queue
        </h1>
        <p className="text-muted-foreground mt-1">
          Agentic Action Layer — Review and approve high-impact energy optimization actions.
        </p>
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
        <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
          No actions currently in the queue. Complete a dataset upload or run analysis to populate.
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className="space-y-4">
          {actions.map((act) => (
            <div
              key={act.id}
              className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{act.machine_id}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{act.issue}</p>
                </div>
                <Badge
                  variant={
                    act.status === "approved"
                      ? "default"
                      : act.status === "rejected"
                        ? "destructive"
                        : act.status === "pending"
                          ? "secondary"
                          : "outline"
                  }
                  className={
                    act.status === "approved"
                      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : act.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : ""
                  }
                >
                  {act.status.toUpperCase()}
                </Badge>
              </div>

              <div className="bg-muted/40 p-3 rounded-lg border border-dashed space-y-1">
                <div className="text-sm font-medium">Causal Explanation (Root Cause):</div>
                <div className="text-sm text-muted-foreground italic">"{act.root_cause}"</div>
              </div>

              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Recommended Action:</span>{" "}
                {act.action}
              </div>

              <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-2">
                <div className="text-sm font-semibold text-primary">
                  Est. Weekly Savings: {inr(act.estimated_weekly_savings_inr)}
                </div>

                {act.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(act.id, "approved")}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(act.id, "rejected")}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 border-destructive/30 flex items-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}

                {act.status === "approved" && (
                  <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Action approved and simulated control
                    signal sent
                  </div>
                )}
                {act.status === "rejected" && (
                  <div className="text-xs text-destructive font-medium flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Optimization action rejected by operator
                  </div>
                )}
                {act.status === "auto-suggested" && (
                  <div className="text-xs text-blue-600 font-medium">
                    Auto-executed: safe standby low-risk command dispatched
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
