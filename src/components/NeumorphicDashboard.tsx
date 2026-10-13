import React, { useState } from "react";
import {
  Sun,
  Moon,
  Zap,
  Activity,
  Search,
  CheckCircle2,
  RotateCcw,
  Sliders,
  ShieldCheck,
  TrendingDown,
  Power,
  Cpu,
} from "lucide-react";

export function NeumorphicDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [autoDecouple, setAutoDecouple] = useState(true);
  const [highFreqIngest, setHighFreqIngest] = useState(false);
  const [aiSupervision, setAiSupervision] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"telemetry" | "controls" | "history">("telemetry");
  const [lastAction, setLastAction] = useState<string>("System initialized in nominal mode");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleActionClick = (name: string) => {
    setLastAction(`${name} triggered at ${new Date().toLocaleTimeString()}`);
  };

  const isLight = theme === "light";

  return (
    <div
      className={`neu-surface min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-center transition-colors duration-300 ${
        isLight ? "neu-theme-light" : "neu-theme-dark"
      }`}
      style={{ backgroundColor: "var(--neu-bg-base)" }}
    >
      <div className="w-full max-w-5xl space-y-8">
        {/* MAIN DASHBOARD SHELL // MOLDED EXTRUDED SURFACE */}
        <div className="neu-extruded-card p-6 sm:p-10 space-y-8">
          {/* HEADER BAR // TITLE & THEME CONTROLLER */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block animate-pulse"
                  style={{
                    backgroundColor: "var(--neu-accent-success)",
                    boxShadow: "0 0 10px var(--neu-accent-success-glow)",
                  }}
                />
                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                  style={{ color: "var(--neu-text-headline)" }}
                >
                  Neumorphic Power Console
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-medium" style={{ color: "var(--neu-text-muted)" }}>
                Continuous-Process Substrate Telemetry // Substation 04
              </p>
            </div>

            {/* DYNAMIC THEME SWITCH (LIGHT <-> DARK) */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--neu-text-muted)" }}>
                {isLight ? "Light Soft UI" : "Dark Soft UI"}
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${isLight ? "Dark" : "Light"} theme`}
                className="neu-btn h-12 w-12 flex items-center justify-center p-0 transition-all"
                title={`Toggle to ${isLight ? "Dark" : "Light"} Theme`}
              >
                {isLight ? (
                  <Moon className="h-5 w-5" style={{ color: "var(--neu-accent-primary)" }} />
                ) : (
                  <Sun className="h-5 w-5" style={{ color: "var(--neu-accent-primary)" }} />
                )}
              </button>
            </div>
          </header>

          {/* TELEMETRY METRIC STRIP (EXTRUDED CARDS WITH SUNKEN GAUGES) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6" aria-label="Live Metrics">
            {/* Metric 1 */}
            <div className="neu-extruded-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--neu-text-muted)" }}>
                  Active Line Draw
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    boxShadow:
                      "inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)",
                  }}
                >
                  <Zap className="h-4 w-4" style={{ color: "var(--neu-accent-primary)" }} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-extrabold tracking-tight tabular-nums"
                  style={{ color: "var(--neu-text-headline)" }}
                >
                  142.8
                </span>
                <span className="text-xs font-bold" style={{ color: "var(--neu-text-muted)" }}>
                  kW
                </span>
              </div>
              {/* Sunken Progress Bar */}
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{
                  boxShadow:
                    "inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: "74%",
                    backgroundColor: "var(--neu-accent-primary)",
                    boxShadow: "0 0 8px var(--neu-accent-glow)",
                  }}
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="neu-extruded-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--neu-text-muted)" }}>
                  Standby Waste
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    boxShadow:
                      "inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)",
                  }}
                >
                  <TrendingDown className="h-4 w-4" style={{ color: "var(--neu-accent-success)" }} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-extrabold tracking-tight tabular-nums"
                  style={{ color: "var(--neu-accent-success)" }}
                >
                  34.3
                </span>
                <span className="text-xs font-bold" style={{ color: "var(--neu-text-muted)" }}>
                  kW (24%)
                </span>
              </div>
              {/* Sunken Progress Bar */}
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{
                  boxShadow:
                    "inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: "28%",
                    backgroundColor: "var(--neu-accent-success)",
                    boxShadow: "0 0 8px var(--neu-accent-success-glow)",
                  }}
                />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="neu-extruded-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--neu-text-muted)" }}>
                  Recoverable Spend
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    boxShadow:
                      "inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)",
                  }}
                >
                  <Activity className="h-4 w-4" style={{ color: "var(--neu-accent-primary)" }} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-extrabold tracking-tight tabular-nums"
                  style={{ color: "var(--neu-text-headline)" }}
                >
                  ₹69,920
                </span>
                <span className="text-xs font-bold" style={{ color: "var(--neu-text-muted)" }}>
                  / mo
                </span>
              </div>
              {/* Sunken Progress Bar */}
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{
                  boxShadow:
                    "inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: "88%",
                    backgroundColor: "var(--neu-accent-primary)",
                    boxShadow: "0 0 8px var(--neu-accent-glow)",
                  }}
                />
              </div>
            </div>
          </section>

          {/* SUNKEN FORM INPUT // DEBOSSED INTO SUBSTRATE */}
          <section className="space-y-2">
            <label
              htmlFor="telemetry-search"
              className="block text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--neu-text-muted)" }}
            >
              Filter Telemetry Channel or Asset Identifier
            </label>
            <div className="relative flex items-center">
              <Search
                className="absolute left-4 h-4 w-4 pointer-events-none transition-colors"
                style={{ color: "var(--neu-text-muted)" }}
              />
              <input
                id="telemetry-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search asset register (e.g., CNC_LATHE_01, AIR_COMPRESSOR_B)..."
                className="neu-input-field w-full py-3.5 pl-11 pr-4 text-sm font-medium"
                style={{
                  backgroundColor: "var(--neu-bg-base)",
                  color: "var(--neu-text-headline)",
                }}
              />
            </div>
          </section>

          {/* INTERACTIVE NEUMORPHIC TOGGLE SWITCHES */}
          <section className="neu-extruded-sm p-6 space-y-6" aria-label="System Hardware Switches">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--neu-text-headline)" }}>
              Standby Intervention Automation
            </h2>

            {/* SWITCH 1 */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-black/5 dark:border-white/5">
              <div className="space-y-0.5">
                <div className="text-sm font-bold" style={{ color: "var(--neu-text-headline)" }}>
                  Automatic Standby Decoupling
                </div>
                <div className="text-xs" style={{ color: "var(--neu-text-muted)" }}>
                  Sheds auxiliary line draw when zero mechanical vibrations are confirmed
                </div>
              </div>

              {/* Neumorphic Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={autoDecouple}
                onClick={() => setAutoDecouple(!autoDecouple)}
                className="relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full transition-all duration-300 focus:outline-none"
                style={{
                  backgroundColor: "var(--neu-bg-base)",
                  boxShadow: autoDecouple
                    ? "inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)"
                    : "4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light)",
                }}
              >
                <span
                  className="pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full transition-all duration-300 my-auto ml-1"
                  style={{
                    backgroundColor: "var(--neu-bg-base)",
                    transform: autoDecouple ? "translateX(32px)" : "translateX(0px)",
                    boxShadow: "2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: autoDecouple ? "var(--neu-accent-success)" : "var(--neu-text-muted)",
                      boxShadow: autoDecouple ? "0 0 6px var(--neu-accent-success-glow)" : "none",
                    }}
                  />
                </span>
              </button>
            </div>

            {/* SWITCH 2 */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-black/5 dark:border-white/5">
              <div className="space-y-0.5">
                <div className="text-sm font-bold" style={{ color: "var(--neu-text-headline)" }}>
                  High-Frequency Multi-Signal Polling
                </div>
                <div className="text-xs" style={{ color: "var(--neu-text-muted)" }}>
                  Synchronizes acoustic decibels and current waveforms at sub-second intervals
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={highFreqIngest}
                onClick={() => setHighFreqIngest(!highFreqIngest)}
                className="relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full transition-all duration-300 focus:outline-none"
                style={{
                  backgroundColor: "var(--neu-bg-base)",
                  boxShadow: highFreqIngest
                    ? "inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)"
                    : "4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light)",
                }}
              >
                <span
                  className="pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full transition-all duration-300 my-auto ml-1"
                  style={{
                    backgroundColor: "var(--neu-bg-base)",
                    transform: highFreqIngest ? "translateX(32px)" : "translateX(0px)",
                    boxShadow: "2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: highFreqIngest ? "var(--neu-accent-primary)" : "var(--neu-text-muted)",
                      boxShadow: highFreqIngest ? "0 0 6px var(--neu-accent-glow)" : "none",
                    }}
                  />
                </span>
              </button>
            </div>

            {/* SWITCH 3 */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="space-y-0.5">
                <div className="text-sm font-bold" style={{ color: "var(--neu-text-headline)" }}>
                  Autonomous Agent Supervision Queue
                </div>
                <div className="text-xs" style={{ color: "var(--neu-text-muted)" }}>
                  Enforces engineer approval gating before triggering plant-floor circuit relays
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={aiSupervision}
                onClick={() => setAiSupervision(!aiSupervision)}
                className="relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full transition-all duration-300 focus:outline-none"
                style={{
                  backgroundColor: "var(--neu-bg-base)",
                  boxShadow: aiSupervision
                    ? "inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)"
                    : "4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light)",
                }}
              >
                <span
                  className="pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full transition-all duration-300 my-auto ml-1"
                  style={{
                    backgroundColor: "var(--neu-bg-base)",
                    transform: aiSupervision ? "translateX(32px)" : "translateX(0px)",
                    boxShadow: "2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: aiSupervision ? "var(--neu-accent-success)" : "var(--neu-text-muted)",
                      boxShadow: aiSupervision ? "0 0 6px var(--neu-accent-success-glow)" : "none",
                    }}
                  />
                </span>
              </button>
            </div>
          </section>

          {/* ACTION BUTTON SUITE (TACTILE DEBOSS ON PRESS) */}
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/5">
            <div className="text-xs font-mono font-medium" style={{ color: "var(--neu-text-muted)" }}>
              STATUS: {lastAction}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleActionClick("Recalibrate Sensor Baseline")}
                className="neu-btn px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Recalibrate
              </button>

              <button
                type="button"
                onClick={() => handleActionClick("Emergency Power Shed")}
                className="neu-btn px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2"
                style={{ color: "var(--neu-accent-primary)" }}
              >
                <Power className="h-3.5 w-3.5" />
                Execute Power Shed
              </button>

              <button
                type="button"
                onClick={() => handleActionClick("Generate Auditable PDF Ledger")}
                className="neu-btn px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2"
                style={{ color: "var(--neu-accent-success)" }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Commit Audit Run
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
export default NeumorphicDashboard;
