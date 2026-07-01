import { Link, useRouterState } from "@tanstack/react-router";
import { Upload, LayoutDashboard, FileText, Zap, PencilLine, Shield, Sparkles, CheckSquare, LineChart, Leaf, Trophy, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/manual-entry", label: "Manual entry", icon: PencilLine },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ai-insights", label: "AI insights", icon: Sparkles },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/approval-queue", label: "Approval Queue", icon: CheckSquare },
  { to: "/forecast", label: "Forecast", icon: LineChart },
  { to: "/carbon-cost", label: "Carbon & Cost", icon: Leaf },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/multi-signal", label: "Multi-Signal Check", icon: Activity },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useAuth();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-5 h-16 border-b">
        <div className="h-9 w-9 rounded-lg overflow-hidden border">
          <img src="/favicon.png" alt="Energy Advisor" className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">Energy Advisor</div>
          <div className="text-xs text-muted-foreground">GenAI insights</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mt-4 border-t pt-4",
              pathname === "/admin"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>
      <div className="p-4 text-xs text-muted-foreground border-t">DB: MongoDB Atlas</div>
    </aside>
  );
}
