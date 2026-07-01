import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Leaf, ShieldAlert, Award, DollarSign } from "lucide-react";
import { getCarbonCostSavings } from "@/lib/new-features.functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/carbon-cost")({
  head: () => ({ meta: [{ title: "Carbon & Cost — Energy Advisor" }] }),
  component: CarbonCostPage,
});

function CarbonCostPage() {
  const getSavings = useServerFn(getCarbonCostSavings);

  const {
    data: savings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["carbonCostSavings"],
    queryFn: () => getSavings(),
  });

  const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Leaf className="h-7 w-7 text-green-500" /> Carbon & Cost Optimization
        </h1>
        <p className="text-muted-foreground mt-1">
          Tariff-Aware & Solar PV Offsets — Estimated environmental and financial savings from load
          shifting.
        </p>
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Calculating offset savings…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border bg-card p-6 text-destructive text-center max-w-md mx-auto">
          <ShieldAlert className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Failed to load savings analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">Please try reloading the page.</p>
        </div>
      )}

      {savings && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-card p-5 shadow-sm border-l-4 border-l-green-500">
              <div className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-green-500" /> Carbon Saved
              </div>
              <div className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">
                {savings.co2_saved_kg.toFixed(1)} kg CO2e
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avoided footprint this analysis run
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm border-l-4 border-l-primary">
              <div className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" /> Cost Shifting Savings
              </div>
              <div className="text-2xl font-bold mt-2 text-primary">
                {inr(savings.cost_saved_timing_shift_inr)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Savings by shifting 15% to solar/night
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm border-l-4 border-l-orange-500">
              <div className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-orange-500" /> Grid Factor
              </div>
              <div className="text-2xl font-bold mt-2 text-orange-600">
                {savings.grid_emission_factor} kg/kWh
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Regional grid average carbon index
              </div>
            </div>
          </div>

          <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold">Active Tariff rate Bands</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Band Name</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead className="text-right">Price per kWh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savings.tariffs.map((t, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{t.name.split(" (")[0]}</TableCell>
                    <TableCell className="text-muted-foreground">
                      ({t.name.split(" (")[1]}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {t.rate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 p-5 space-y-2">
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-400 flex items-center gap-1.5">
              🌱 Sustainability Impact Summary
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              By shifting CNC Mill test runs to the peak solar generation window (10 AM to 3 PM), we
              leverage our on-site 150 kW Solar PV system. This effectively offsets grid emissions
              with clean zero-carbon energy and drops peak tariff charges to off-peak baselines,
              delivering combined environmental and operational cost dividends.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
