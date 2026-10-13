import React from "react";
import {
  Zap,
  Flame,
  Gauge,
  Wifi,
  WifiOff,
  Radio,
  Clock,
  Lightbulb,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Server,
  Factory,
  Monitor,
  Cpu,
  HardDrive,
  Activity,
  Bot,
  Thermometer,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ConnectedSystemNode } from "@/lib/connected-systems.functions";
import { AgentPersonaBadge, AgentPersonaType } from "@/components/AgentPersonaBadge";
import { AskEnergyDataPanel } from "@/components/AskEnergyDataPanel";
import { formatDistanceToNow } from "date-fns";

interface NodeDetailDrawerProps {
  node: ConnectedSystemNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeDetailDrawer({ node, open, onOpenChange }: NodeDetailDrawerProps) {
  if (!node) return null;

  const isComputer = node.type === "computer";
  const isOffline = node.status === "offline";
  const isIdle = node.status === "idle";
  const telemetry = node.computer_telemetry;

  // Determine Persona badge mapping
  let persona: AgentPersonaType = "Act";
  if (isOffline || isIdle || node.efficiency_score < 65) {
    persona = node.efficiency_score < 65 ? "Diagnose" : "Watch";
  }

  const IconComponent =
    node.type === "computer" ? Monitor : node.type === "sensor_node" ? Radio : Factory;

  // Format last reading timestamp
  let lastSeenText = "Never reported";
  try {
    if (node.last_reading_at) {
      lastSeenText = `${formatDistanceToNow(new Date(node.last_reading_at))} ago`;
    }
  } catch {
    lastSeenText = "Recently";
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-950 text-slate-100 border-l-slate-800 p-6 overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <AgentPersonaBadge persona={persona} size="sm" />
            <Badge
              variant="outline"
              className={
                isOffline
                  ? "border-red-500/40 bg-red-950/30 text-red-400 font-mono"
                  : isIdle
                  ? "border-amber-500/40 bg-amber-950/30 text-amber-400 font-mono"
                  : "border-[#33D6A6]/40 bg-[#33D6A6]/20 text-[#33D6A6] font-mono"
              }
            >
              {isOffline ? "OFFLINE / STALE" : node.status.toUpperCase()}
            </Badge>
          </div>

          <SheetTitle className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-amber-400" />
            <span>{node.name}</span>
          </SheetTitle>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> {node.location}
            </span>
            <span>•</span>
            <span className="capitalize">{node.type} node</span>
          </div>
        </SheetHeader>

        {/* Offline / Staleness Alert Banner */}
        {isOffline && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-200 block">Offline / Not Reporting</span>
              <p className="mt-0.5 text-[11px] text-red-300/80 leading-relaxed">
                No telemetry reported within the sampling interval. Check if{" "}
                <code className="font-mono text-red-200">energyiq-agent.py</code> is running on this device.
              </p>
            </div>
          </div>
        )}

        <div className="py-6 space-y-6">
          {/* TASK MANAGER STYLE PERFORMANCE TAB PANEL FOR COMPUTER NODES */}
          {isComputer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800/80">
                <span>Task Manager OS Telemetry</span>
                <span className="text-amber-400 font-bold">
                  {telemetry ? `${telemetry.os_type} (${telemetry.hostname})` : "Awaiting First Report"}
                </span>
              </div>

              {telemetry ? (
                <div className="space-y-4">
                  {/* CPU Metric Card */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300 flex items-center gap-1.5 font-bold">
                        <Cpu className="w-4 h-4 text-sky-400" /> CPU Utilization
                      </span>
                      <span className="font-mono font-bold text-sky-400 text-sm">
                        {telemetry.cpu_percent}% ({telemetry.cpu_freq_ghz} GHz)
                      </span>
                    </div>
                    <Progress value={telemetry.cpu_percent} className="h-2.5 bg-slate-800" />
                    <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>Clock: {telemetry.cpu_freq_ghz} GHz</span>
                      <span>Target: &lt;75%</span>
                    </div>
                  </div>

                  {/* Memory (RAM) Metric Card */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300 flex items-center gap-1.5 font-bold">
                        <HardDrive className="w-4 h-4 text-[#33D6A6]" /> Memory (RAM)
                      </span>
                      <span className="font-mono font-bold text-[#33D6A6] text-sm">
                        {telemetry.memory_used_gb} / {telemetry.memory_total_gb} GB ({telemetry.memory_percent}%)
                      </span>
                    </div>
                    <Progress value={telemetry.memory_percent} className="h-2.5 bg-slate-800" />
                    <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>Available: {(telemetry.memory_total_gb - telemetry.memory_used_gb).toFixed(1)} GB</span>
                      <span>Total: {telemetry.memory_total_gb} GB</span>
                    </div>
                  </div>

                  {/* Disk & Network Dual Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Primary Disk Usage */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                      <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Primary Disk
                      </span>
                      <div className="text-xl font-bold font-mono text-purple-400">
                        {telemetry.disk_percent}% Used
                      </div>
                      <Progress value={telemetry.disk_percent} className="h-1.5 bg-slate-800" />
                    </div>

                    {/* Network Throughput */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                      <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-400" /> Network Throughput
                      </span>
                      <div className="text-xs font-mono font-bold text-amber-400 pt-1">
                        Send: {telemetry.network_send_kbps} Kbps
                      </div>
                      <div className="text-xs font-mono font-bold text-sky-400">
                        Recv: {telemetry.network_recv_kbps} Kbps
                      </div>
                    </div>
                  </div>

                  {/* GPU Telemetry Card (If Available) */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300 flex items-center gap-1.5 font-bold">
                        <Thermometer className="w-4 h-4 text-rose-400" /> GPU Acceleration
                      </span>
                      {telemetry.gpu_percent !== null && telemetry.gpu_percent !== undefined ? (
                        <span className="font-mono font-bold text-rose-400 text-sm">
                          {telemetry.gpu_percent}% ({telemetry.gpu_temp_c}°C)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          GPU data unavailable on this device
                        </span>
                      )}
                    </div>
                    {telemetry.gpu_percent !== null && telemetry.gpu_percent !== undefined && (
                      <Progress value={telemetry.gpu_percent} className="h-2 bg-slate-800" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-3">
                  <Monitor className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                  <span className="text-xs text-slate-400 font-mono block">
                    Awaiting first telemetry report from agent...
                  </span>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 text-left">
                    Run python script on monitored host:
                    <code className="block text-amber-300 mt-1">
                      python agent/energyiq-agent.py --token {node.device_token || node.id}
                    </code>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* INDUSTRIAL MACHINE METRICS PANEL */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Live Power Draw */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-400" /> Live Power Draw
                  </span>
                  <div className="text-2xl font-bold font-mono text-sky-400">
                    {isOffline
                      ? "0 W"
                      : node.current_power_draw_w >= 1000
                      ? `${(node.current_power_draw_w / 1000).toFixed(2)} kW`
                      : `${node.current_power_draw_w} W`}
                  </div>
                  <div className="text-[10px] text-slate-400">Today: {node.today_kwh} kWh</div>
                </div>

                {/* Estimated Heat Output */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Heat Output
                  </span>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {isOffline
                      ? "0 W"
                      : node.estimated_heat_output_w >= 1000
                      ? `${(node.estimated_heat_output_w / 1000).toFixed(2)} kW`
                      : `${node.estimated_heat_output_w} W`}
                  </div>
                  <div className="text-[9px] text-amber-400/80 font-mono tracking-tight uppercase">
                    * Derived Estimate
                  </div>
                </div>
              </div>

              {/* Efficiency Score Gauge */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#33D6A6]" /> Efficiency Rating
                  </span>
                  <span className="font-mono font-bold text-[#33D6A6]">{node.efficiency_score}%</span>
                </div>
                <Progress value={node.efficiency_score} className="h-2 bg-slate-800" />
              </div>
            </div>
          )}

          {/* Connection Status Details */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              {node.connection_type === "iot_wireless" ? (
                <Wifi className="w-4 h-4 text-amber-400" />
              ) : (
                <Zap className="w-4 h-4 text-sky-400" />
              )}
              <span>Telemetry Link Status</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Link Type:</span>
                <span className="font-mono text-slate-200 font-medium capitalize">
                  {node.connection_type.replace("_", " ")}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Last Telemetry:</span>
                <span className="font-mono text-slate-200 font-medium">{lastSeenText}</span>
              </div>
            </div>
          </div>

          {/* GenAI Power & Performance Recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Reduction Recommendations
            </h4>

            <div className="space-y-2">
              {node.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#33D6A6] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Consultation Button */}
          <div className="pt-4 border-t border-slate-800">
            <AskEnergyDataPanel
              trigger={
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 py-3 rounded-xl shadow-lg">
                  <Bot className="w-4 h-4" /> Ask AI Assistant About {node.name.split(" ")[0]}
                </Button>
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
