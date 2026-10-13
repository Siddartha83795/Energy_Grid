import { useState, useEffect } from "react";
import {
  Zap,
  Activity,
  Gauge,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  TrendingDown,
  Cpu,
  Power,
  Waves,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function AntiGravityEnergyDashboard() {
  // Live fluctuating telemetry state
  const [telemetry, setTelemetry] = useState({
    v1: 230.4,
    v2: 229.8,
    v3: 231.1,
    i1: 48.2,
    i2: 46.8,
    i3: 47.9,
    freq: 50.02,
    powerFactor: 0.984,
    activePower: 98.4,
    standbyLoss: 1.2,
  });

  // Interactive toggle states
  const [driftStabilizer, setDriftStabilizer] = useState(true);
  const [harmonicFilter, setHarmonicFilter] = useState(true);
  const [autoIdleDecouple, setAutoIdleDecouple] = useState(true);
  const [activeTimebase, setActiveTimebase] = useState<"10ms" | "20ms" | "50ms">("20ms");
  const [selectedPhase, setSelectedPhase] = useState<"all" | "L1" | "L2" | "L3">("all");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);

  // Small realistic live oscillation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        v1: +(230.0 + (Math.random() * 0.8 - 0.4)).toFixed(1),
        v2: +(229.7 + (Math.random() * 0.7 - 0.3)).toFixed(1),
        v3: +(230.9 + (Math.random() * 0.6 - 0.3)).toFixed(1),
        i1: +(48.0 + (Math.random() * 0.6 - 0.3)).toFixed(1),
        i2: +(46.7 + (Math.random() * 0.5 - 0.25)).toFixed(1),
        i3: +(47.8 + (Math.random() * 0.5 - 0.25)).toFixed(1),
        freq: +(50.0 + (Math.random() * 0.04 - 0.02)).toFixed(2),
        powerFactor: +(0.982 + Math.random() * 0.005).toFixed(3),
        activePower: +(98.2 + (Math.random() * 0.6 - 0.3)).toFixed(1),
        standbyLoss: +(1.2 + (Math.random() * 0.1 - 0.05)).toFixed(2),
      }));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setCalibrationSuccess(false);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrationSuccess(true);
      setTimeout(() => setCalibrationSuccess(false), 3000);
    }, 1200);
  };

  const totalCurrent = (telemetry.i1 + telemetry.i2 + telemetry.i3).toFixed(1);
  const avgVoltage = ((telemetry.v1 + telemetry.v2 + telemetry.v3) / 3).toFixed(1);

  return (
    <div className="w-full relative z-10 space-y-8 font-sans">
      {/* Top Header Floating Card */}
      <div className="glass-neumorph p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50/80 text-blue-700 border border-blue-200/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
              Weightless Telemetry Engine
            </span>
            <span className="text-xs font-medium text-slate-500 bg-white/60 px-3 py-1 rounded-full border border-white/80 shadow-xs">
              IEC-61000-4-30 Class A
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Anti-Gravity Energy & Voltage Matrix
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Floating 3-phase current, high-voltage telemetry, and autonomous standby decoupling.
            Engineered with hybrid GlassoNeumorphic depth for industrial control rooms.
          </p>
        </div>

        {/* Global Action Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleCalibrate}
            disabled={isCalibrating}
            className="glass-neumorph-btn px-4 py-2.5 text-sm font-semibold text-slate-800 flex items-center gap-2 hover:text-blue-600 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isCalibrating ? "animate-spin text-blue-600" : ""}`} />
            {isCalibrating ? "Calibrating..." : "Calibrate Sensors"}
          </button>
          <button className="glass-neumorph-btn-primary px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-md">
            <Sparkles className="w-4 h-4" />
            Optimize Grid Load
          </button>
        </div>
      </div>

      {calibrationSuccess && (
        <div className="glass-neumorph px-4 py-3 border-emerald-300/70 bg-emerald-50/50 flex items-center gap-2.5 text-emerald-800 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Multi-phase current transformers recalibrated with ±0.02% measurement uncertainty.
        </div>
      )}

      {/* Main KPI Hero Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: 3-Phase Voltage */}
        <div className="glass-neumorph p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Avg Line-Neutral
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100/60 text-blue-600 border border-blue-200/50 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {avgVoltage}
              </span>
              <span className="text-base font-semibold text-slate-500">V RMS</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Nominal: 230.0 V</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Balanced
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Current */}
        <div className="glass-neumorph p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Aggregate Current
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-100/60 text-indigo-600 border border-indigo-200/50 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {totalCurrent}
              </span>
              <span className="text-base font-semibold text-slate-500">A RMS</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Peak Margin: 62%</span>
              <span className="text-indigo-600 font-semibold">48.2 A Avg/Ph</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Power */}
        <div className="glass-neumorph p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Active Power Draw
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100/60 text-purple-600 border border-purple-200/50 shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {telemetry.activePower}
              </span>
              <span className="text-base font-semibold text-slate-500">kW</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>cos φ = {telemetry.powerFactor}</span>
              <span className="text-emerald-600 font-semibold">99.8% Eff</span>
            </div>
          </div>
        </div>

        {/* Card 4: Grid Frequency & Loss */}
        <div className="glass-neumorph p-5 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Grid Synchrony
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-100/60 text-teal-600 border border-teal-200/50 shadow-xs">
              <Waves className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {telemetry.freq}
              </span>
              <span className="text-base font-semibold text-slate-500">Hz</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Standby: {telemetry.standbyLoss} kW</span>
              <span className="text-blue-600 font-semibold">Jitter &lt; 0.01%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Phase Voltage & Current Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase L1 */}
        <div className="glass-neumorph p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                <span className="font-bold text-slate-800 text-base">Phase L1 (Red/A)</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white/70 px-2.5 py-0.5 rounded-full border border-white">
                0° Reference
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="glass-neumorph-sunken p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Voltage
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  {telemetry.v1}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">V</span>
              </div>
              <div className="glass-neumorph-sunken p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Current
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  {telemetry.i1}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">A</span>
              </div>
            </div>

            {/* Gauge Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Phase Load Ratio</span>
                <span className="font-bold text-slate-800">48.2%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: "48.2%" }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span>Harmonic THD: 1.1%</span>
            <span className="text-emerald-600 font-semibold">Stable Waveform</span>
          </div>
        </div>

        {/* Phase L2 */}
        <div className="glass-neumorph p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm" />
                <span className="font-bold text-slate-800 text-base">Phase L2 (Yellow/B)</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white/70 px-2.5 py-0.5 rounded-full border border-white">
                120° Offset
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="glass-neumorph-sunken p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Voltage
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  {telemetry.v2}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">V</span>
              </div>
              <div className="glass-neumorph-sunken p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Current
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  {telemetry.i2}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">A</span>
              </div>
            </div>

            {/* Gauge Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Phase Load Ratio</span>
                <span className="font-bold text-slate-800">46.8%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: "46.8%" }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span>Harmonic THD: 1.3%</span>
            <span className="text-emerald-600 font-semibold">Stable Waveform</span>
          </div>
        </div>

        {/* Phase L3 */}
        <div className="glass-neumorph p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" />
                <span className="font-bold text-slate-800 text-base">Phase L3 (Blue/C)</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white/70 px-2.5 py-0.5 rounded-full border border-white">
                240° Offset
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="glass-neumorph-sunken p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Voltage
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  {telemetry.v3}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">V</span>
              </div>
              <div className="glass-neumorph-sunken p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Current
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  {telemetry.i3}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">A</span>
              </div>
            </div>

            {/* Gauge Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Phase Load Ratio</span>
                <span className="font-bold text-slate-800">47.9%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: "47.9%" }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span>Harmonic THD: 1.0%</span>
            <span className="text-emerald-600 font-semibold">Stable Waveform</span>
          </div>
        </div>
      </div>

      {/* Live Waveform Oscilloscope & Vector Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waveform Card */}
        <div className="lg:col-span-2 glass-neumorph p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Waves className="w-5 h-5 text-blue-600" />
                High-Frequency AC Voltage & Current Waveform
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time 50Hz pure sine oscillation with overlaid current vectors
              </p>
            </div>

            {/* Timebase Controls */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/50 border border-white/60">
              {(["10ms", "20ms", "50ms"] as const).map((tb) => (
                <button
                  key={tb}
                  onClick={() => setActiveTimebase(tb)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTimebase === tb
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tb}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Oscilloscope Display */}
          <div className="mt-4 p-4 rounded-2xl glass-neumorph-sunken relative overflow-hidden h-56 sm:h-64 flex items-center justify-center">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #94A3B8 1px, transparent 1px), linear-gradient(to bottom, #94A3B8 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Center zero line */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-400/40" />

            <svg
              className="w-full h-full relative z-10"
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="voltageWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#6366F1" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="currentWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Voltage Sine Wave (Primary) */}
              <path
                d="M 0 100 Q 75 20, 150 100 T 300 100 T 450 100 T 600 100"
                fill="none"
                stroke="url(#voltageWaveGrad)"
                strokeWidth="3"
                className="animate-pulse"
              />

              {/* Current Load Wave (Slight Phase Shift cos φ = 0.98) */}
              <path
                d="M 0 100 Q 75 45, 150 100 T 300 100 T 450 100 T 600 100"
                fill="none"
                stroke="url(#currentWaveGrad)"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                transform="translate(12, 0)"
              />

              {/* Phase L2 Sine (Yellow/Indigo) */}
              <path
                d="M 0 100 Q 75 180, 150 100 T 300 100 T 450 100 T 600 100"
                fill="none"
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeOpacity="0.45"
                transform="translate(50, 0)"
              />
            </svg>
          </div>

          {/* Oscilloscope Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <span className="font-semibold text-slate-700">Voltage (V_rms)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-emerald-500 rounded-full border border-dashed border-emerald-600" />
                <span className="font-semibold text-slate-700">Current (I_rms)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-indigo-400 rounded-full opacity-60" />
                <span className="font-medium text-slate-500">L2 Phase Shift</span>
              </div>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">
              Sampling: 10,240 Samples/Sec
            </span>
          </div>
        </div>

        {/* Tactile Neumorphic Controls Card */}
        <div className="glass-neumorph p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-200/60">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Tactile Soft UI Controls
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical-feel neumorphic state toggles
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {/* Toggle 1: Anti-Gravity Drift Stabilizer */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/70">
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    Drift Stabilizer
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Smooths voltage sag & harmonic drift
                  </span>
                </div>
                <div
                  onClick={() => setDriftStabilizer(!driftStabilizer)}
                  className={`glass-neumorph-toggle ${driftStabilizer ? "checked" : ""}`}
                >
                  <div className="glass-neumorph-toggle-handle" />
                </div>
              </div>

              {/* Toggle 2: Harmonic Cancellation Active */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/70">
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    Harmonic Cancellation
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Suppresses 3rd, 5th, 7th order harmonics
                  </span>
                </div>
                <div
                  onClick={() => setHarmonicFilter(!harmonicFilter)}
                  className={`glass-neumorph-toggle ${harmonicFilter ? "checked" : ""}`}
                >
                  <div className="glass-neumorph-toggle-handle" />
                </div>
              </div>

              {/* Toggle 3: Auto-Idle Decoupler */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/70">
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    Auto-Idle Decoupler
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Isolates standby factory machines
                  </span>
                </div>
                <div
                  onClick={() => setAutoIdleDecouple(!autoIdleDecouple)}
                  className={`glass-neumorph-toggle ${autoIdleDecouple ? "checked" : ""}`}
                >
                  <div className="glass-neumorph-toggle-handle" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
              <span>Grid Safety Interlock</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ARMED & SAFE
              </span>
            </div>
            <button
              onClick={() => alert("Emergency Grid Decouple simulation activated safely.")}
              className="w-full glass-neumorph-btn py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50/50 flex items-center justify-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              Emergency Line Isolation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
