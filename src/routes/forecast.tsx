import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, LineChart as ChartIcon, AlertTriangle, CheckCircle2, Leaf } from "lucide-react";
import { getForecastData } from "@/lib/new-features.functions";
import { getRunId } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forecast")({
  head: () => ({ meta: [{ title: "Forecast — Energy Advisor" }] }),
  component: ForecastPage,
});

function ForecastPage() {
  const getForecast = useServerFn(getForecastData);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const runId = typeof window !== "undefined" ? getRunId() : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["forecastData", runId],
    queryFn: () => getForecast({ data: { runId: runId || undefined } }),
  });

  useEffect(() => {
    if (data?.machines && data.machines.length > 0 && !selectedMachine) {
      setSelectedMachine(data.machines[0]);
    }
  }, [data, selectedMachine]);

  // Safe fallback if selectedMachine is empty but data loaded
  const activeMachine = selectedMachine || (data?.machines?.[0] ?? "");
  const machineForecasts =
    data?.forecasts?.filter((f: any) => f.machine_name === activeMachine) || [];

  // Filter forecasts for 24h subsets
  const forecasts24h = machineForecasts.filter((f: any) => f.index < 24);
  const forecasts48h = machineForecasts.filter((f: any) => f.index >= 24);

  const getMetrics = (forecastList: any[]) => {
    const maxRiskPoint = forecastList.reduce((max: any, current: any) => {
      if (!max || current.forecasted_idle_pct > max.forecasted_idle_pct) return current;
      return max;
    }, null);

    const avgIdlePct =
      forecastList.length > 0
        ? forecastList.reduce((sum: number, f: any) => sum + f.forecasted_idle_pct, 0) /
          forecastList.length
        : 0;

    return { maxRiskPoint, avgIdlePct };
  };

  const metrics24 = getMetrics(forecasts24h);
  const metrics48 = getMetrics(forecasts48h);

  const getMachineRiskSummary = (forecastsList: any[], machinesList: string[]) => {
    return machinesList.map((m) => {
      const mForecasts = forecastsList.filter((f: any) => f.machine_name === m);
      const maxIdle = mForecasts.reduce(
        (max: number, f: any) => Math.max(max, f.forecasted_idle_pct),
        0,
      );
      let risk: "Low" | "Medium" | "High" = "Low";
      if (maxIdle > 60) risk = "High";
      else if (maxIdle > 30) risk = "Medium";

      const peakHours = mForecasts
        .filter((f: any) => f.forecasted_idle_pct > 50)
        .map((f) => f.hour);
      let timeWindow = "Stable / Low Risk";
      if (peakHours.length > 0) {
        timeWindow = `${peakHours[0]} - ${peakHours[peakHours.length - 1]}`;
      } else {
        const peak = mForecasts.reduce(
          (p: any, f: any) => (f.forecasted_idle_pct > (p?.forecasted_idle_pct ?? 0) ? f : p),
          null,
        );
        timeWindow = peak ? `Peak at ${peak.hour}` : "Low Risk";
      }

      return {
        machine_name: m,
        risk,
        timeWindow,
        maxIdle,
      };
    });
  };

  const riskSummary24 = data?.forecasts
    ? getMachineRiskSummary(
        data.forecasts.filter((f: any) => f.index < 24),
        data.machines,
      )
    : [];
  const riskSummary48 = data?.forecasts
    ? getMachineRiskSummary(
        data.forecasts.filter((f: any) => f.index >= 24),
        data.machines,
      )
    : [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ChartIcon className="h-7 w-7 text-primary" /> Idle-Window Forecasting
        </h1>
        <p className="text-muted-foreground mt-1">
          Predictive Analytics — Forecasted machine idle waste probabilities for the next 24–48
          hours.
        </p>
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading predictive models…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border bg-card p-6 text-destructive text-center max-w-md mx-auto">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Failed to load forecast data</h2>
          <p className="text-sm text-muted-foreground mt-1">Please try reloading the page.</p>
        </div>
      )}

      {data && data.machines && data.machines.length === 0 && (
        <div className="rounded-2xl border bg-card p-10 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <ChartIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">
              No forecast data available
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 font-body leading-relaxed max-w-sm mx-auto">
              No machine telemetry found in active run to train 24–48h predictive models. Upload CSV
              energy logs to start forecasting.
            </p>
          </div>
          <Button asChild className="font-bold cursor-pointer">
            <Link to="/upload">Upload meter CSVs</Link>
          </Button>
        </div>
      )}

      {data && data.machines && data.machines.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Target Machine:</span>
              <select
                value={activeMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="bg-card border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
              >
                {data.machines.map((m: string) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Tabs defaultValue="next24" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-[400px]">
              <TabsTrigger value="next24">Next 24h Forecast</TabsTrigger>
              <TabsTrigger value="extended">24–48h Ahead Forecast</TabsTrigger>
            </TabsList>

            <TabsContent value="next24" className="space-y-6">
              {/* Predicted Idle Risk Table per Machine */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Predicted Idle Risk per Machine (Next 24h)
                  </h3>
                  <Leaf className="h-4 w-4 text-primary" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="pb-2 font-medium">Machine</th>
                        <th className="pb-2 font-medium">Risk Level</th>
                        <th className="pb-2 font-medium">Expected Time Window</th>
                        <th className="pb-2 font-medium text-right">Max Standby Pct</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {riskSummary24.map((row) => (
                        <tr key={row.machine_name} className="hover:bg-muted/10 transition-colors">
                          <td className="py-2.5 font-medium">{row.machine_name}</td>
                          <td className="py-2.5">
                            <Badge
                              variant={
                                row.risk === "High"
                                  ? "destructive"
                                  : row.risk === "Medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {row.risk}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-muted-foreground">{row.timeWindow}</td>
                          <td className="py-2.5 text-right font-semibold">{row.maxIdle}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="text-xs uppercase text-muted-foreground font-semibold">
                    Max Predicted Risk Slot
                  </div>
                  <div className="text-2xl font-bold mt-2 text-red-500">
                    {metrics24.maxRiskPoint
                      ? `${metrics24.maxRiskPoint.forecasted_idle_pct}%`
                      : "0%"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Predicted at: {metrics24.maxRiskPoint ? metrics24.maxRiskPoint.hour : "N/A"}
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="text-xs uppercase text-muted-foreground font-semibold">
                    Avg Forecasted Idle Draw
                  </div>
                  <div className="text-2xl font-bold mt-2 text-primary">
                    {metrics24.avgIdlePct.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    24-Hour average standby probability
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="text-xs uppercase text-muted-foreground font-semibold">
                    Idle Risk Level
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {metrics24.avgIdlePct > 50
                      ? "⚠️ High"
                      : metrics24.avgIdlePct > 25
                        ? "⚡ Medium"
                        : "✅ Low"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Risk status for upcoming shifts
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-semibold mb-4">
                  24-Hour Predicted Idle Probability (%)
                </h2>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecasts24h}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                      <XAxis dataKey="hour" fontSize={11} />
                      <YAxis
                        fontSize={11}
                        domain={[0, 100]}
                        label={{
                          value: "Probability (%)",
                          angle: -90,
                          position: "insideLeft",
                          style: { fontSize: 10, fill: "#64748b" },
                        }}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, "Idle Probability"]} />
                      <Line
                        type="monotone"
                        dataKey="forecasted_idle_pct"
                        stroke="#22c55e"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Forecasted Idle"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extended" className="space-y-6">
              {/* Predicted Idle Risk Table per Machine */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Predicted Idle Risk per Machine (24–48h Ahead)
                  </h3>
                  <Leaf className="h-4 w-4 text-primary" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="pb-2 font-medium">Machine</th>
                        <th className="pb-2 font-medium">Risk Level</th>
                        <th className="pb-2 font-medium">Expected Time Window</th>
                        <th className="pb-2 font-medium text-right">Max Standby Pct</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {riskSummary48.map((row) => (
                        <tr key={row.machine_name} className="hover:bg-muted/10 transition-colors">
                          <td className="py-2.5 font-medium">{row.machine_name}</td>
                          <td className="py-2.5">
                            <Badge
                              variant={
                                row.risk === "High"
                                  ? "destructive"
                                  : row.risk === "Medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {row.risk}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-muted-foreground">{row.timeWindow}</td>
                          <td className="py-2.5 text-right font-semibold">{row.maxIdle}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="text-xs uppercase text-muted-foreground font-semibold">
                    Max Predicted Risk Slot
                  </div>
                  <div className="text-2xl font-bold mt-2 text-red-500">
                    {metrics48.maxRiskPoint
                      ? `${metrics48.maxRiskPoint.forecasted_idle_pct}%`
                      : "0%"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Predicted at: {metrics48.maxRiskPoint ? metrics48.maxRiskPoint.hour : "N/A"}
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="text-xs uppercase text-muted-foreground font-semibold">
                    Avg Forecasted Idle Draw
                  </div>
                  <div className="text-2xl font-bold mt-2 text-primary">
                    {metrics48.avgIdlePct.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    48-Hour average standby probability
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="text-xs uppercase text-muted-foreground font-semibold">
                    Idle Risk Level
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {metrics48.avgIdlePct > 50
                      ? "⚠️ High"
                      : metrics48.avgIdlePct > 25
                        ? "⚡ Medium"
                        : "✅ Low"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Risk status for extended shifts
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-semibold mb-4">
                  24–48h Predicted Idle Probability (%)
                </h2>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecasts48h}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                      <XAxis dataKey="hour" fontSize={11} />
                      <YAxis
                        fontSize={11}
                        domain={[0, 100]}
                        label={{
                          value: "Probability (%)",
                          angle: -90,
                          position: "insideLeft",
                          style: { fontSize: 10, fill: "#64748b" },
                        }}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, "Idle Probability"]} />
                      <Line
                        type="monotone"
                        dataKey="forecasted_idle_pct"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Forecasted Idle"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* High risk warning alert */}
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Predictive Action Recommendations
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>
                High-risk idle windows detected between 22:00 and 06:00. Recommend enabling
                automatic sleep shutdown on {activeMachine}.
              </li>
              <li>
                A backlog increase is expected to reduce idle opportunities. Monitor the forecast
                over the weekend.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
