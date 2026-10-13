import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEnergyAdvisor } from "@/lib/energy-advisor-context";
import { ResearchTopNav } from "@/components/energy-advisor/ResearchTopNav";
import { ResearchSidebar } from "@/components/energy-advisor/ResearchSidebar";
import {
  Cpu,
  Plus,
  Server,
  Filter,
  ArrowRight,
  Settings,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Fan,
  Laptop,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [{ title: "Device Management — Energy Advisor" }],
  }),
  component: DevicesPage,
});

export function DevicesPage() {
  const { devices, addNewDevice, searchQuery } = useEnergyAdvisor();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterState, setFilterState] = useState<string>("ALL");

  // Form State for new device
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Computer / Workstation");
  const [newNode, setNewNode] = useState("Node 01");
  const [newPower, setNewPower] = useState("50");
  const [newExpected, setNewExpected] = useState("45");

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.esp32NodeId.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterState === "ALL") return matchesSearch;
    if (filterState === "EXCESS")
      return matchesSearch && (d.status === "VERIFIED" || d.status === "DETECTED");
    if (filterState === "NORMAL") return matchesSearch && d.status === "NORMAL";
    return matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addNewDevice({
      name: newName,
      type: newType,
      esp32NodeId: newNode,
      currentPowerW: Number(newPower) || 50,
      expectedPowerW: Number(newExpected) || 45,
      currentState: "IDLE",
    });

    setNewName("");
    setIsAddOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px] font-mono">
            VERIFIED EXCESS
          </Badge>
        );
      case "DETECTED":
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-mono">
            DETECTED
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
            UNDER REVIEW
          </Badge>
        );
      case "NORMAL":
      default:
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono">
            NORMAL
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Device Registry & State Models
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Manage IoT connected hardware endpoints and their state-specific expected energy
                baselines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsAddOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono h-9 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Device
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0d131f] border border-white/10 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Filter Status:</span>
              {(["ALL", "EXCESS", "NORMAL"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterState(s)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterState === s
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="text-slate-400 text-[11px]">
              Showing <span className="text-white font-bold">{filteredDevices.length}</span>{" "}
              endpoints
            </div>
          </div>

          {/* Devices Table */}
          <div className="rounded-2xl border border-white/10 bg-[#0d131f] shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/80 border-b border-white/5 font-mono text-[11px]">
                <TableRow>
                  <TableHead className="text-slate-300">Device Name</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Operating State</TableHead>
                  <TableHead className="text-right text-slate-300">Actual Power</TableHead>
                  <TableHead className="text-right text-slate-300">Expected Power</TableHead>
                  <TableHead className="text-right text-slate-300">Excess Power</TableHead>
                  <TableHead className="text-center text-slate-300">Status</TableHead>
                  <TableHead className="text-center text-slate-300">ESP32 Node</TableHead>
                  <TableHead className="text-right text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono text-xs divide-y divide-white/5">
                {filteredDevices.map((dev) => (
                  <TableRow key={dev.id} className="hover:bg-slate-900/40 transition-colors">
                    <TableCell className="font-bold text-white">
                      <div>{dev.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{dev.location}</div>
                    </TableCell>
                    <TableCell className="text-slate-300">{dev.type}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold text-[11px]">
                        {dev.currentState}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {dev.currentPowerW} W
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {dev.expectedPowerW} W
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      <span
                        className={dev.excessPowerW > 5 ? "text-amber-400" : "text-emerald-400"}
                      >
                        +{dev.excessPowerW} W
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(dev.status)}</TableCell>
                    <TableCell className="text-center text-slate-400">{dev.esp32NodeId}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] border-cyan-500/30 text-cyan-300 hover:bg-cyan-950 cursor-pointer"
                      >
                        <Link to="/device-details" search={{ deviceId: dev.id }}>
                          View Analysis <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* Add Device Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-[#0f172a] border-cyan-500/30 text-white font-mono">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">
              Register New Monitored Device
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configure edge telemetry node mapping and state baseline bounds.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 text-xs mt-2">
            <div>
              <label className="text-slate-300 block mb-1">Device Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. GPU Server Node 04"
                className="bg-slate-900 border-white/10 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Device Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full h-9 rounded-md bg-slate-900 border border-white/10 px-3 text-xs text-white"
                >
                  <option value="Computer / Workstation">Computer / Workstation</option>
                  <option value="Server / Compute Node">Server / Compute Node</option>
                  <option value="Cooling / HVAC">Cooling / HVAC</option>
                  <option value="Peripheral / Lab Machine">Peripheral / Lab Machine</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">ESP32 Node</label>
                <select
                  value={newNode}
                  onChange={(e) => setNewNode(e.target.value)}
                  className="w-full h-9 rounded-md bg-slate-900 border border-white/10 px-3 text-xs text-white"
                >
                  <option value="Node 01">Node 01 (Channel A)</option>
                  <option value="Node 02">Node 02 (Channel B)</option>
                  <option value="Node 03">Node 03 (Channel C)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Initial Power Draw (W)</label>
                <Input
                  type="number"
                  value={newPower}
                  onChange={(e) => setNewPower(e.target.value)}
                  className="bg-slate-900 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Learned Idle Baseline (W)</label>
                <Input
                  type="number"
                  value={newExpected}
                  onChange={(e) => setNewExpected(e.target.value)}
                  className="bg-slate-900 border-white/10 text-white"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Register Endpoint
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
