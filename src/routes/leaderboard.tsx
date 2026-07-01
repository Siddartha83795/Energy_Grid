import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trophy, ShieldAlert, Award, Star } from "lucide-react";
import { getLeaderboardStats } from "@/lib/new-features.functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Energy Advisor" }] }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const getStats = useServerFn(getLeaderboardStats);

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["leaderboardStats"],
    queryFn: () => getStats(),
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-7 w-7 text-yellow-500" /> Efficiency Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Gamification — Shift-vs-shift and machine-vs-machine rankings based on utilization
          efficiency.
        </p>
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching rankings…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border bg-card p-6 text-destructive text-center max-w-md mx-auto">
          <ShieldAlert className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Failed to load standings</h2>
          <p className="text-sm text-muted-foreground mt-1">Please try reloading the page.</p>
        </div>
      )}

      {stats && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shift Standings */}
          <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-muted/20 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <h2 className="font-semibold text-lg">Shift Standings</h2>
            </div>

            <div className="p-4 space-y-3">
              {stats.shiftRankings.map((shift, idx) => {
                const isWinner = idx === 0;
                return (
                  <div
                    key={shift.shift_name}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isWinner
                        ? "bg-green-500/10 border-green-500/30 text-green-800 dark:text-green-400"
                        : "bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid place-items-center h-8 w-8 rounded-lg font-bold text-sm ${
                          isWinner ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{shift.shift_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Consumption: {shift.total_kwh.toFixed(0)} kWh
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{shift.utilization_pct.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Efficiency</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Machine Standings */}
          <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-muted/20 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Machine Efficiency</h2>
            </div>

            <div className="p-4 space-y-3">
              {stats.machineRankings.slice(0, 5).map((mach, idx) => {
                const isWinner = idx === 0;
                return (
                  <div
                    key={mach.machine_name}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isWinner
                        ? "bg-green-500/10 border-green-500/30 text-green-800 dark:text-green-400"
                        : "bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid place-items-center h-8 w-8 rounded-lg font-bold text-sm ${
                          isWinner ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{mach.machine_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Idle: {mach.idle_kwh.toFixed(0)} kWh
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{mach.utilization_pct.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Utilization</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
