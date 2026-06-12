import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, AlertTriangle, Printer, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRunId, getDashboard } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [{ title: "Report — Energy Advisor" }],
  }),
  component: ReportPage,
});

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

function ReportPage() {
  const run_id = typeof window !== "undefined" ? getRunId() : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", run_id],
    queryFn: () => getDashboard(run_id!),
    enabled: !!run_id,
  });

  if (!run_id) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border bg-card p-10 text-center max-w-md mx-auto">
          <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No report available</h2>
          <p className="text-sm text-muted-foreground mt-1">Run an analysis first.</p>
          <Button asChild className="mt-4">
            <Link to="/">Go to upload</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading report data…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-destructive text-center max-w-md mx-auto border rounded-2xl bg-card">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Failed to load report</h2>
        <p className="text-sm text-muted-foreground mt-1">Please try running the analysis again.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-full">
      <header className="flex items-center justify-between border-b pb-4 print:border-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary print:hidden" />
            <h1 className="text-2xl font-bold tracking-tight">GenAI Energy Advisory Report</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Run ID:{" "}
            <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">{run_id}</code>
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          <Button onClick={() => window.print()} className="gap-1.5">
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </Button>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        <div className="rounded-xl border p-4 bg-muted/50 print:bg-transparent">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Energy</div>
          <div className="text-xl font-bold mt-1">{fmt(data.summary.total_kwh)} kWh</div>
        </div>
        <div className="rounded-xl border p-4 bg-muted/50 print:bg-transparent">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Idle Energy</div>
          <div className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-500">
            {fmt(data.summary.idle_kwh)} kWh
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-muted/50 print:bg-transparent">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">
            Estimated Idle Cost
          </div>
          <div className="text-xl font-bold mt-1 text-destructive">
            {inr(data.summary.idle_cost_inr)}
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-muted/50 print:bg-transparent">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">
            Machines Analyzed
          </div>
          <div className="text-xl font-bold mt-1">{data.summary.machines_analyzed}</div>
        </div>
      </section>

      {/* Machine Breakdown */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-1">Machine Utilization Breakdown</h2>
        <div className="border rounded-xl overflow-hidden print:border-none">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="py-2 text-xs">Machine Name</TableHead>
                <TableHead className="py-2 text-xs text-right">Total kWh</TableHead>
                <TableHead className="py-2 text-xs text-right">Idle kWh</TableHead>
                <TableHead className="py-2 text-xs text-right">Utilization %</TableHead>
                <TableHead className="py-2 text-xs text-right">Idle Waste (INR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.machines.map((m) => (
                <TableRow key={m.machine_name} className="print:border-b">
                  <TableCell className="py-2 text-sm font-medium">{m.machine_name}</TableCell>
                  <TableCell className="py-2 text-sm text-right">{fmt(m.total_kwh)}</TableCell>
                  <TableCell className="py-2 text-sm text-right text-amber-600 dark:text-amber-500">
                    {fmt(m.idle_kwh)}
                  </TableCell>
                  <TableCell className="py-2 text-sm text-right">
                    {m.utilization_pct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="py-2 text-sm text-right font-semibold text-destructive">
                    {inr(m.idle_cost_inr)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="space-y-4 break-inside-avoid">
        <div className="border-b pb-1">
          <h2 className="text-sm font-semibold">AI Advisory & Recommendations</h2>
        </div>
        <div className="rounded-xl border p-4 bg-muted/10 print:border-none print:p-0">
          <p className="text-sm leading-relaxed text-muted-foreground print:text-foreground">
            {data.genai.summary_narrative}
          </p>
        </div>

        <div className="space-y-3">
          {data.genai.recommendations.map((r) => (
            <div
              key={r.rank}
              className="rounded-xl border p-4 space-y-2 bg-card print:border-b print:rounded-none print:p-2 break-inside-avoid"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">
                  #{r.rank} · {r.machine_name}
                </div>
                <div className="flex gap-2 print:hidden">
                  <Badge
                    variant={
                      r.priority === "high"
                        ? "destructive"
                        : r.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                    className="text-[10px] py-0 px-1.5 font-medium"
                  >
                    {r.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                    {r.implementation_effort.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-muted-foreground">Issue: </span>
                {r.issue}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-muted-foreground">Corrective Action: </span>
                {r.action}
              </div>
              <div className="text-xs text-primary font-medium">
                Estimated savings: {fmt(r.estimated_monthly_savings_kwh)} kWh/month (≈{" "}
                {inr(r.estimated_monthly_savings_inr)}/month)
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Wins */}
      {data.genai.quick_wins && data.genai.quick_wins.length > 0 && (
        <section className="rounded-xl border p-4 bg-primary/5 border-primary/20 print:border-none print:p-0 break-inside-avoid">
          <h2 className="text-sm font-semibold text-primary print:text-foreground mb-2">
            Operational Quick Wins
          </h2>
          <ul className="text-xs space-y-1.5 list-disc list-inside text-muted-foreground print:text-foreground">
            {data.genai.quick_wins.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Report Footer */}
      <footer className="text-center text-[10px] text-muted-foreground border-t pt-4 mt-8 print:block hidden">
        Report generated by Energy Advisor. Powered by MongoDB Atlas & Groq GenAI.
      </footer>
    </div>
  );
}
