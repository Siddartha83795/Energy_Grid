import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Upload,
  Sparkles,
  IndianRupee,
  ArrowRight,
  Gauge,
  Cpu,
  Trophy,
  Activity,
  ShieldCheck,
  LineChart,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Leaf,
  Layers,
  ChevronRight,
  Database,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GenAI Energy Advisor — Cut Industrial Energy Waste" },
      {
        name: "description",
        content:
          "AI-powered industrial energy advisor. Identify idle machine power waste, cross-validate multi-signal sensors, and execute role-specific optimization plans.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai" | "multisignal">("dashboard");

  return (
    <div className="liquid-glass-root min-h-screen relative bg-[#0A0D12] overflow-hidden flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#33D6A6]/5 blur-[160px] motion-safe:animate-pulse motion-safe:duration-[12000ms]" />
        <div className="absolute bottom-12 left-1/4 w-[700px] h-[700px] rounded-full bg-[#8C7EFF]/5 blur-[200px] motion-safe:animate-pulse motion-safe:duration-[18000ms]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0D12]/70 border-b border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/10">
              <img src="/favicon.png" alt="Energy Advisor" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-display tracking-tight text-white font-bold leading-none">
                Energy Advisor
              </span>
              <span className="text-[9px] font-mono text-[#33D6A6] mt-0.5">
                GENAI OPERATIONAL INTEL
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Button
              asChild
              variant="glassSecondary"
              size="sm"
              className="text-[#8D97A3] hover:text-white cursor-pointer"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button
              asChild
              variant="glass"
              size="sm"
              className="text-[#0A0D12] font-bold px-4 py-2 cursor-pointer transition-all"
            >
              <Link to="/auth">
                Get Started <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero & Product Tour */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 lg:py-16 relative z-10 space-y-20">
        {/* HERO SECTION */}
        <section className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#33D6A6]/30 bg-[#33D6A6]/5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#33D6A6]">
              <Cpu className="h-3 w-3" /> GenAI Energy Advisor
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
              Idle machines are quietly{" "}
              <span className="text-[#33D6A6] relative inline-block">burning your margin.</span>
            </h1>
            <p className="text-sm md:text-base text-[#8D97A3] max-w-lg leading-relaxed font-body">
              Identify standby machine power waste. Upload your meter data, shift logs, and
              schedules to immediately generate prioritized, actionable optimization tasks.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                variant="glass"
                className="w-full sm:w-auto font-bold font-display cursor-pointer transition-colors duration-200"
              >
                <Link to="/auth">
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="glassSecondary"
                className="w-full sm:w-auto font-semibold font-display cursor-pointer transition-all"
              >
                <a href="#tour">Explore Product Tour</a>
              </Button>
            </div>
          </div>

          {/* Hero Instrument Panel */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md glass-panel p-6 shadow-2xl relative overflow-hidden flow-seam md:rotate-[1deg] hover:rotate-0 transition-transform duration-500 cursor-pointer group">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#33D6A6] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#33D6A6] animate-ping" />
                  Live Power Stream
                </span>
                <span className="text-[9px] font-mono text-[#8D97A3]">
                  IDLE DRAW RESOLUTION ENGINE
                </span>
              </div>
              <div className="relative">
                <svg className="w-full h-44 sm:h-52" viewBox="0 0 400 200">
                  <g className="stroke-white/5 stroke-[0.5] fill-none">
                    <line x1="0" y1="50" x2="400" y2="50" />
                    <line x1="0" y1="100" x2="400" y2="100" />
                    <line x1="0" y1="150" x2="400" y2="150" />
                    <line x1="100" y1="0" x2="100" y2="200" />
                    <line x1="200" y1="0" x2="200" y2="200" />
                    <line x1="300" y1="0" x2="300" y2="200" />
                  </g>
                  <path
                    d="M 10,100 Q 50,20 90,100 T 170,100 T 250,100 T 330,100 T 390,100"
                    fill="none"
                    stroke="url(#activeTealGrad)"
                    strokeWidth="3.5"
                    className="motion-safe:animate-[dash_4s_linear_infinite]"
                    style={{ strokeDasharray: "15, 12" }}
                  />
                  <path
                    d="M 10,120 Q 50,180 90,120 T 170,120 T 250,120 T 330,120 T 390,120"
                    fill="none"
                    stroke="url(#idleAmberGrad)"
                    strokeWidth="2.5"
                    className="opacity-80 motion-safe:animate-[dash_8s_linear_infinite]"
                    style={{ strokeDasharray: "8, 15" }}
                  />
                  <defs>
                    <linearGradient id="activeTealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#33D6A6" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#33D6A6" stopOpacity="1" />
                      <stop offset="100%" stopColor="#33D6A6" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="idleAmberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F5A623" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#F5A623" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#F5A623" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-mono text-[#8D97A3] bg-[#0A0D12]/70 p-2.5 rounded border border-white/5 backdrop-blur-sm">
                  <div>
                    ACTIVE DRAW:{" "}
                    <span className="text-[#33D6A6] font-bold font-mono">142.8 kW</span>
                  </div>
                  <div>
                    IDLE WASTE: <span className="text-[#F5A623] font-bold font-mono">34.3 kW</span>
                  </div>
                  <div>
                    LEAKAGE: <span className="text-red-400 font-bold font-mono">24%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PART 1.1 — LIVE-FEELING STAT STRIP */}
        <section className="glass-panel p-6 border border-white/10 relative overflow-hidden bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#33D6A6] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#33D6A6] animate-pulse" />
              Pilot Dataset Aggregate Metrics
            </span>
            <span className="text-[10px] font-mono text-[#8D97A3]">REAL DEMO DATA (PILOT RUN)</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center font-mono">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8D97A3] block uppercase tracking-wider">
                MACHINES MONITORED
              </span>
              <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono">12</div>
              <span className="text-[11px] text-muted-foreground block font-sans">
                Active shopfloor units
              </span>
            </div>
            <div className="space-y-1 border-l border-white/5 pl-4 sm:pl-0">
              <span className="text-[10px] text-[#8D97A3] block uppercase tracking-wider">
                IDLE WASTE IDENTIFIED
              </span>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#F5A623] font-mono">
                8,740 <span className="text-xs text-[#F5A623]/70 font-normal">kWh</span>
              </div>
              <span className="text-[11px] text-muted-foreground block font-sans">
                Standby power draw
              </span>
            </div>
            <div className="space-y-1 border-l border-white/5 pl-4 sm:pl-0">
              <span className="text-[10px] text-[#8D97A3] block uppercase tracking-wider">
                RECOMMENDATIONS GENERATED
              </span>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#38BDF8] font-mono">
                24 <span className="text-xs text-[#38BDF8]/70 font-normal">plans</span>
              </div>
              <span className="text-[11px] text-muted-foreground block font-sans">
                Groq Llama 3.3 cited
              </span>
            </div>
            <div className="space-y-1 border-l border-white/5 pl-4 sm:pl-0">
              <span className="text-[10px] text-[#8D97A3] block uppercase tracking-wider">
                CO2e TRACKED
              </span>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#33D6A6] font-mono">
                7,166 <span className="text-xs text-[#33D6A6]/70 font-normal">kg</span>
              </div>
              <span className="text-[11px] text-muted-foreground block font-sans">
                Carbon reduction target
              </span>
            </div>
          </div>
        </section>

        {/* PART 1.2 — MODULE EXPLAINER GRID */}
        <section id="tour" className="space-y-6 pt-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#33D6A6]">
              CORE ARCHITECTURE
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">
              Every Core Module Explained
            </h2>
            <p className="text-sm text-[#8D97A3]">
              GenAI Energy Advisor is engineered explicitly for industrial standby waste detection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 space-y-4 flow-seam-interactive border border-white/5 hover:border-[#33D6A6]/30 transition-all">
              <div className="h-10 w-10 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center text-[#F5A623]">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white tracking-tight">
                  Idle Detection & Analytics
                </h3>
                <p className="text-xs text-[#8D97A3] leading-relaxed mt-2 font-body">
                  ML-based per-machine idle waste detection that cross-references electrical meter
                  telemetry, factory shift schedules, and production logs.
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-4 flow-seam-interactive border border-white/5 hover:border-[#38BDF8]/30 transition-all">
              <div className="h-10 w-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white tracking-tight">
                  GenAI Recommendations
                </h3>
                <p className="text-xs text-[#8D97A3] leading-relaxed mt-2 font-body">
                  Groq Llama 3.3-generated, evidence-cited action plans tailored for shopfloor
                  operators, plant engineers, and energy managers.
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-4 flow-seam-interactive border border-white/5 hover:border-[#8C7EFF]/30 transition-all">
              <div className="h-10 w-10 rounded-xl bg-[#8C7EFF]/10 border border-[#8C7EFF]/20 flex items-center justify-center text-[#8C7EFF]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white tracking-tight">
                  Multi-Signal Verification
                </h3>
                <p className="text-xs text-[#8D97A3] leading-relaxed mt-2 font-body">
                  Cross-validates electrical draw with vibration, acoustic, and environmental
                  sensors to confirm true un-productive idle waste vs. a mechanical fault.
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-4 flow-seam-interactive border border-white/5 hover:border-[#33D6A6]/30 transition-all">
              <div className="h-10 w-10 rounded-xl bg-[#33D6A6]/10 border border-[#33D6A6]/20 flex items-center justify-center text-[#33D6A6]">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white tracking-tight">
                  Carbon & Cost Accounting
                </h3>
                <p className="text-xs text-[#8D97A3] leading-relaxed mt-2 font-body">
                  Tariff-aware, solar-aware savings calculations tracked in both monetary currency
                  (₹) and equivalent carbon emissions (kg CO2e).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PART 1.3 — SCREENSHOT / UI SHOWCASE */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#33D6A6]">
                INTERFACE PREVIEW
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight mt-1">
                Explore the Real Application
              </h2>
              <p className="text-sm text-[#8D97A3]">
                Preview actual workspace screens before signing in.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-[#33D6A6] text-[#0A0D12] font-bold"
                    : "text-[#8D97A3] hover:text-white"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-[#33D6A6] text-[#0A0D12] font-bold"
                    : "text-[#8D97A3] hover:text-white"
                }`}
              >
                AI Insights
              </button>
              <button
                onClick={() => setActiveTab("multisignal")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === "multisignal"
                    ? "bg-[#33D6A6] text-[#0A0D12] font-bold"
                    : "text-[#8D97A3] hover:text-white"
                }`}
              >
                Multi-Signal Check
              </button>
            </div>
          </div>

          {/* Interactive UI Mockup Window */}
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Window Header bar */}
            <div className="bg-[#0D121B] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-[#8D97A3]">
                  app.energyadvisor.io/{activeTab}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#33D6A6] bg-[#33D6A6]/10 px-2 py-0.5 rounded border border-[#33D6A6]/20">
                LIVE DEMO STATE
              </span>
            </div>

            {/* TAB CONTENT 1: DASHBOARD MOCKUP */}
            {activeTab === "dashboard" && (
              <div className="p-6 space-y-6 bg-[#0A0D12]">
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-panel p-4 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#8D97A3]">TOTAL CONSUMPTION</span>
                    <div className="text-xl font-bold text-white font-mono">34,310 kWh</div>
                    <span className="text-[10px] text-[#33D6A6]">Baseline tracked</span>
                  </div>
                  <div className="glass-panel p-4 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#8D97A3]">IDLE CONSUMPTION</span>
                    <div className="text-xl font-bold text-[#F5A623] font-mono">8,740 kWh</div>
                    <span className="text-[10px] text-[#F5A623]">25.5% standby waste</span>
                  </div>
                  <div className="glass-panel p-4 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#8D97A3]">RECOVERABLE COST</span>
                    <div className="text-xl font-bold text-[#33D6A6] font-mono">₹69,920</div>
                    <span className="text-[10px] text-[#33D6A6]">Estimated monthly savings</span>
                  </div>
                </div>

                <div className="glass-panel p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#8D97A3]">MACHINE POWER DRAW COMPARISON</span>
                    <span className="text-[#33D6A6]">CNC_Lathe_01 vs Compressor_A</span>
                  </div>
                  <div className="h-28 flex items-end gap-3 pt-2">
                    <div className="flex-1 space-y-1">
                      <div className="h-20 bg-gradient-to-t from-[#33D6A6]/20 to-[#33D6A6] rounded-t" />
                      <span className="text-[10px] font-mono text-[#8D97A3] block text-center">
                        CNC_Lathe_01 (Active)
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-16 bg-gradient-to-t from-[#F5A623]/20 to-[#F5A623] rounded-t" />
                      <span className="text-[10px] font-mono text-[#8D97A3] block text-center">
                        Compressor_A (Idle 42%)
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-12 bg-gradient-to-t from-[#38BDF8]/20 to-[#38BDF8] rounded-t" />
                      <span className="text-[10px] font-mono text-[#8D97A3] block text-center">
                        Hydraulic_Press_3
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-[#8D97A3] italic font-sans">
                  Caption: Executive Dashboard view showing total vs idle consumption breakdown and
                  top waste offenders.
                </p>
              </div>
            )}

            {/* TAB CONTENT 2: AI INSIGHTS MOCKUP */}
            {activeTab === "ai" && (
              <div className="p-6 space-y-4 bg-[#0A0D12]">
                <div className="glass-panel p-4 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        Diagnose Agent
                      </span>
                      #1 · Compressor_A Standby Leakage
                    </span>
                    <span className="text-xs font-mono text-[#33D6A6]">94% Confidence</span>
                  </div>
                  <p className="text-xs text-[#8D97A3] leading-relaxed font-body">
                    <strong>Issue:</strong> Continuous 14.2 kW power draw during third shift when
                    zero output is logged in production schedules.
                  </p>
                  <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 text-[11px] font-mono text-amber-400">
                    🔍 Cited Evidence: Meter telemetry shows 112 kWh consumed between 02:00–06:00 AM
                    while shift log indicates line shutdown.
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-[#33D6A6] font-mono font-bold">
                      Action: Program auto-shutdown routine
                    </span>
                    <span className="text-[#F5A623] font-mono font-bold">
                      Est. Savings: ₹28,400 / mo
                    </span>
                  </div>
                </div>
                <p className="text-xs text-center text-[#8D97A3] italic font-sans">
                  Caption: AI Insights view displaying Groq Llama 3.3 ranked recommendations with
                  cited evidence data points.
                </p>
              </div>
            )}

            {/* TAB CONTENT 3: MULTI-SIGNAL CHECK MOCKUP */}
            {activeTab === "multisignal" && (
              <div className="p-6 space-y-4 bg-[#0A0D12]">
                <div className="grid grid-cols-4 gap-3 text-center font-mono">
                  <div className="p-3 glass-panel border border-emerald-500/30 text-emerald-400">
                    <span className="text-[9px] block text-white/60">ELECTRICAL</span>
                    <span className="text-sm font-bold">18.4 kW (High)</span>
                  </div>
                  <div className="p-3 glass-panel border border-emerald-500/30 text-emerald-400">
                    <span className="text-[9px] block text-white/60">VIBRATION</span>
                    <span className="text-sm font-bold">0.4 mm/s (Low)</span>
                  </div>
                  <div className="p-3 glass-panel border border-emerald-500/30 text-emerald-400">
                    <span className="text-[9px] block text-white/60">ACOUSTIC</span>
                    <span className="text-sm font-bold">42 dB (Silent)</span>
                  </div>
                  <div className="p-3 glass-panel border border-amber-500/30 text-amber-400">
                    <span className="text-[9px] block text-white/60">VERDICT</span>
                    <span className="text-sm font-bold">True Idle Waste</span>
                  </div>
                </div>
                <div className="p-3 rounded bg-[#33D6A6]/10 border border-[#33D6A6]/20 text-xs text-[#33D6A6] font-mono">
                  ✓ Verified: Machine is consuming active electrical power with negligible
                  mechanical vibration/sound, ruling out bearing fault or production load.
                </div>
                <p className="text-xs text-center text-[#8D97A3] italic font-sans">
                  Caption: Multi-Signal Verification matrix cross-validating telemetry streams to
                  confirm true un-productive waste.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* PART 1.4 — END-TO-END FLOW STRIP */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#33D6A6]">
              WORKFLOW OPERATIONAL PIPELINE
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">
              End-to-End Waste Elimination Flow
            </h2>
            <p className="text-sm text-[#8D97A3]">
              From raw telemetry ingestion to verified monetary savings tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
            <div className="glass-panel p-4 border border-white/5 hover:border-[#33D6A6]/30 transition-all text-center space-y-2 relative">
              <span className="text-xs font-mono font-bold text-[#33D6A6] bg-[#33D6A6]/10 h-6 w-6 rounded-full inline-flex items-center justify-center border border-[#33D6A6]/20">
                1
              </span>
              <h4 className="text-sm font-bold text-white font-display">Ingest</h4>
              <p className="text-[11px] text-[#8D97A3] font-body leading-tight">
                Meter CSVs, shift schedules, & sensor data.
              </p>
            </div>

            <div className="glass-panel p-4 border border-white/5 hover:border-[#33D6A6]/30 transition-all text-center space-y-2 relative">
              <span className="text-xs font-mono font-bold text-[#F5A623] bg-[#F5A623]/10 h-6 w-6 rounded-full inline-flex items-center justify-center border border-[#F5A623]/20">
                2
              </span>
              <h4 className="text-sm font-bold text-white font-display">Detect</h4>
              <p className="text-[11px] text-[#8D97A3] font-body leading-tight">
                ML identifies per-machine standby draw.
              </p>
            </div>

            <div className="glass-panel p-4 border border-white/5 hover:border-[#38BDF8]/30 transition-all text-center space-y-2 relative">
              <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#38BDF8]/10 h-6 w-6 rounded-full inline-flex items-center justify-center border border-[#38BDF8]/20">
                3
              </span>
              <h4 className="text-sm font-bold text-white font-display">Recommend</h4>
              <p className="text-[11px] text-[#8D97A3] font-body leading-tight">
                Groq Llama 3.3 synthesizes evidence plans.
              </p>
            </div>

            <div className="glass-panel p-4 border border-white/5 hover:border-[#8C7EFF]/30 transition-all text-center space-y-2 relative">
              <span className="text-xs font-mono font-bold text-[#8C7EFF] bg-[#8C7EFF]/10 h-6 w-6 rounded-full inline-flex items-center justify-center border border-[#8C7EFF]/20">
                4
              </span>
              <h4 className="text-sm font-bold text-white font-display">Approve</h4>
              <p className="text-[11px] text-[#8D97A3] font-body leading-tight">
                Action Queue gates high-impact fixes.
              </p>
            </div>

            <div className="glass-panel p-4 border border-white/5 hover:border-[#33D6A6]/30 transition-all text-center space-y-2 relative">
              <span className="text-xs font-mono font-bold text-[#33D6A6] bg-[#33D6A6]/10 h-6 w-6 rounded-full inline-flex items-center justify-center border border-[#33D6A6]/20">
                5
              </span>
              <h4 className="text-sm font-bold text-white font-display">Track</h4>
              <p className="text-[11px] text-[#8D97A3] font-body leading-tight">
                Carbon kg & tariff savings logged in real time.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-[#8D97A3] bg-[#0A0D12] relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© GenAI Energy Advisor. All rights reserved.</span>
          <div className="flex gap-4 text-[10px] uppercase tracking-wider font-mono">
            <a href="#" className="hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-white transition-colors">
              API
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
