import React from "react";
import { Factory, Server, Radio, Wifi, WifiOff, Zap, Monitor, HardDrive } from "lucide-react";
import { ConnectedSystemNode } from "@/lib/connected-systems.functions";
import { cn } from "@/lib/utils";

interface NetworkNodeProps {
  node: ConnectedSystemNode;
  isSelected?: boolean;
  onSelect: (node: ConnectedSystemNode) => void;
  style?: React.CSSProperties;
  className?: string;
  isMobileList?: boolean;
}

export function NetworkNode({
  node,
  isSelected,
  onSelect,
  style,
  className,
  isMobileList = false,
}: NetworkNodeProps) {
  // Determine Node Icon based on type
  const isComputer = node.type === "computer";
  const IconComponent =
    node.type === "computer" ? Monitor : node.type === "sensor_node" ? Radio : Factory;

  // Determine status & staleness
  const isOffline = node.status === "offline" || !node.last_reading_at;
  const isIdle = node.status === "idle";
  const isHighDraw = node.current_power_draw_w > 12000 || node.efficiency_score < 65;

  let colorClasses = {
    bg: "bg-[#33D6A6]/10 dark:bg-[#33D6A6]/15",
    border: "border-[#33D6A6]/40 hover:border-[#33D6A6]",
    text: "text-[#33D6A6]",
    badgeBg: "bg-[#33D6A6]/20 text-[#33D6A6]",
    glow: "shadow-[0_0_15px_rgba(51,214,166,0.25)]",
    pulse: "border-[#33D6A6]/60",
  };

  if (isOffline) {
    colorClasses = {
      bg: "bg-slate-800/40 dark:bg-slate-900/60 opacity-65",
      border: "border-slate-700/60 hover:border-slate-500",
      text: "text-slate-400",
      badgeBg: "bg-slate-700/50 text-slate-400",
      glow: "shadow-none",
      pulse: "border-transparent",
    };
  } else if (isHighDraw || isIdle) {
    colorClasses = {
      bg: "bg-amber-500/10 dark:bg-amber-950/30",
      border: "border-amber-500/40 hover:border-amber-400",
      text: "text-amber-400",
      badgeBg: "bg-amber-500/20 text-amber-300",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.25)]",
      pulse: "border-amber-500/60",
    };
  } else if (isComputer || node.current_power_draw_w > 5000) {
    colorClasses = {
      bg: "bg-sky-500/10 dark:bg-sky-950/30",
      border: "border-sky-500/40 hover:border-sky-400",
      text: "text-sky-400",
      badgeBg: "bg-sky-500/20 text-sky-300",
      glow: "shadow-[0_0_15px_rgba(14,165,233,0.25)]",
      pulse: "border-sky-500/60",
    };
  }

  // Headline Stat:
  // For Computer Nodes -> display real CPU % (Task-Manager style) or "Awaiting report..."
  // For Machine Nodes -> display kW power draw
  let headlineStat = "Awaiting report...";
  if (isOffline) {
    headlineStat = "Offline";
  } else if (isComputer && node.computer_telemetry) {
    headlineStat = `${node.computer_telemetry.cpu_percent}% CPU`;
  } else if (node.current_power_draw_w > 0) {
    headlineStat =
      node.current_power_draw_w >= 1000
        ? `${(node.current_power_draw_w / 1000).toFixed(1)} kW`
        : `${node.current_power_draw_w} W`;
  }

  if (isMobileList) {
    // Mobile Card Reflow Layout
    return (
      <div
        onClick={() => onSelect(node)}
        className={cn(
          "p-4 rounded-xl border backdrop-blur-md transition-all duration-300 cursor-pointer flex items-center justify-between gap-3",
          colorClasses.bg,
          colorClasses.border,
          isSelected && "ring-2 ring-amber-400 shadow-lg scale-[1.01]",
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-10 h-10 rounded-lg border flex items-center justify-center shrink-0",
              colorClasses.bg,
              colorClasses.border,
              colorClasses.text
            )}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-100 dark:text-slate-100 truncate">
              {node.name}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span className="capitalize">{node.type}</span>
              <span>•</span>
              <span className="capitalize">{node.connection_type.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={cn("text-xs font-mono font-bold block", colorClasses.text)}>
            {headlineStat}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isOffline ? "Offline" : `${node.efficiency_score}% Eff`}
          </span>
        </div>
      </div>
    );
  }

  // Desktop Radial Network Node Layout
  return (
    <div
      style={style}
      onClick={() => onSelect(node)}
      className={cn(
        "absolute group cursor-pointer transition-all duration-300 select-none z-20",
        className
      )}
    >
      {/* Outer Pulse Ring for Active Nodes */}
      {!isOffline && (
        <div
          className={cn(
            "absolute -inset-2 rounded-full border opacity-75 animate-ping pointer-events-none",
            colorClasses.pulse
          )}
        />
      )}

      {/* Main Node Card */}
      <div
        className={cn(
          "relative p-3 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center text-center transition-transform duration-300 group-hover:scale-105 min-w-[135px]",
          colorClasses.bg,
          colorClasses.border,
          colorClasses.glow,
          isSelected && "ring-2 ring-amber-400 scale-105 z-30"
        )}
      >
        {/* Connection Type Indicator Badge */}
        <div className="absolute -top-2.5 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono border bg-slate-900/90 border-slate-700">
          {node.connection_type === "iot_wireless" ? (
            isOffline ? (
              <WifiOff className="w-2.5 h-2.5 text-red-400" />
            ) : (
              <Wifi className="w-2.5 h-2.5 text-amber-400" />
            )
          ) : (
            <Zap className="w-2.5 h-2.5 text-sky-400" />
          )}
          {node.connection_type === "iot_wireless" && node.signal_strength !== undefined && (
            <span className="text-slate-300 font-bold">{node.signal_strength}%</span>
          )}
        </div>

        {/* Node Center Icon */}
        <div
          className={cn(
            "w-9 h-9 rounded-xl border flex items-center justify-center mb-1.5 transition-colors",
            colorClasses.bg,
            colorClasses.border,
            colorClasses.text
          )}
        >
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Node Name */}
        <span className="text-[11px] font-medium text-slate-100 dark:text-slate-100 line-clamp-1 max-w-[115px] leading-tight">
          {node.name.split(" ")[0]} {node.name.split(" ")[1] || ""}
        </span>

        {/* Headline Stat & Efficiency */}
        <div className="mt-1 flex items-center gap-1 text-[10px] font-mono font-bold">
          <span className={colorClasses.text}>{headlineStat}</span>
          {!isOffline && !isComputer && (
            <span className="text-slate-400 font-normal">({node.efficiency_score}%)</span>
          )}
        </div>
      </div>
    </div>
  );
}
