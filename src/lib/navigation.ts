import {
  Upload,
  LayoutDashboard,
  FileText,
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
} from "lucide-react";

export const NAV_ORDER = [
  "/upload",
  "/manual-entry",
  "/dashboard",
  "/digital-twin",
  "/cluster-devices",
  "/ai-insights",
  "/report",
  "/approval-queue",
  "/forecast",
  "/carbon-cost",
  "/leaderboard",
  "/multi-signal",
  "/admin",
] as const;

export function getPathIndex(path: string): number {
  return NAV_ORDER.indexOf(path as any);
}

// Configured list of primary items displayed directly on the mobile bottom tab bar
export const PRIMARY_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Digital Twin", icon: Cpu },
  { to: "/cluster-devices", label: "Devices", icon: Server },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/ai-insights", label: "AI Insights", icon: Sparkles },
  { to: "/approval-queue", label: "Approvals", icon: CheckSquare },
] as const;

// Configured list of secondary items displayed inside the 'More' drawer sheet
export const SECONDARY_NAV_ITEMS = [
  { to: "/manual-entry", label: "Manual Entry", icon: PencilLine },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/forecast", label: "Forecast", icon: LineChart },
  { to: "/carbon-cost", label: "Carbon & Cost", icon: Leaf },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/multi-signal", label: "Multi-Signal", icon: Activity },
  { to: "/admin", label: "Admin", icon: Shield, isAdminOnly: true },
] as const;
