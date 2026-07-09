import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Upload,
  Sparkles,
  IndianRupee,
  ArrowRight,
  Gauge,
  Cpu,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Energy Advisor — Cut Industrial Energy Waste" },
      {
        name: "description",
        content:
          "AI-powered industrial energy advisor. Identify idle machine power waste and get prioritized recommendations.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="liquid-glass-root min-h-screen relative bg-[#0A0D12] overflow-hidden flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#33D6A6]/5 blur-[160px] motion-safe:animate-pulse motion-safe:duration-[12000ms]" />
        <div className="absolute bottom-12 left-1/4 w-[600px] h-[600px] rounded-full bg-[#8C7EFF]/5 blur-[200px] motion-safe:animate-pulse motion-safe:duration-[18000ms]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0D12]/60 border-b border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/10">
              <img src="/favicon.png" alt="Energy Advisor" className="h-full w-full object-cover" />
            </div>
            <span className="font-display tracking-tight text-white font-bold">Energy Advisor</span>
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

      {/* Hero */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 lg:py-24 relative z-10 space-y-16">
        <section className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#33D6A6]/30 bg-[#33D6A6]/5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#33D6A6]">
              <Cpu className="h-3 w-3" /> GenAI Energy Advisor
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
              Idle machines are quietly{" "}
              <span className="text-[#33D6A6] relative inline-block">
                burning your margin.
              </span>
            </h1>
            <p className="text-sm md:text-base text-[#8D97A3] max-w-lg leading-relaxed font-body">
              Identify standby machine power waste. Upload your meter data, shift logs, and schedules to immediately generate prioritized, actionable optimization tasks.
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
                <a href="#capabilities">Explore Capabilities</a>
              </Button>
            </div>
          </div>

          {/* Animated Hero Glass Instrument Panel */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md glass-panel p-6 shadow-2xl relative overflow-hidden flow-seam md:rotate-[2deg] hover:rotate-0 transition-transform duration-500 cursor-pointer group">
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
                {/* SVG Active/Idle flow ring/waveform */}
                <svg className="w-full h-44 sm:h-56" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  <g className="stroke-white/5 stroke-[0.5] fill-none">
                    <line x1="0" y1="50" x2="400" y2="50" />
                    <line x1="0" y1="100" x2="400" y2="100" />
                    <line x1="0" y1="150" x2="400" y2="150" />
                    <line x1="100" y1="0" x2="100" y2="200" />
                    <line x1="200" y1="0" x2="200" y2="200" />
                    <line x1="300" y1="0" x2="300" y2="200" />
                  </g>

                  {/* Active flow waveform - Teal */}
                  <path
                    d="M 10,100 Q 50,20 90,100 T 170,100 T 250,100 T 330,100 T 390,100"
                    fill="none"
                    stroke="url(#activeTealGrad)"
                    strokeWidth="3.5"
                    className="motion-safe:animate-[dash_4s_linear_infinite]"
                    style={{
                      strokeDasharray: "15, 12",
                    }}
                  />
                  
                  {/* Idle flow waveform - Amber */}
                  <path
                    d="M 10,120 Q 50,180 90,120 T 170,120 T 250,120 T 330,120 T 390,120"
                    fill="none"
                    stroke="url(#idleAmberGrad)"
                    strokeWidth="2.5"
                    className="opacity-80 motion-safe:animate-[dash_8s_linear_infinite]"
                    style={{
                      strokeDasharray: "8, 15",
                    }}
                  />

                  {/* Glow effects */}
                  <path
                    d="M 10,100 Q 50,20 90,100 T 170,100 T 250,100 T 330,100 T 390,100"
                    fill="none"
                    stroke="#33D6A6"
                    strokeWidth="8"
                    className="opacity-10 blur-sm pointer-events-none"
                  />

                  <path
                    d="M 10,120 Q 50,180 90,120 T 170,120 T 250,120 T 330,120 T 390,120"
                    fill="none"
                    stroke="#F5A623"
                    strokeWidth="6"
                    className="opacity-10 blur-sm pointer-events-none"
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

                {/* Simulated readings overlay inside card */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-mono text-[#8D97A3] bg-[#0A0D12]/70 p-2.5 rounded border border-white/5 backdrop-blur-sm">
                  <div>ACTIVE DRAW: <span className="text-[#33D6A6] font-bold font-mono">142.8 kW</span></div>
                  <div>IDLE WASTE: <span className="text-[#F5A623] font-bold font-mono">34.3 kW</span></div>
                  <div>LEAKAGE: <span className="text-red-400 font-bold font-mono">24%</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Parallel Capabilities Cards */}
        <section id="capabilities" className="space-y-6 pt-8">
          <div className="text-left space-y-1">
            <h2 className="text-2xl font-bold font-display text-white tracking-tight">Capabilities</h2>
            <p className="text-sm text-[#8D97A3]">Parallel analysis engine layers working in harmony.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 space-y-4 flow-seam-interactive border border-white/5 hover:border-[#33D6A6]/20">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-[#33D6A6]">
                <Upload className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-white tracking-tight">Upload CSVs</h3>
              <p className="text-xs text-[#8D97A3] leading-relaxed font-body">
                Drop machine energy readings, factory shift logs, and production schedules directly into the interface without complex integration.
              </p>
            </div>

            <div className="glass-panel p-6 space-y-4 flow-seam-interactive border border-white/5 hover:border-[#33D6A6]/20">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-[#33D6A6]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-white tracking-tight">AI Finds Waste</h3>
              <p className="text-xs text-[#8D97A3] leading-relaxed font-body">
                Llama 3.3 models cross-reference data streams to pinpoint excessive standby power draw and flag non-operational leaks.
              </p>
            </div>

            <div className="glass-panel p-6 space-y-4 flow-seam-interactive border border-white/5 hover:border-[#33D6A6]/20">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-[#33D6A6]">
                <IndianRupee className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-white tracking-tight">Act on Savings</h3>
              <p className="text-xs text-[#8D97A3] leading-relaxed font-body">
                Receive prioritised recommendation lists mapped to monetary figures (₹), auto-execute low-risk actions, and download reports.
              </p>
            </div>
          </div>
        </section>

        {/* Real Live-feeling Metric Readout Strip */}
        <section className="glass-panel p-4 overflow-hidden border border-white/5 relative bg-white/[0.02]">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 text-center font-mono py-2 relative z-10">
            <div>
              <span className="text-[10px] text-[#8D97A3] block uppercase tracking-wider mb-1">METER READINGS DATA</span>
              <span className="text-xl md:text-2xl font-bold text-[#EDF1F5] font-mono">34.3k kWh</span>
              <span className="text-xs text-muted-foreground block font-mono">analyzed this month</span>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-white/10" />
            <div>
              <span className="text-[10px] text-[#8D97A3] block uppercase tracking-wider mb-1">STANDBY LOSS IDENTIFIED</span>
              <span className="text-xl md:text-2xl font-bold text-[#F5A623] font-mono">8.7k kWh</span>
              <span className="text-xs text-muted-foreground block font-mono">idle consumption found</span>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-white/10" />
            <div>
              <span className="text-[10px] text-[#8D97A3] block uppercase tracking-wider mb-1">RECOVERABLE OPERATING COST</span>
              <span className="text-xl md:text-2xl font-bold text-[#33D6A6] font-mono">₹69.6k</span>
              <span className="text-xs text-muted-foreground block font-mono">estimated monthly savings</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-[#8D97A3] bg-[#0A0D12] relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© Energy Advisor Control Panel. All rights reserved.</span>
          <div className="flex gap-4 text-[10px] uppercase tracking-wider font-mono">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
