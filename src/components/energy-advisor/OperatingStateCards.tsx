import React from "react";
import { Device } from "@/lib/energy-advisor-research";
import { ArrowRight, Cpu, Fan, Laptop, Monitor, Printer, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface Props {
  devices: Device[];
  onSelectDevice?: (id: string) => void;
}

export function OperatingStateCards({ devices, onSelectDevice }: Props) {
  const getDeviceIcon = (type: string, name: string) => {
    if (name.toLowerCase().includes("laptop")) return <Laptop className="h-4 w-4" />;
    if (name.toLowerCase().includes("fan")) return <Fan className="h-4 w-4" />;
    if (name.toLowerCase().includes("printer")) return <Printer className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getStatusBadge = (status: Device["status"]) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] font-mono"
          >
            EXCESS DETECTED
          </Badge>
        );
      case "DETECTED":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px] font-mono"
          >
            DETECTED
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px] font-mono"
          >
            REVIEW
          </Badge>
        );
      case "NORMAL":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono"
          >
            NORMAL
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Current Operating States
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Real-time state identification & expected load baselines
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400">
          {devices.length} Monitored Endpoints
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((dev) => {
          const isExcess = dev.status === "VERIFIED" || dev.status === "DETECTED";
          const isReview = dev.status === "UNDER_REVIEW";

          return (
            <div
              key={dev.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between backdrop-blur-md relative group ${
                isExcess
                  ? "bg-[#15121b] border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-950/20"
                  : isReview
                    ? "bg-[#121320] border-purple-500/30 hover:border-purple-500/60"
                    : "bg-[#0d131f] border-white/10 hover:border-white/20"
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-lg grid place-items-center ${
                        isExcess
                          ? "bg-amber-500/10 text-amber-400"
                          : isReview
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-cyan-500/10 text-cyan-400"
                      }`}
                    >
                      {getDeviceIcon(dev.type, dev.name)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">
                        {dev.name.split("(")[0].trim()}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{dev.esp32NodeId}</div>
                    </div>
                  </div>
                  {getStatusBadge(dev.status)}
                </div>

                {/* State Pill */}
                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-900/80 border border-white/5 font-mono text-xs mb-3">
                  <span className="text-slate-400 text-[11px]">Identified State:</span>
                  <span className="font-bold text-cyan-300">{dev.currentState}</span>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono py-2 border-y border-white/5 mb-3">
                  <div className="p-1.5 rounded bg-slate-900/40">
                    <span className="text-[9px] text-slate-400 uppercase block">Actual</span>
                    <span className="text-xs font-bold text-white">{dev.currentPowerW} W</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/40">
                    <span className="text-[9px] text-slate-400 uppercase block">Expected</span>
                    <span className="text-xs font-bold text-slate-300">{dev.expectedPowerW} W</span>
                  </div>
                  <div
                    className={`p-1.5 rounded ${isExcess ? "bg-amber-950/60" : "bg-slate-900/40"}`}
                  >
                    <span className="text-[9px] text-slate-400 uppercase block">Excess</span>
                    <span
                      className={`text-xs font-bold ${
                        isExcess ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      +{dev.excessPowerW} W
                    </span>
                  </div>
                </div>
              </div>

              {/* View Analysis CTA */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full mt-2 h-8 text-xs font-mono border-white/10 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/40 cursor-pointer"
                onClick={() => onSelectDevice && onSelectDevice(dev.id)}
              >
                <Link to="/device-details" search={{ deviceId: dev.id }}>
                  View Analysis <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
