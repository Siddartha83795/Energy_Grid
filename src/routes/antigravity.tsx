import { createFileRoute, Link } from "@tanstack/react-router";
import { AntiGravityEnergyDashboard } from "@/components/AntiGravityEnergyDashboard";
import { ArrowLeft, Home, Zap } from "lucide-react";

export const Route = createFileRoute("/antigravity")({
  head: () => ({
    meta: [
      { title: "Anti-Gravity Energy Matrix // Current & Voltage Telemetry" },
      {
        name: "description",
        content:
          "High-precision 3-phase current, voltage waveforms, and weightless GlassoNeumorphic industrial dashboard.",
      },
    ],
  }),
  component: AntiGravityPage,
});

function AntiGravityPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb / Nav */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/"
          className="glass-neumorph-btn px-4 py-2 text-xs font-semibold text-slate-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/neumorphic"
            className="glass-neumorph-btn px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Soft UI View
          </Link>
          <Link to="/auth" className="glass-neumorph-btn-primary px-4 py-2 text-xs font-semibold">
            Access Industrial Console
          </Link>
        </div>
      </div>

      {/* Main Dashboard Component */}
      <AntiGravityEnergyDashboard />
    </div>
  );
}
