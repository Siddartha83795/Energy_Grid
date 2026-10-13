import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Activity,
  Cpu,
  Zap,
  Check,
  ShieldCheck,
  TrendingDown,
  Clock,
  Sparkles,
  Waves,
  Sliders,
  ExternalLink,
  Layers,
  FileText,
  BarChart3,
} from "lucide-react";
import { AntiGravityEnergyDashboard } from "@/components/AntiGravityEnergyDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GenAI Energy Advisor // Anti-Gravity Industrial Telemetry" },
      {
        name: "description",
        content:
          "Autonomous Industrial Energy Intelligence & Standby Telemetry. Pure light Anti-Gravity GlassoNeumorphic interface for real-time voltage, current, and load optimization.",
      },
    ],
  }),
  component: Landing,
});

type CopyVariation = "roi" | "telemetry" | "autonomous";

export function Landing() {
  const [copyVar, setCopyVar] = useState<CopyVariation>("roi");
  const [activeTab, setActiveTab] = useState<"live-matrix" | "ai-synthesis" | "verification">("live-matrix");

  const copyData: Record<
    CopyVariation,
    {
      label: string;
      headline: string;
      subheadline: string;
      cta: string;
      secondaryCta: string;
      targetAudience: string;
      coreBenefit: string;
    }
  > = {
    roi: {
      label: "VARIATION 01 // DIRECT ROI & FINANCIAL",
      headline: "Stop paying for machines that are running on empty.",
      subheadline:
        "Industrial plants bleed up to 28% of their power bill during non-productive standby cycles. Energy Advisor continuously intercepts idle draw, correlates shift logs, and guarantees verified electrical cost recovery.",
      cta: "Audit Your Facility Now",
      secondaryCta: "Explore Telemetry Matrix",
      targetAudience: "Operations Directors & CFOs at Continuous-Process Manufacturing Plants",
      coreBenefit: "Direct bottom-line margin recovery with zero capital equipment overhaul",
    },
    telemetry: {
      label: "VARIATION 02 // MULTI-SIGNAL SENSOR RIGOR",
      headline: "Raw multi-signal telemetry. Zero phantom idle drain.",
      subheadline:
        "Cross-correlate high-frequency electrical meters with vibration, acoustic, and SCADA shift records. Differentiate mechanical anomalies from actual productive load with auditable sensor mathematics.",
      cta: "Ingest Sensor Streams",
      secondaryCta: "Inspect Sensor Matrix",
      targetAudience: "Lead Electrical Engineers, Plant Reliability Teams & SCADA Architects",
      coreBenefit: "Definitive multi-modal proof eliminating false alarms and motor diagnostics errors",
    },
    autonomous: {
      label: "VARIATION 03 // AUTONOMOUS AGENT ORCHESTRATION",
      headline: "Autonomous energy intelligence for the modern factory floor.",
      subheadline:
        "Synthesize plant-wide energy telemetry into auditable shutdown schedules and Groq-powered engineering work orders. Gated by engineer approvals, verified down to the kilowatt-hour.",
      cta: "Deploy Operational Agent",
      secondaryCta: "View Agent Pipeline",
      targetAudience: "Manufacturing Executives & Sustainability Operations Directors",
      coreBenefit: "Self-governing, auditable operational action queues executing shutdown routines",
    },
  };

  const currentCopy = copyData[copyVar];

  return (
    <div className="min-h-screen text-[#1E293B] font-sans selection:bg-blue-500/20 selection:text-blue-900 pb-20">
      {/* Top Floating Glass Navigation Bar */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="glass-neumorph px-5 sm:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                Energy Advisor
              </span>
              <span className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mt-1">
                Anti-Gravity Telemetry
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/antigravity"
              className="glass-neumorph-btn px-3.5 py-2 text-xs font-semibold text-slate-700 hidden sm:inline-flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Live Telemetry
            </Link>
            <Link
              to="/neumorphic"
              className="glass-neumorph-btn px-3 py-2 text-xs font-semibold text-slate-700 hidden md:inline-flex"
            >
              Soft UI View
            </Link>
            <Link
              to="/dashboard"
              className="glass-neumorph-btn px-3.5 py-2 text-xs font-semibold text-slate-700"
            >
              Dashboard
            </Link>
            <Link
              to="/auth"
              className="glass-neumorph-btn-primary px-4 sm:px-5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              Sign In <ArrowRight className="h-3 w-3" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-16">
        {/* Above-The-Fold Copy Experiment Controls */}
        <section className="glass-neumorph p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              CRO Copy Variation Control:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["roi", "telemetry", "autonomous"] as CopyVariation[]).map((key) => (
              <button
                key={key}
                onClick={() => setCopyVar(key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  copyVar === key
                    ? "glass-neumorph-btn-primary shadow-md"
                    : "glass-neumorph-btn text-slate-600 hover:text-slate-900"
                }`}
              >
                {key === "roi" && "01. Direct ROI"}
                {key === "telemetry" && "02. Multi-Signal Rigor"}
                {key === "autonomous" && "03. Autonomous Agent"}
              </button>
            ))}
          </div>
        </section>

        {/* Hero Section: Editorial Weightless Showcase */}
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/60 border border-white/80 shadow-xs text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              {currentCopy.label}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
              {currentCopy.headline}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
              {currentCopy.subheadline}
            </p>

            {/* Target Audience & Core Benefit Card */}
            <div className="glass-neumorph p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200/80 text-slate-800 uppercase tracking-wide">
                  Target
                </span>
                <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                  {currentCopy.targetAudience}
                </span>
              </div>
              <div className="flex items-start gap-3 pt-2.5 border-t border-slate-200/60">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100/80 text-blue-800 uppercase tracking-wide">
                  Outcome
                </span>
                <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                  {currentCopy.coreBenefit}
                </span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/auth"
                className="glass-neumorph-btn-primary px-8 py-3.5 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg"
              >
                {currentCopy.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#live-dashboard-section"
                className="glass-neumorph-btn px-7 py-3.5 text-sm font-semibold text-slate-700 text-center hover:text-blue-600"
              >
                {currentCopy.secondaryCta}
              </a>
            </div>

            {/* Micro Metric Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="glass-neumorph p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Avg Savings
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
                  28.4%
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Verified kWh</span>
              </div>
              <div className="glass-neumorph p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  False Alerts
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5 block">
                  0.0%
                </span>
                <span className="text-[10px] text-slate-600 font-medium">3-Signal Gate</span>
              </div>
              <div className="glass-neumorph p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Payback
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
                  &lt; 14 Days
                </span>
                <span className="text-[10px] text-indigo-600 font-bold">Rapid ROI</span>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Floating Live Telemetry Snippet (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="glass-neumorph p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800 text-sm">
                    Live Feeder Telemetry // L1-L2-L3
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  50.02 Hz
                </span>
              </div>

              {/* 3-Phase Meter Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-neumorph-sunken p-3 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Phase L1</span>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">230.4 V</div>
                  <div className="text-xs text-blue-600 font-medium">48.2 A</div>
                </div>
                <div className="glass-neumorph-sunken p-3 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Phase L2</span>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">229.8 V</div>
                  <div className="text-xs text-indigo-600 font-medium">46.8 A</div>
                </div>
                <div className="glass-neumorph-sunken p-3 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Phase L3</span>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">231.1 V</div>
                  <div className="text-xs text-purple-600 font-medium">47.9 A</div>
                </div>
              </div>

              {/* Mini Oscilloscope Wave */}
              <div className="p-3 glass-neumorph-sunken rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Waveform Symmetry (THD 1.1%)</span>
                  <span className="text-emerald-600 font-bold">Synchronized</span>
                </div>
                <svg className="w-full h-16" viewBox="0 0 300 60">
                  <path
                    d="M 0 30 Q 37.5 5, 75 30 T 150 30 T 225 30 T 300 30"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 0 30 Q 37.5 15, 75 30 T 150 30 T 225 30 T 300 30"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    transform="translate(8, 0)"
                  />
                </svg>
              </div>

              {/* Intercept Highlight */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">
                    Phantom Standby Intercepted
                  </span>
                  <span className="text-[11px] text-blue-700">
                    Auto-decoupled 4 idle assembly motors
                  </span>
                </div>
                <span className="text-sm font-black text-blue-700 bg-white/80 px-2.5 py-1 rounded-lg shadow-xs">
                  -14.8 kW
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Live Anti-Gravity Energy Dashboard Component Section */}
        <section id="live-dashboard-section" className="space-y-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50/80 px-3 py-1 rounded-full border border-blue-200/50">
                Interactive Showcase
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                Live Anti-Gravity Energy & Voltage Console
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
                Experience the weightless GlassoNeumorphic interface in action with real-time 3-phase
                telemetry, interactive frequency waveforms, and tactile soft UI toggles.
              </p>
            </div>

            <Link
              to="/antigravity"
              className="glass-neumorph-btn px-4 py-2.5 text-xs font-semibold text-slate-700 self-start md:self-auto flex items-center gap-2"
            >
              Open Fullscreen Matrix <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            </Link>
          </div>

          {/* Embedded Full Dashboard Component */}
          <AntiGravityEnergyDashboard />
        </section>

        {/* 5-Step Elimination Pipeline */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/50">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Five-Stage Standby Elimination
            </h2>
            <p className="text-sm text-slate-600">
              From raw sensor ingestion to guaranteed financial payback on your industrial tariff ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="glass-neumorph p-5 space-y-2.5 hover:-translate-y-1 transition-transform">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shadow-xs">
                01
              </span>
              <h4 className="font-bold text-slate-900 text-base">Ingest</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sub-minute smart meter CSVs, Modbus TCP feeds, and SCADA production logs.
              </p>
            </div>

            <div className="glass-neumorph p-5 space-y-2.5 hover:-translate-y-1 transition-transform">
              <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shadow-xs">
                02
              </span>
              <h4 className="font-bold text-slate-900 text-base">Detect</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic baseline profiling isolates idle standby watts from real workloads.
              </p>
            </div>

            <div className="glass-neumorph p-5 space-y-2.5 hover:-translate-y-1 transition-transform">
              <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shadow-xs">
                03
              </span>
              <h4 className="font-bold text-slate-900 text-base">Synthesize</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Groq AI compiles role-tailored optimization work orders for electrical teams.
              </p>
            </div>

            <div className="glass-neumorph p-5 space-y-2.5 hover:-translate-y-1 transition-transform">
              <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center shadow-xs">
                04
              </span>
              <h4 className="font-bold text-slate-900 text-base">Govern</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plant managers verify and sanction shutdown triggers before execution.
              </p>
            </div>

            <div className="glass-neumorph p-5 space-y-2.5 hover:-translate-y-1 transition-transform bg-blue-50/40 border-blue-200/60">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                05
              </span>
              <h4 className="font-bold text-slate-900 text-base">Recover</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tariff currency savings and CO2e mass reduction logged in immutable ledger.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="glass-neumorph p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-white/90">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
              Zero Hardware Deployment
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Ready to recover wasted industrial electrical capacity?
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Start auditing standby draw within 5 minutes. Upload your meter telemetry or connect live sensors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/auth"
              className="glass-neumorph-btn-primary px-8 py-3.5 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/upload"
              className="glass-neumorph-btn px-6 py-3.5 text-sm font-semibold text-slate-700 text-center hover:text-blue-600"
            >
              Upload Sample CSV
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
            EA
          </div>
          <span className="font-semibold text-slate-700">
            GenAI Energy Advisor // Anti-Gravity Architecture
          </span>
        </div>
        <div className="flex items-center gap-6 font-medium">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link to="/antigravity" className="hover:text-blue-600">
            Anti-Gravity Matrix
          </Link>
          <Link to="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/upload" className="hover:text-blue-600">
            Upload
          </Link>
          <Link to="/auth" className="hover:text-blue-600">
            Sign In
          </Link>
          <span>© 2026 Energy Advisor</span>
        </div>
      </footer>
    </div>
  );
}
