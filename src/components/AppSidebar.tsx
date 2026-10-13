import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Upload,
  LayoutDashboard,
  FileText,
  Zap,
  PencilLine,
  Shield,
  Sparkles,
  CheckSquare,
  LineChart,
  Leaf,
  Trophy,
  Activity,
  Server,
  Cpu,
  HelpCircle,
  Lightbulb,
  TrendingDown,
  GraduationCap,
  Settings as SettingsIcon,
  Play,
  Scale,
  Split,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getPathIndex } from "@/lib/navigation";
import { useEnergyAdvisor } from "@/lib/energy-advisor-context";

const researchItems = [
  { to: "/research-dashboard", label: "Energy Advisor", icon: LayoutDashboard },
  { to: "/experiment-runner", label: "Experiment Runner", icon: Play },
  { to: "/expected-energy-comparison", label: "Exp 1: Expected Energy", icon: LineChart },
  { to: "/ledger-validation", label: "Exp 2: Ledger Validation", icon: Layers },
  { to: "/counterfactual-validation", label: "Exp 3: Counterfactual", icon: Split },
  { to: "/recommendation-effectiveness", label: "Exp 4: Recommendations", icon: Lightbulb },
  { to: "/statistical-analysis", label: "Statistical Tests", icon: Scale },
  { to: "/latex-export", label: "IEEE LaTeX Export", icon: FileText },
  { to: "/devices", label: "Devices", icon: Server },
  { to: "/device-details", label: "Device Details", icon: Cpu },
  { to: "/energy-analysis", label: "Energy Analysis", icon: LineChart },
  { to: "/cause-analysis", label: "Cause Analysis", icon: HelpCircle },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/energy-saving", label: "Energy Saving", icon: TrendingDown },
  { to: "/research-evaluation", label: "Research Evaluation", icon: GraduationCap },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

const legacyItems = [
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/manual-entry", label: "Manual entry", icon: PencilLine },
  { to: "/dashboard", label: "Legacy Dashboard", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Digital Twin", icon: Cpu },
  { to: "/cluster-devices", label: "Cluster Devices", icon: Server },
  { to: "/ai-insights", label: "AI insights", icon: Sparkles },
  { to: "/approval-queue", label: "Approvals", icon: CheckSquare },
  { to: "/forecast", label: "Forecast", icon: LineChart },
  { to: "/carbon-cost", label: "Carbon & Cost Impact", icon: Leaf },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/multi-signal", label: "Multi-Signal Check", icon: Activity },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useAuth();
  const { liveLastSyncSeconds } = useEnergyAdvisor();
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    if (prevPath !== pathname) {
      const prevIdx = getPathIndex(prevPath);
      const newIdx = getPathIndex(pathname);
      if (prevIdx !== -1 && newIdx !== -1) {
        setDirection(newIdx > prevIdx ? "forward" : "backward");
      }
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  const activeSeamClass =
    direction === "backward" ? "flow-seam-light-backward" : "flow-seam-light-forward";

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b shrink-0">
        <div className="h-9 w-9 rounded-lg overflow-hidden border">
          <img src="/favicon.png" alt="Energy Advisor" className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight font-display">ENERGY ADVISOR</div>
          <div className="text-[10px] text-muted-foreground font-mono">B.Tech Research</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
          Research Workflow
        </div>
        {researchItems.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-mono transition-all border border-transparent",
                active
                  ? cn(
                      "bg-white/80 dark:bg-cyan-950/60 text-foreground dark:text-cyan-300 border-black/5 dark:border-cyan-500/40 shadow-sm font-semibold",
                      activeSeamClass,
                    )
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <it.icon className={cn("h-4 w-4", active && "text-cyan-400")} />
              {it.label}
            </Link>
          );
        })}

        <div className="px-3 pt-3 pb-1 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider border-t mt-3">
          Tools & Diagnostics
        </div>
        {legacyItems.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all border border-transparent",
                active
                  ? cn(
                      "bg-white/80 dark:bg-white/10 text-foreground dark:text-white border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden font-semibold",
                      activeSeamClass,
                    )
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <it.icon className="h-3.5 w-3.5" />
              {it.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all mt-2 border-t pt-2 border-transparent",
              pathname === "/admin"
                ? cn(
                    "bg-white/80 dark:bg-white/10 text-foreground dark:text-white border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden font-semibold",
                    activeSeamClass,
                  )
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </Link>
        )}
      </nav>

      {/* System Status Footer */}
      <div className="p-3.5 text-[11px] font-mono border-t bg-card/50 shrink-0 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>System Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>ESP32 Nodes:</span>
          <span className="text-foreground font-semibold">3 Online</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground text-[10px]">
          <span>Last Sync:</span>
          <span>{liveLastSyncSeconds} sec ago</span>
        </div>
      </div>
    </aside>
  );
}
