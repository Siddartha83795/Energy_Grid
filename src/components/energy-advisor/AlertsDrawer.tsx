import React from "react";
import { EnergyAlert } from "@/lib/energy-advisor-context";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  ShieldAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface Props {
  alerts: EnergyAlert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AlertsDrawer({ alerts, onAcknowledge, onDismiss }: Props) {
  const getBadge = (type: EnergyAlert["type"]) => {
    switch (type) {
      case "HIGH_EXCESS":
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px] font-mono">
            HIGH EXCESS
          </Badge>
        );
      case "VERIFIED":
        return (
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
            VERIFIED
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
            UNDER REVIEW
          </Badge>
        );
      case "NORMAL":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono">
            NORMAL
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Real-Time Alert Feed</h3>
          <Badge
            variant="outline"
            className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs font-mono"
          >
            {alerts.length} Active
          </Badge>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Continuous Monitoring</span>
      </div>

      {/* Alerts list */}
      <div className="space-y-2.5">
        {alerts.map((alert) => {
          const isAcknowledged = alert.status === "ACKNOWLEDGED";

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                alert.type === "HIGH_EXCESS"
                  ? "bg-red-950/20 border-red-500/30"
                  : alert.type === "UNDER_REVIEW"
                    ? "bg-purple-950/20 border-purple-500/30"
                    : "bg-slate-900/60 border-white/5"
              } ${isAcknowledged ? "opacity-70" : ""}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getBadge(alert.type)}
                  <span className="font-bold text-white text-sm">{alert.deviceName}</span>
                  <span className="text-slate-500 text-[10px]">• {alert.time}</span>
                </div>
                <div className="text-slate-300 font-semibold">
                  {alert.excessPowerText} —{" "}
                  <span className="text-slate-400 font-normal">{alert.cause}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {!isAcknowledged && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2.5 border-white/10 hover:bg-slate-800 text-slate-300 cursor-pointer"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    <Check className="h-3 w-3 mr-1 text-emerald-400" /> Acknowledge
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] px-2.5 border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50 cursor-pointer"
                >
                  <Link to="/cause-analysis">
                    View Analysis <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300 cursor-pointer"
                  onClick={() => onDismiss(alert.id)}
                  title="Dismiss alert"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
