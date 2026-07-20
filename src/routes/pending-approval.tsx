import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, ShieldAlert, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/pending-approval")({
  head: () => ({ meta: [{ title: "Pending Approval — Energy Advisor" }] }),
  component: PendingApprovalPage,
});

function PendingApprovalPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="liquid-glass-root min-h-screen flex items-center justify-center p-4 bg-[#0A0D12] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-[#F5A623]/10 blur-[150px] motion-safe:animate-pulse" />
      </div>

      <div className="w-full max-w-md glass-panel p-8 text-center space-y-6 relative z-10 flow-seam border border-white/10 shadow-2xl">
        <div className="h-14 w-14 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center mx-auto text-[#F5A623]">
          <Clock className="h-7 w-7 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#F5A623] uppercase tracking-wider">
            <ShieldAlert className="h-3 w-3" /> Account Restricted
          </span>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Role Approval Pending
          </h1>
          <p className="text-xs text-[#8D97A3] leading-relaxed font-body max-w-sm mx-auto">
            Your Google account (
            <strong className="text-white">{user?.email || "authenticated user"}</strong>) has been
            created with viewer privileges. An administrator must approve your role to grant
            operational control room access.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-left text-xs font-mono space-y-1 text-[#8D97A3]">
          <div className="flex justify-between">
            <span>Auth Provider:</span>
            <span className="text-[#38BDF8] font-bold">Google OAuth2</span>
          </div>
          <div className="flex justify-between">
            <span>Current Privilege:</span>
            <span className="text-[#F5A623] font-bold">
              {user?.role?.toUpperCase() || "VIEWER"}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button
            onClick={() => navigate({ to: "/dashboard" })}
            variant="glassSecondary"
            className="w-full text-xs font-medium cursor-pointer"
          >
            Explore Read-Only Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
