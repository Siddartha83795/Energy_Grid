import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Zap, Pause, IndianRupee, Factory, AlertTriangle, Lightbulb, Loader2, Trash2 } from "lucide-react";
import { getDashboard, getRunId, clearRunId, type Recommendation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Energy Advisor" }],
  }),
  component: DashboardPage,
});

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Zap;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div
          className={`grid place-items-center h-9 w-9 rounded-lg ${accent ?? "bg-primary/10 text-primary"}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function priorityBadge(p: Recommendation["priority"]) {
  const map = {
    high: "bg-destructive/15 text-destructive border-destructive/30",
    medium: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400",
    low: "bg-primary/10 text-primary border-primary/30",
  } as const;
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${map[p]}`}>
      {p.toUpperCase()}
    </span>
  );
}

function statusBadge(util: number) {
  if (util >= 75) return <Badge className="bg-primary text-primary-foreground">Healthy</Badge>;
  if (util >= 50) return <Badge variant="secondary">Warning</Badge>;
  return <Badge variant="destructive">Critical</Badge>;
}

function DashboardPage() {
  const navigate = useNavigate();
  const run_id = typeof window !== "undefined" ? getRunId() : null;
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", run_id],
    queryFn: () => getDashboard(run_id!),
    enabled: !!run_id,
  });

  const handleClearRun = () => {
    clearRunId();
    toast.success("Active run cleared. Redirecting to upload.");
    navigate({ to: "/upload" });
  };

  if (!run_id) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border bg-card p-10 text-center max-w-md mx-auto">
          <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No active run selected</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose an archived run or upload new data to start.
          </p>
          <Button asChild className="mt-4">
            <Link to="/upload">Go to upload</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading dashboard…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="p-8 text-destructive text-center max-w-md mx-auto border rounded-2xl bg-card mt-10">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Please try running the analysis again.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Energy dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Run ID: {run_id}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClearRun} variant="destructive" size="sm" className="h-9">
            <Trash2 className="h-4 w-4 mr-1.5" /> Clear Active Run
          </Button>
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link to="/report">View report</Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total kWh" value={fmt(data.summary.total_kwh)} icon={Zap} />
        <StatCard
          label="Idle kWh"
          value={fmt(data.summary.idle_kwh)}
          icon={Pause}
          accent="bg-amber-500/15 text-amber-600"
        />
        <StatCard
          label="Idle cost"
          value={inr(data.summary.idle_cost_inr)}
          icon={IndianRupee}
          accent="bg-destructive/15 text-destructive"
        />
        <StatCard
          label="Machines analyzed"
          value={String(data.summary.machines_analyzed)}
          icon={Factory}
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">kWh per machine</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.machines}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="machine_name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="active_kwh"
                stackId="a"
                fill="#16a34a"
                name="Active"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="idle_kwh"
                stackId="a"
                fill="#f59e0b"
                name="Idle"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Hourly consumption trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.hourly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="hour" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="kwh" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-sm font-semibold">Machine breakdown</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Machine</TableHead>
              <TableHead className="text-right">Total kWh</TableHead>
              <TableHead className="text-right">Idle kWh</TableHead>
              <TableHead className="text-right">Utilization</TableHead>
              <TableHead className="text-right">Idle cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Multi-Signal Check</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.machines.map((m: any) => (
              <TableRow key={m.machine_name}>
                <TableCell className="font-medium">{m.machine_name}</TableCell>
                <TableCell className="text-right">{fmt(m.total_kwh)}</TableCell>
                <TableCell className="text-right">{fmt(m.idle_kwh)}</TableCell>
                <TableCell className="text-right">{m.utilization_pct.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{inr(m.idle_cost_inr)}</TableCell>
                <TableCell>{statusBadge(m.utilization_pct)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      m.multi_signal_status?.includes("stuck-on")
                        ? "destructive"
                        : m.multi_signal_status?.includes("idle waste")
                          ? "secondary"
                          : "default"
                    }
                    className={
                      m.multi_signal_status?.includes("stuck-on")
                        ? "bg-red-500/10 text-red-700 border-red-500/20"
                        : m.multi_signal_status?.includes("idle waste")
                          ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                          : "bg-green-500/10 text-green-700 border-green-500/20"
                    }
                  >
                    {m.multi_signal_status || "Active operation"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI recommendations</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{data.genai.summary_narrative}</p>

        <ol className="space-y-3">
          {data.genai.recommendations.map((r) => (
            <li
              key={r.rank}
              className="rounded-xl border p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
                  {r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{r.machine_name}</h3>
                    {priorityBadge(r.priority)}
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                      {r.implementation_effort}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">Issue:</span> {r.issue}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">Action:</span> {r.action}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span>
                      <span className="text-muted-foreground">Savings: </span>
                      <span className="font-semibold text-primary">
                        {fmt(r.estimated_monthly_savings_kwh)} kWh/mo
                      </span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">≈ </span>
                      <span className="font-semibold text-primary">
                        {inr(r.estimated_monthly_savings_inr)}/mo
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {data.genai.quick_wins?.length > 0 && (
          <div className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-4">
            <h3 className="text-sm font-semibold text-primary mb-2">Quick wins</h3>
            <ul className="text-sm space-y-1 list-disc list-inside text-foreground/80">
              {data.genai.quick_wins.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
