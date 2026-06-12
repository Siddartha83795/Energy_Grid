import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getEnergyEntries, addDetailedEntry, addDailyEntry, deleteEnergyEntry } from "@/lib/energy.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/manual-entry")({
  head: () => ({ meta: [{ title: "Manual entry — Energy Advisor" }] }),
  component: ManualEntryPage,
});

type Entry = {
  id: string;
  kind: "detailed" | "daily";
  machine_name: string;
  recorded_at: string | null;
  kwh: number | null;
  status: string | null;
  entry_date: string | null;
  total_kwh: number | null;
  idle_kwh: number | null;
};

function ManualEntryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);

  // detailed form
  const [dMachine, setDMachine] = useState("");
  const [dAt, setDAt] = useState("");
  const [dKwh, setDKwh] = useState("");
  const [dStatus, setDStatus] = useState("active");
  // daily form
  const [yMachine, setYMachine] = useState("");
  const [yDate, setYDate] = useState("");
  const [yTotal, setYTotal] = useState("");
  const [yIdle, setYIdle] = useState("");

  const load = async () => {
    if (!user) return;
    try {
      const data = await getEnergyEntries();
      setEntries(data as Entry[]);
    } catch (err) {
      toast.error("Failed to load energy entries");
    }
  };
  useEffect(() => { load(); }, [user]);

  const addDetailed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await addDetailedEntry({
        data: {
          machine_name: dMachine,
          recorded_at: dAt ? new Date(dAt).toISOString() : new Date().toISOString(),
          kwh: Number(dKwh),
          status: dStatus,
        }
      });
      toast.success("Entry added");
      setDMachine(""); setDAt(""); setDKwh(""); setDStatus("active");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add entry");
    } finally {
      setBusy(false);
    }
  };

  const addDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await addDailyEntry({
        data: {
          machine_name: yMachine,
          entry_date: yDate,
          total_kwh: Number(yTotal),
          idle_kwh: Number(yIdle),
        }
      });
      toast.success("Daily entry added");
      setYMachine(""); setYDate(""); setYTotal(""); setYIdle("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add daily entry");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteEnergyEntry({ data: { id } });
      load();
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Manual entry</h1>
        <p className="text-muted-foreground mt-1">Add energy readings without uploading a CSV.</p>
      </header>

      <Tabs defaultValue="detailed">
        <TabsList>
          <TabsTrigger value="detailed">Detailed row</TabsTrigger>
          <TabsTrigger value="daily">Daily summary</TabsTrigger>
        </TabsList>

        <TabsContent value="detailed">
          <form onSubmit={addDetailed} className="grid sm:grid-cols-5 gap-3 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1"><Label>Machine</Label><Input required value={dMachine} onChange={(e) => setDMachine(e.target.value)} /></div>
            <div className="space-y-1"><Label>Timestamp</Label><Input type="datetime-local" value={dAt} onChange={(e) => setDAt(e.target.value)} /></div>
            <div className="space-y-1"><Label>kWh</Label><Input required type="number" step="0.01" value={dKwh} onChange={(e) => setDKwh(e.target.value)} /></div>
            <div className="space-y-1"><Label>Status</Label>
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={dStatus} onChange={(e) => setDStatus(e.target.value)}>
                <option value="active">Active</option><option value="idle">Idle</option>
              </select>
            </div>
            <div className="flex items-end"><Button type="submit" disabled={busy} className="w-full">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add</>}</Button></div>
          </form>
        </TabsContent>

        <TabsContent value="daily">
          <form onSubmit={addDaily} className="grid sm:grid-cols-5 gap-3 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1"><Label>Machine</Label><Input required value={yMachine} onChange={(e) => setYMachine(e.target.value)} /></div>
            <div className="space-y-1"><Label>Date</Label><Input required type="date" value={yDate} onChange={(e) => setYDate(e.target.value)} /></div>
            <div className="space-y-1"><Label>Total kWh</Label><Input required type="number" step="0.01" value={yTotal} onChange={(e) => setYTotal(e.target.value)} /></div>
            <div className="space-y-1"><Label>Idle kWh</Label><Input required type="number" step="0.01" value={yIdle} onChange={(e) => setYIdle(e.target.value)} /></div>
            <div className="flex items-end"><Button type="submit" disabled={busy} className="w-full">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add</>}</Button></div>
          </form>
        </TabsContent>
      </Tabs>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-4 border-b font-semibold">Recent entries</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead><TableHead>Machine</TableHead><TableHead>When</TableHead>
              <TableHead className="text-right">kWh</TableHead><TableHead className="text-right">Idle kWh</TableHead>
              <TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No entries yet.</TableCell></TableRow>}
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="capitalize">{e.kind}</TableCell>
                <TableCell>{e.machine_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.kind === "detailed" ? (e.recorded_at ? new Date(e.recorded_at).toLocaleString() : "—") : e.entry_date}</TableCell>
                <TableCell className="text-right">{e.kind === "detailed" ? e.kwh : e.total_kwh}</TableCell>
                <TableCell className="text-right">{e.kind === "daily" ? e.idle_kwh : "—"}</TableCell>
                <TableCell>{e.status ?? "—"}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}