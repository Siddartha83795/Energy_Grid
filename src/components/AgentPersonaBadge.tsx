import React from "react";
import { Eye, Search, Zap, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type AgentPersonaType = "Watch" | "Diagnose" | "Act" | "Brief";

interface AgentPersonaBadgeProps {
  persona: AgentPersonaType;
  size?: "sm" | "md";
  showRole?: boolean;
  className?: string;
}

const PERSONA_CONFIG: Record<
  AgentPersonaType,
  {
    name: string;
    role: string;
    icon: React.ElementType;
    bg: string;
    border: string;
    text: string;
    iconColor: string;
  }
> = {
  Watch: {
    name: "Watch Agent",
    role: "Detection",
    icon: Eye,
    bg: "bg-amber-500/10 dark:bg-amber-950/30",
    border: "border-amber-500/30",
    text: "text-amber-400",
    iconColor: "text-amber-400",
  },
  Diagnose: {
    name: "Diagnose Agent",
    role: "Root-Cause",
    icon: Search,
    bg: "bg-sky-500/10 dark:bg-sky-950/30",
    border: "border-sky-500/30",
    text: "text-sky-400",
    iconColor: "text-sky-400",
  },
  Act: {
    name: "Act Agent",
    role: "Action Gating",
    icon: Zap,
    bg: "bg-[#33D6A6]/10 dark:bg-[#33D6A6]/20",
    border: "border-[#33D6A6]/30",
    text: "text-[#33D6A6]",
    iconColor: "text-[#33D6A6]",
  },
  Brief: {
    name: "Brief Agent",
    role: "Reporting",
    icon: FileText,
    bg: "bg-purple-500/10 dark:bg-purple-950/30",
    border: "border-purple-500/30",
    text: "text-purple-400",
    iconColor: "text-purple-400",
  },
};

export function AgentPersonaBadge({
  persona,
  size = "md",
  showRole = true,
  className,
}: AgentPersonaBadgeProps) {
  const config = PERSONA_CONFIG[persona] || PERSONA_CONFIG.Brief;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-tight backdrop-blur-sm transition-all",
        config.bg,
        config.border,
        config.text,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", config.iconColor)} />
      <span className="font-bold">{config.name}</span>
      {showRole && (
        <>
          <span className="opacity-40">•</span>
          <span className="opacity-80 font-normal">{config.role}</span>
        </>
      )}
    </span>
  );
}
