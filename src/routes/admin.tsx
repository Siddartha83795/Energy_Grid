import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield, Trash2, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminData, toggleUserRole, deleteUserProfile, updateEnergyEntry } from "@/lib/admin.functions";
import { deleteEnergyEntry } from "@/lib/energy.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Energy Advisor" }] }),
  component: AdminPage,
});

type Staff = { id: string; email: string | null; full_name: string | null; company: string | null; role: "admin" | "staff" };
type Entry = { id: string; user_id: string; kind: string; source: string; machine_name: string; total_kwh: number | null; idle_kwh: number | null; kwh: number | null; recorded_at: string | null; entry_date: string | null; status: string | null };

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Entry>>({});

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [isAdmin, loading, navigate]);

  const load = async () => {
    try {
      const { staff: staffData, entries: entriesData } = await getAdminData();
      setStaff(staffData as Staff[]);
      setEntries(entriesData as Entry[]);
    } catch (err) {
      toast.error("Failed to load admin data");
    }
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const removeStaff = async (id: string) => {
    if (!confirm("Delete this user's profile? (Their auth account will remain.)")) return;
    try {
      await deleteUserProfile({ data: { userId: id } });
      toast.success("Removed");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove staff");
    }
  };

  const toggleRole = async (s: Staff) => {
    const next: "admin" | "staff" = s.role === "admin" ? "staff" : "admin";
    try {
      await toggleUserRole({ data: { userId: s.id, nextRole: next } });
      toast.success(`Role set to ${next}`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change role");
    }
  };

  const startEdit = (e: Entry) => { setEditingId(e.id); setDraft(e); };
  const cancelEdit = () => { setEditingId(null); setDraft({}); };
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateEnergyEntry({
        data: {
          id: editingId,
          machine_name: draft.machine_name || "",
          total_kwh: draft.total_kwh !== undefined ? Number(draft.total_kwh) : null,
          idle_kwh: draft.idle_kwh !== undefined ? Number(draft.idle_kwh) : null,
          kwh: draft.kwh !== undefined ? Number(draft.kwh) : null,
          status: draft.status || null,
        }
      });
      toast.success("Saved");
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save edit");
    }
  };
  const removeEntry = async (id: string) => {
    if (!confirm("Delete entry?")) return;
    try {
      await deleteEnergyEntry({ data: { id } });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary"><Shield className="h-5 w-5" /></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground">Manage staff and energy data.</p>
        </div>
      </header>

      <Tabs defaultValue="staff">
        <TabsList><TabsTrigger value="staff">Staff</TabsTrigger><TabsTrigger value="entries">Energy entries</TabsTrigger></TabsList>

        <TabsContent value="staff">
          <div className="rounded-2xl border bg-card shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead><TableHead>Role</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.full_name || "—"}</TableCell>
                    <TableCell className="text-sm">{s.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.company || "—"}</TableCell>
                    <TableCell><Badge variant={s.role === "admin" ? "default" : "secondary"}>{s.role}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleRole(s)}>Make {s.role === "admin" ? "staff" : "admin"}</Button>
                      <Button variant="ghost" size="icon" onClick={() => removeStaff(s.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="p-3 text-xs text-muted-foreground border-t">
              To add a new staff member, ask them to sign up at <code>/auth</code>; they'll appear here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="entries">
          <div className="rounded-2xl border bg-card shadow-sm overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Source</TableHead><TableHead>Kind</TableHead><TableHead>Machine</TableHead>
                <TableHead>kWh</TableHead><TableHead>Total</TableHead><TableHead>Idle</TableHead>
                <TableHead>Status</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {entries.map((e) => {
                  const editing = editingId === e.id;
                  return (
                    <TableRow key={e.id}>
                      <TableCell><Badge variant="outline">{e.source}</Badge></TableCell>
                      <TableCell>{e.kind}</TableCell>
                      <TableCell>{editing
                        ? <Input className="h-8" value={draft.machine_name ?? ""} onChange={(ev) => setDraft({ ...draft, machine_name: ev.target.value })} />
                        : e.machine_name}</TableCell>
                      <TableCell>{editing
                        ? <Input className="h-8 w-20" type="number" value={draft.kwh ?? ""} onChange={(ev) => setDraft({ ...draft, kwh: Number(ev.target.value) })} />
                        : (e.kwh ?? "—")}</TableCell>
                      <TableCell>{editing
                        ? <Input className="h-8 w-20" type="number" value={draft.total_kwh ?? ""} onChange={(ev) => setDraft({ ...draft, total_kwh: Number(ev.target.value) })} />
                        : (e.total_kwh ?? "—")}</TableCell>
                      <TableCell>{editing
                        ? <Input className="h-8 w-20" type="number" value={draft.idle_kwh ?? ""} onChange={(ev) => setDraft({ ...draft, idle_kwh: Number(ev.target.value) })} />
                        : (e.idle_kwh ?? "—")}</TableCell>
                      <TableCell>{editing
                        ? <Input className="h-8 w-20" value={draft.status ?? ""} onChange={(ev) => setDraft({ ...draft, status: ev.target.value })} />
                        : (e.status ?? "—")}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {editing ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={saveEdit}><Save className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => startEdit(e)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => removeEntry(e.id)}><Trash2 className="h-4 w-4" /></Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {entries.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No entries yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}