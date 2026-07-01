import { createFileRoute } from "@tanstack/react-router";
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
import { Loader2, LineChart as ChartIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getForecastData } from "@/lib/new-features.functions";

export const Route = createFileRoute("/forecast")({
  head: () => ({ meta: [{ title: "Forecast — Energy Advisor" }] }),
  component: ForecastPage,
});

function ForecastPage() {
  const getForecast = useServerFn(getForecastData);
  const [selectedMachine, setSelectedMachine] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["forecastData"],
    queryFn: () => getForecast(),
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

  const maxRiskPoint = machineForecasts.reduce((max: any, current: any) => {
    if (!max || current.forecasted_idle_pct > max.forecasted_idle_pct) return current;
    return max;
  }, null);

  const avgIdlePct =
    machineForecasts.length > 0
      ? machineForecasts.reduce((sum: number, f: any) => sum + f.forecasted_idle_pct, 0) /
        machineForecasts.length
      : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ChartIcon className="h-7 w-7 text-primary" /> Idle-Window Forecasting
        </h1>
        <p className="text-muted-foreground mt-1">
          Predictive Analytics — Forecasted machine idle waste probabilities for the next 24 hours.
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
        <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
          No historical machine data available to train predictive models. Upload csv logs first.
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

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                Max Predicted Risk Slot
              </div>
              <div className="text-2xl font-bold mt-2 text-red-500">
                {maxRiskPoint ? `${maxRiskPoint.forecasted_idle_pct}%` : "0%"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Predicted at: {maxRiskPoint ? maxRiskPoint.hour : "N/A"}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                Avg Forecasted Idle Draw
              </div>
              <div className="text-2xl font-bold mt-2 text-primary">{avgIdlePct.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                24-Hour average standby probability
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                Idle Risk Level
              </div>
              <div className="text-2xl font-bold mt-2">
                {avgIdlePct > 50 ? "⚠️ High" : avgIdlePct > 25 ? "⚡ Medium" : "✅ Low"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Risk status for upcoming shifts
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold mb-4">24-Hour Predicted Idle Probability (%)</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={machineForecasts}>
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
