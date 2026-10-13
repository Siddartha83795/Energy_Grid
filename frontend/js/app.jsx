// Energy Advisor - Modern React Frontend (React 18 / JSX)
const { useState, useEffect, useRef } = React;

function App() {
  const dataStore = window.ENERGY_ADVISOR_DATA;

  // Global App State
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [devices, setDevices] = useState(dataStore.INITIAL_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState('dev-01');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState(dataStore.INITIAL_RECOMMENDATIONS);
  const [beforeAfterList, setBeforeAfterList] = useState(dataStore.INITIAL_BEFORE_AFTER);
  const [syncSeconds, setSyncSeconds] = useState(2);
  const [pipelineModalStep, setPipelineModalStep] = useState(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Alerts state
  const [alerts, setAlerts] = useState([
    {
      id: 'alert-01',
      type: 'HIGH_EXCESS',
      title: 'HIGH EXCESS ENERGY',
      deviceName: 'Desktop PC (Workstation)',
      deviceId: 'dev-01',
      excessPowerText: '+49 W above expected',
      time: '09:18 AM',
      cause: 'Prolonged idle operation without sleep policy',
      status: 'UNREAD',
    },
    {
      id: 'alert-02',
      type: 'UNDER_REVIEW',
      title: 'UNDER REVIEW',
      deviceName: 'Network Laser Printer',
      deviceId: 'dev-04',
      excessPowerText: '+12 W above expected',
      time: '09:42 AM',
      cause: 'Standby fuser heater cycle anomaly',
      status: 'UNREAD',
    },
    {
      id: 'alert-03',
      type: 'NORMAL',
      title: 'NORMAL OPERATION',
      deviceName: 'Developer Laptop',
      deviceId: 'dev-02',
      excessPowerText: 'Within expected baseline (±5 W)',
      time: '10:00 AM',
      cause: 'Heavy work compute baseline verified',
      status: 'ACKNOWLEDGED',
    },
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live telemetry pulse simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncSeconds((s) => (s >= 4 ? 1 : s + 1));

      // Subtle fluctuation for live values
      setDevices((prev) =>
        prev.map((d) => {
          if (d.id === 'dev-01') {
            const jitter = (Math.random() - 0.5) * 1.5;
            const newPower = Math.round((92 + jitter) * 10) / 10;
            return {
              ...d,
              currentPowerW: newPower,
              excessPowerW: Math.round((newPower - d.expectedPowerW) * 10) / 10,
            };
          }
          return d;
        })
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const totalActualPower = devices.reduce((s, d) => s + d.currentPowerW, 0);
  const totalExpectedPower = devices.reduce((s, d) => s + d.expectedPowerW, 0);
  const totalExcessPower = Math.max(0, totalActualPower - totalExpectedPower);
  const excessPercentage = Math.round((totalExcessPower / totalExpectedPower) * 1000) / 10;
  const unreadAlerts = alerts.filter((a) => a.status === 'UNREAD').length;

  // Actions
  const handleApplyRecommendation = (id) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPLIED', appliedAt: 'Just now' } : r))
    );
    showToast('Action applied successfully! Telemetry monitoring post-intervention load transition.');
  };

  const handleCompleteRecommendation = (id) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'COMPLETED', completedAt: 'Just now' } : r))
    );
    showToast('Recommendation marked as completed & verified on sensor grid.');
  };

  const handleAcknowledgeAlert = (id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a)));
    showToast('Alert acknowledged.');
  };

  const handleDismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast('Alert dismissed.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-200 text-xs font-mono shadow-2xl flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070b14]/90 backdrop-blur-md px-4 sm:px-6 py-3 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="h-full w-full bg-[#090e18] rounded-[10px] grid place-items-center text-cyan-400 font-black font-mono">
                EA
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-white tracking-tight">ENERGY ADVISOR</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  B.TECH RESEARCH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Context-Aware Energy Monitoring, Excess Energy Detection & Energy-Saving Analysis
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md mx-auto w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices, nodes, or operating states..."
              className="w-full h-9 px-3.5 bg-slate-900/80 border border-white/10 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 rounded-xl"
            />
          </div>

          {/* Real-time Indicator & Demo Toggle */}
          <div className="flex items-center gap-3 shrink-0 justify-between lg:justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">Real-time Monitoring</span>
              <span className="text-emerald-400 font-bold text-[10px]">LIVE</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5 font-mono text-xs">
              <span className="text-[11px] text-slate-400">Demo Mode:</span>
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="cursor-pointer accent-cyan-500"
              />
              {isDemoMode && (
                <span className="badge badge-amber text-[9px] px-1.5 py-0">DEMO DATA</span>
              )}
            </div>

            <button
              onClick={() => setCurrentPage('cause-analysis')}
              className="h-9 w-9 rounded-xl bg-slate-900/80 border border-white/5 text-slate-300 hover:text-white relative grid place-items-center cursor-pointer"
              title="Alerts Feed"
            >
              🔔
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-mono grid place-items-center font-bold">
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* BODY LAYOUT (Sidebar + Main Content) */}
      <div className="flex-1 flex">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-white/10 bg-[#070b14] text-slate-300 no-print">
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Research Workflow
            </div>

            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'devices', label: 'Devices', icon: '🖥️' },
              { id: 'device-details', label: 'Device Details', icon: '🔍' },
              { id: 'energy-analysis', label: 'Energy Analysis', icon: '📈' },
              { id: 'cause-analysis', label: 'Cause Analysis', icon: '❓' },
              { id: 'recommendations', label: 'Recommendations', icon: '💡' },
              { id: 'energy-saving', label: 'Energy Saving', icon: '📉' },
              { id: 'research-evaluation', label: 'Research Evaluation', icon: '🎓' },
              { id: 'reports', label: 'Reports', icon: '📄' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ].map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-mono transition-all duration-150 border text-left cursor-pointer ${
                    active
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 font-semibold shadow-sm'
                      : 'border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Footer */}
          <div className="p-4 border-t border-white/10 bg-[#060910] text-[11px] font-mono space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>System Status:</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>ESP32 Nodes:</span>
              <span className="text-cyan-300 font-semibold">3 Online</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[10px]">
              <span>Last Sync:</span>
              <span>{syncSeconds} sec ago</span>
            </div>
          </div>
        </aside>

        {/* MAIN DYNAMIC CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {currentPage === 'dashboard' && (
            <DashboardView
              devices={devices}
              totalActualPower={totalActualPower}
              totalExpectedPower={totalExpectedPower}
              totalExcessPower={totalExcessPower}
              excessPercentage={excessPercentage}
              selectedDevice={selectedDevice}
              setSelectedDeviceId={setSelectedDeviceId}
              onNavigate={setCurrentPage}
              onInspectPipelineStep={setPipelineModalStep}
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onDismissAlert={handleDismissAlert}
              syncSeconds={syncSeconds}
              beforeAfterList={beforeAfterList}
            />
          )}

          {currentPage === 'devices' && (
            <DevicesView
              devices={devices}
              searchQuery={searchQuery}
              onSelectDevice={(id) => {
                setSelectedDeviceId(id);
                setCurrentPage('device-details');
              }}
              onOpenAdd={() => setIsAddDeviceOpen(true)}
            />
          )}

          {currentPage === 'device-details' && (
            <DeviceDetailsView
              device={selectedDevice}
              onBack={() => setCurrentPage('devices')}
            />
          )}

          {currentPage === 'energy-analysis' && (
            <EnergyAnalysisView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedDeviceId}
            />
          )}

          {currentPage === 'cause-analysis' && (
            <CauseAnalysisView
              device={selectedDevice}
              causeData={dataStore.DESKTOP_PC_CAUSE_ATTRIBUTION}
              evidenceList={dataStore.DESKTOP_PC_EVIDENCE}
            />
          )}

          {currentPage === 'recommendations' && (
            <RecommendationsView
              recommendations={recommendations}
              onApply={handleApplyRecommendation}
              onComplete={handleCompleteRecommendation}
              onViewSaving={() => setCurrentPage('energy-saving')}
            />
          )}

          {currentPage === 'energy-saving' && (
            <EnergySavingView
              beforeAfterList={beforeAfterList}
              dailyData={dataStore.DAILY_SAVINGS_DATA}
            />
          )}

          {currentPage === 'research-evaluation' && (
            <ResearchEvaluationView metrics={dataStore.RESEARCH_METRICS} />
          )}

          {currentPage === 'reports' && (
            <ReportsView
              devices={devices}
              selectedDevice={selectedDevice}
              causeData={dataStore.DESKTOP_PC_CAUSE_ATTRIBUTION}
              beforeAfter={beforeAfterList[0]}
              onShowToast={showToast}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              isDemoMode={isDemoMode}
              setIsDemoMode={setIsDemoMode}
              onSave={() => showToast('Configuration saved successfully.')}
            />
          )}
        </main>
      </div>

      {/* PIPELINE MODAL */}
      {pipelineModalStep && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 border-cyan-500/30 text-white font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="badge badge-cyan">Stage {pipelineModalStep.step} of 10</span>
              <button
                onClick={() => setPipelineModalStep(null)}
                className="text-slate-400 hover:text-white text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h3 className="text-lg font-bold text-white">{pipelineModalStep.title}</h3>
            <p className="text-slate-300 text-xs leading-relaxed">{pipelineModalStep.desc}</p>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 text-[11px] text-cyan-300">
              Research Rule: Distinguishes legitimate dynamic compute from genuine idle excess via sensor correlation.
            </div>
            <button
              onClick={() => setPipelineModalStep(null)}
              className="btn-primary w-full justify-center"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* ADD DEVICE MODAL */}
      {isAddDeviceOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 border-cyan-500/30 text-white font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Register Monitored Device</h3>
              <button
                onClick={() => setIsAddDeviceOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lab GPU Compute Unit 05"
                  className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-md text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Device Type</label>
                  <select className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-md text-white">
                    <option>Computer / Workstation</option>
                    <option>Server Node</option>
                    <option>Cooling / Fan</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">ESP32 Node</label>
                  <select className="w-full h-9 px-3 bg-slate-900 border border-white/10 rounded-md text-white">
                    <option>Node 01</option>
                    <option>Node 02</option>
                    <option>Node 03</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsAddDeviceOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsAddDeviceOpen(false);
                  showToast('Device registered successfully.');
                }}
                className="btn-primary"
              >
                Register Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 1. DASHBOARD VIEW (Sections 4, 5, 6, 7, 8, 9, 10, 19, 20, 22)
// -------------------------------------------------------------
function DashboardView({
  devices,
  totalActualPower,
  totalExpectedPower,
  totalExcessPower,
  excessPercentage,
  selectedDevice,
  setSelectedDeviceId,
  onNavigate,
  onInspectPipelineStep,
  alerts,
  onAcknowledgeAlert,
  onDismissAlert,
  syncSeconds,
  beforeAfterList,
}) {
  const steps = window.ENERGY_ADVISOR_DATA.RESEARCH_PIPELINE_STEPS;
  const timeSeries = window.ENERGY_ADVISOR_DATA.DESKTOP_PC_TIME_SERIES;

  return (
    <div className="space-y-8">
      {/* Subtitle Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ENERGY ADVISOR</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Context-Aware Energy Monitoring, Excess Energy Detection & Energy-Saving Analysis
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Edge Telemetry Active: <strong className="text-white">3 Nodes</strong></span>
        </div>
      </div>

      {/* Section 4: 6 TOP KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Current Power</span>
            <span className="badge badge-emerald">LIVE</span>
          </div>
          <div className="mt-2 font-mono">
            <div className="text-2xl font-black text-white">{Math.round(totalActualPower)} W</div>
            <div className="text-[10px] text-slate-400 mt-1">Across 4 monitored devices</div>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Expected Power</span>
            <span className="text-cyan-400">⚙️</span>
          </div>
          <div className="mt-2 font-mono">
            <div className="text-2xl font-black text-cyan-300">{totalExpectedPower} W</div>
            <div className="text-[10px] text-slate-400 mt-1">Learned operating baselines</div>
          </div>
        </div>

        {/* CARD 3: Prominent Excess Power */}
        <div className="glass-card glass-card-prominent p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono font-bold">
            <span>EXCESS POWER</span>
            <span>⚠️</span>
          </div>
          <div className="mt-2 font-mono">
            <div className="text-2xl font-black text-amber-400">+{totalExcessPower} W</div>
            <div className="text-[11px] text-amber-300 mt-1 font-semibold">
              {excessPercentage}% above expected
            </div>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Today's Excess Energy</span>
            <span>⏱️</span>
          </div>
          <div className="mt-2 font-mono">
            <div className="text-2xl font-black text-amber-300">2.84 kWh</div>
            <div className="text-[10px] text-slate-400 mt-1">Potential energy lost</div>
          </div>
        </div>

        <div className="glass-card glass-card-emerald p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
            <span>Energy Saved Today</span>
            <span>🌱</span>
          </div>
          <div className="mt-2 font-mono">
            <div className="text-2xl font-black text-emerald-400">1.42 kWh</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Verified post-action</div>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Attention Required</span>
            <span className="text-red-400">🚨</span>
          </div>
          <div className="mt-2 font-mono">
            <div className="text-2xl font-black text-red-400">3</div>
            <div className="text-[10px] text-slate-400 mt-1">Devices with anomalies</div>
          </div>
        </div>
      </section>

      {/* Section 22: VISUAL RESEARCH WORKFLOW PIPELINE */}
      <section className="glass-card glass-card-cyan p-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-cyan">Core Research Architecture</span>
              <span className="text-xs font-mono text-emerald-400/80">10-Stage Context-Aware Workflow</span>
            </div>
            <h2 className="text-sm font-bold text-white mt-1">
              Excess Energy Detection & Cause Attribution Process Flow
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Click any step to inspect logic:
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-2 min-w-[960px]">
            {steps.map((st) => (
              <button
                key={st.step}
                onClick={() => onInspectPipelineStep(st)}
                className="flex-1 min-w-[110px] rounded-xl p-2.5 bg-slate-900/60 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-left transition-all cursor-pointer font-mono"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>{String(st.step).padStart(2, '0')}</span>
                  <span className="badge badge-cyan text-[8px] px-1 py-0">{st.badge}</span>
                </div>
                <div className="text-xs font-bold text-white leading-tight line-clamp-2">{st.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: OPERATING STATE OVERVIEW */}
      <section className="space-y-3">
        <div className="flex items-center justify-between font-mono">
          <div>
            <h3 className="text-base font-bold text-white">Current Operating States</h3>
            <p className="text-xs text-slate-400">Real-time state identification & expected load baselines</p>
          </div>
          <span className="text-xs text-cyan-400">{devices.length} Monitored Endpoints</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {devices.map((dev) => {
            const isExcess = dev.status === 'VERIFIED' || dev.status === 'DETECTED';
            return (
              <div
                key={dev.id}
                className={`glass-card p-5 flex flex-col justify-between ${
                  isExcess ? 'border-amber-500/40 bg-[#14121a]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-white">{dev.name.split('(')[0]}</div>
                      <div className="text-[10px] font-mono text-slate-400">{dev.esp32NodeId}</div>
                    </div>
                    <span className={isExcess ? 'badge badge-red' : 'badge badge-emerald'}>
                      {dev.statusLabel}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 font-mono text-xs flex justify-between mb-3">
                    <span className="text-slate-400 text-[11px]">Operating State:</span>
                    <span className="font-bold text-cyan-300">{dev.currentState}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center font-mono py-2 border-y border-white/5 mb-3 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Actual</span>
                      <span className="font-bold text-white">{dev.currentPowerW} W</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Expected</span>
                      <span className="font-bold text-slate-300">{dev.expectedPowerW} W</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Excess</span>
                      <span className={`font-bold ${isExcess ? 'text-amber-400' : 'text-emerald-400'}`}>
                        +{dev.excessPowerW} W
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDeviceId(dev.id);
                    onNavigate('device-details');
                  }}
                  className="btn-secondary w-full justify-center text-xs"
                >
                  View Analysis →
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 6: CORE RESEARCH VISUALIZATION (Actual vs Expected Chart) */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-base font-bold text-white">Actual vs Expected Energy</h3>
              <span className="badge badge-amber">EXCESS DETECTED</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Time-series tracking with shaded <strong className="text-amber-300">EXCESS ENERGY REGION</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1 text-red-400">● Actual Power</span>
            <span className="flex items-center gap-1 text-cyan-400">--- Expected Baseline</span>
            <span className="flex items-center gap-1 text-amber-300">■ Excess Region</span>
          </div>
        </div>

        {/* Custom Pure CSS/HTML Canvas Time-Series Graph */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 space-y-4">
          <div className="relative h-64 flex items-end gap-1 sm:gap-2 pt-6 px-2 border-b border-slate-700">
            {timeSeries.map((pt, i) => {
              const maxH = 100;
              const actualH = Math.round((pt.actualPower / maxH) * 200);
              const expH = Math.round((pt.expectedPower / maxH) * 200);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="px-2 py-1 bg-slate-950 border border-white/20 rounded text-[10px] font-mono text-white whitespace-nowrap shadow-xl">
                      {pt.time}: Actual {pt.actualPower}W | Exp {pt.expectedPower}W
                    </div>
                  </div>
                  {/* Excess Top Bar */}
                  {pt.actualPower > pt.expectedPower && (
                    <div
                      className="w-full bg-amber-500/70 rounded-t border-t-2 border-amber-300 transition-all duration-300"
                      style={{ height: `${actualH - expH}px` }}
                    />
                  )}
                  {/* Expected Bottom Bar */}
                  <div
                    className="w-full bg-cyan-600/40 border-t-2 border-cyan-400 transition-all duration-300"
                    style={{ height: `${expH}px` }}
                  />
                  {/* Time label */}
                  <span className="text-[9px] font-mono text-slate-500 mt-2 block rotate-45 sm:rotate-0">
                    {pt.time}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-2">
            <span>09:00 AM Baseline Start</span>
            <span className="badge badge-amber">EXCESS REGION: 09:18 – 10:00 AM (38 MIN)</span>
            <span>10:20 AM Sleep Policy Active</span>
          </div>
        </div>
      </section>

      {/* Section 7 & 8: EXCESS ANALYSIS & MULTI-SIGNAL SENSORS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 7: Excess Energy Analysis */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Excess Energy Analysis</h3>
              <p className="text-[11px] text-slate-400 font-mono">State baseline deviation quantifier</p>
            </div>
            <span className="badge badge-amber">Potential Excess Energy</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Current State</span>
              <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{selectedDevice.currentState}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Expected</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 block">{selectedDevice.expectedPowerW} W</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Actual</span>
              <span className="text-sm font-bold text-red-400 mt-0.5 block">{selectedDevice.currentPowerW} W</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
              <span className="text-[10px] text-amber-300 block uppercase font-bold">Excess</span>
              <span className="text-sm font-bold text-amber-400 mt-0.5 block">+{selectedDevice.excessPowerW} W</span>
            </div>
          </div>

          {/* Visual Meter */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span className="text-cyan-300">Expected Baseline: {selectedDevice.expectedPowerW} W</span>
              <span className="text-red-400">Actual Draw: {selectedDevice.currentPowerW} W</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-cyan-500 h-full" style={{ width: '45%' }} title="Expected" />
              <div className="bg-amber-500 h-full" style={{ width: '50%' }} title="Excess" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Excess: +114% above model</span>
              <span>Duration: 38 min | Energy: 31 Wh</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-200 font-bold">Potential Excess Energy Detected</span>
            <span className="badge badge-amber">91% Confidence</span>
          </div>
        </div>

        {/* Section 8: Multi-Signal Verification */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Supporting Sensor Evidence</h3>
              <p className="text-[11px] text-slate-400 font-mono">Cross-validation across multi-modal telemetry</p>
            </div>
            <span className="badge badge-cyan">VERIFIED</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-red-500/30">
              <span className="text-[10px] text-red-400 block uppercase">Power</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{selectedDevice.currentPowerW} W ↑</span>
              <span className="text-[9px] text-red-400">High (+114%)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Temp</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{selectedDevice.temperatureC} °C</span>
              <span className="text-[9px] text-emerald-400">Normal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Vibration</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{selectedDevice.vibrationG} g</span>
              <span className="text-[9px] text-slate-400">Low</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Activity</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{selectedDevice.activityLevel}</span>
              <span className="text-[9px] text-slate-400">Inactive</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30">
              <span className="text-[10px] text-cyan-400 block uppercase">State</span>
              <span className="text-sm font-bold text-cyan-300 mt-0.5 block">{selectedDevice.currentState}</span>
              <span className="text-[9px] text-cyan-400">ACPI Idle</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between font-bold text-white">
              <span>Evidence Consistency: <strong className="text-cyan-400">VERIFIED</strong></span>
              <span className="badge badge-cyan">91% Confidence</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              &ldquo;Power consumption is significantly above the expected idle baseline while activity and vibration remain low.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Section 15: BEFORE VS AFTER MEASURED SAVING */}
      <section className="glass-card glass-card-emerald p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Measured Energy-Saving Impact</h3>
            <p className="text-xs text-slate-400 font-mono">
              Desktop PC (Workstation) — Applied 10-Minute ACPI Sleep Policy via Energy Advisor
            </p>
          </div>
          <span className="badge badge-emerald">✓ Measured After Recommendation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase">Before Action</span>
            <span className="text-xl font-bold text-white mt-1 block">90 W</span>
            <span className="text-[9px] text-red-400">Pre-intervention</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 block uppercase font-bold">After Action</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">55 W</span>
            <span className="text-[9px] text-emerald-400">Verified steady</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
            <span className="text-[10px] text-emerald-300 block uppercase font-bold">Reduction</span>
            <span className="text-xl font-bold text-emerald-300 mt-1 block">-35 W (38.9%)</span>
            <span className="text-[9px] text-emerald-400">Active drop</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase">Energy Saved</span>
            <span className="text-xl font-bold text-cyan-400 mt-1 block">0.175 kWh</span>
            <span className="text-[9px] text-slate-400">30 min duration</span>
          </div>
        </div>
      </section>

      {/* Section 19 & 20: LIVE TELEMETRY & ALERTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ESP32 Telemetry */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">📡</span>
              <h3 className="text-base font-bold text-white">ESP32 NODE 01 Telemetry</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="badge badge-emerald">ONLINE</span>
              <span className="text-slate-400 text-[10px]">Sync: {syncSeconds}s ago</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-slate-400 text-[10px] block">Voltage</span>
              <span className="text-base font-bold text-white mt-0.5 block">{selectedDevice.voltageV} V</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-slate-400 text-[10px] block">Current</span>
              <span className="text-base font-bold text-white mt-0.5 block">{selectedDevice.currentA} A</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-red-500/30">
              <span className="text-red-400 text-[10px] block font-bold">Power</span>
              <span className="text-base font-bold text-red-400 mt-0.5 block">{selectedDevice.currentPowerW} W</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-slate-400 text-[10px] block">Energy Today</span>
              <span className="text-base font-bold text-cyan-400 mt-0.5 block">{selectedDevice.todayEnergyKWh} kWh</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-slate-400 text-[10px] block">Temperature</span>
              <span className="text-base font-bold text-slate-200 mt-0.5 block">{selectedDevice.temperatureC} °C</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-slate-400 text-[10px] block">Vibration</span>
              <span className="text-base font-bold text-slate-200 mt-0.5 block">{selectedDevice.vibrationG} g</span>
            </div>
          </div>
        </div>

        {/* Real-time Alerts System */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white font-mono">Alert System</h3>
            <span className="badge badge-cyan">{alerts.length} Active</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  a.type === 'HIGH_EXCESS'
                    ? 'bg-red-950/20 border-red-500/30'
                    : 'bg-slate-900/60 border-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={a.type === 'HIGH_EXCESS' ? 'badge badge-red' : 'badge badge-emerald'}>
                      {a.type}
                    </span>
                    <span className="font-bold text-white">{a.deviceName}</span>
                  </div>
                  <div className="text-slate-300 mt-1">{a.excessPowerText} — <span className="text-slate-400">{a.cause}</span></div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.status === 'UNREAD' && (
                    <button
                      onClick={() => onAcknowledgeAlert(a.id)}
                      className="btn-secondary text-[10px] py-1 px-2"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('cause-analysis')}
                    className="btn-primary text-[10px] py-1 px-2"
                  >
                    View Analysis
                  </button>
                  <button
                    onClick={() => onDismissAlert(a.id)}
                    className="text-slate-500 hover:text-white px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// 2. DEVICES VIEW (Section 18)
// -------------------------------------------------------------
function DevicesView({ devices, searchQuery, onSelectDevice, onOpenAdd }) {
  const filtered = devices.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Device Registry & State Models</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage IoT hardware endpoints and their state-specific expected energy models.
          </p>
        </div>
        <button onClick={onOpenAdd} className="btn-primary">
          + Add Device
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 text-[11px]">
            <tr>
              <th className="p-3.5">Device Name</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5">Operating State</th>
              <th className="p-3.5 text-right">Actual Power</th>
              <th className="p-3.5 text-right">Expected Power</th>
              <th className="p-3.5 text-right">Excess Power</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center">ESP32 Node</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((dev) => (
              <tr key={dev.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3.5 font-bold text-white">{dev.name}</td>
                <td className="p-3.5 text-slate-300">{dev.type}</td>
                <td className="p-3.5">
                  <span className="badge badge-cyan">{dev.currentState}</span>
                </td>
                <td className="p-3.5 text-right font-bold text-white">{dev.currentPowerW} W</td>
                <td className="p-3.5 text-right text-slate-300">{dev.expectedPowerW} W</td>
                <td className="p-3.5 text-right font-bold text-amber-400">+{dev.excessPowerW} W</td>
                <td className="p-3.5 text-center">
                  <span className={dev.excessPowerW > 5 ? 'badge badge-red' : 'badge badge-emerald'}>
                    {dev.statusLabel}
                  </span>
                </td>
                <td className="p-3.5 text-center text-slate-400">{dev.esp32NodeId}</td>
                <td className="p-3.5 text-right">
                  <button onClick={() => onSelectDevice(dev.id)} className="btn-secondary text-[11px] py-1 px-2.5">
                    View Analysis →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. DEVICE DETAILS VIEW (Sections 11 & 12)
// -------------------------------------------------------------
function DeviceDetailsView({ device, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-secondary text-xs">
            ← Back to Devices
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{device.name}</h1>
            <p className="text-[11px] text-slate-400 font-mono">{device.type} • {device.esp32NodeId} ONLINE</p>
          </div>
        </div>
        <span className="badge badge-amber font-mono">STATE: {device.currentState}</span>
      </div>

      {/* 4 Quantitative Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="glass-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block">Current Power</span>
          <span className="text-2xl font-black text-white mt-1 block">{device.currentPowerW} W</span>
        </div>
        <div className="glass-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block">Expected Power</span>
          <span className="text-2xl font-black text-cyan-300 mt-1 block">{device.expectedPowerW} W</span>
        </div>
        <div className="glass-card glass-card-prominent p-4">
          <span className="text-[10px] text-amber-300 uppercase block font-bold">Excess Power</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">+{device.excessPowerW} W</span>
        </div>
        <div className="glass-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block">Excess Energy</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">31 Wh</span>
        </div>
      </div>

      {/* Section 12: State-Specific Energy Model Chart */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Expected Energy by Operating State</h3>
            <p className="text-xs text-slate-400 font-mono">Learned model from historical device telemetry</p>
          </div>
          <span className="badge badge-amber">Demo Data</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3 font-mono">
            {device.stateModels.map((m, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-bold">{m.state}</span>
                  <span className="text-cyan-300 font-bold">{m.expectedPowerW} W</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      m.state === device.currentState ? 'bg-amber-400' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${(m.expectedPowerW / 120) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 font-mono text-xs text-slate-300">
            <div className="text-cyan-400 font-bold text-xs uppercase mb-2">Model Specifications</div>
            <div className="flex justify-between"><span>Training Period:</span><span className="text-white">30 days</span></div>
            <div className="flex justify-between"><span>Samples:</span><span className="text-cyan-300 font-bold">12,480</span></div>
            <div className="flex justify-between"><span>Prediction Error (MAE):</span><span className="text-emerald-400 font-bold">4.8 W</span></div>
            <div className="flex justify-between"><span>RMSE:</span><span className="text-emerald-400 font-bold">6.2 W</span></div>
            <div className="flex justify-between"><span>R²:</span><span className="text-emerald-400 font-bold">0.942</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. ENERGY ANALYSIS VIEW
// -------------------------------------------------------------
function EnergyAnalysisView({ devices, selectedDevice, onSelectDevice }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Excess Energy Quantification & Analysis</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Comparative deviation analysis and cumulative energy loss.</p>
        </div>
        <select
          value={selectedDevice.id}
          onChange={(e) => onSelectDevice(e.target.value)}
          className="h-9 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono text-white"
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.currentState})
            </option>
          ))}
        </select>
      </div>

      <div className="glass-card p-6 space-y-4 font-mono">
        <h3 className="text-base font-bold text-white">Device Baseline vs Measured Power Draw</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {devices.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="text-sm font-bold text-white">{d.name.split('(')[0]}</div>
              <div className="text-xs text-slate-400">Actual: <strong className="text-red-400">{d.currentPowerW}W</strong></div>
              <div className="text-xs text-slate-400">Expected: <strong className="text-cyan-400">{d.expectedPowerW}W</strong></div>
              <div className="text-xs font-bold text-amber-400">Excess: +{d.excessPowerW}W</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. CAUSE ANALYSIS VIEW (Section 13)
// -------------------------------------------------------------
function CauseAnalysisView({ device, causeData, evidenceList }) {
  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Root Cause Analysis</h1>
          <p className="text-xs text-slate-400 mt-1">Selected Event: 09:18 AM – 09:56 AM (38 minutes)</p>
        </div>
        <span className="badge badge-red">VERIFIED IDLE ANOMALY</span>
      </div>

      {/* Evidence Matrix */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Evidence Matrix</h3>
        <table className="w-full text-left text-xs divide-y divide-white/5">
          <thead>
            <tr className="text-slate-400 text-[11px]">
              <th className="pb-2">Evidence Dimension</th>
              <th className="pb-2">Observation</th>
              <th className="pb-2">Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {evidenceList.map((ev, i) => (
              <tr key={i}>
                <td className="py-2.5 font-bold text-white">{ev.metric}</td>
                <td className="py-2.5 text-cyan-300 font-semibold">{ev.value}</td>
                <td className="py-2.5 text-slate-300">{ev.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Probable Cause & Alternatives */}
      <div className="glass-card p-6 space-y-4">
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
          <span className="text-[10px] text-cyan-400 uppercase font-bold block">PROBABLE CAUSE</span>
          <div className="text-lg font-bold text-white">{causeData.probableCause}</div>
          <div className="text-xs text-emerald-400 font-bold">Confidence: {causeData.confidencePercent}%</div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-300 mb-2">Alternative Hypotheses:</div>
          <div className="space-y-2 text-xs">
            {causeData.alternativeCauses.map((alt, idx) => (
              <div key={idx} className="flex justify-between p-2 rounded bg-slate-900/60 text-slate-300">
                <span>{idx + 1}. {alt.cause}</span>
                <span className="font-bold text-cyan-400">{alt.probabilityPercent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. RECOMMENDATIONS VIEW (Section 14)
// -------------------------------------------------------------
function RecommendationsView({ recommendations, onApply, onComplete, onViewSaving }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Energy Recommendations</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Context-aware prescriptive corrective policies.</p>
        </div>
        <span className="badge badge-cyan font-mono">{recommendations.length} Proposals</span>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="glass-card p-6 space-y-4 font-mono">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-cyan-400 font-bold block">{rec.deviceName}</span>
                <h2 className="text-base font-bold text-white mt-0.5">{rec.title}</h2>
              </div>
              <span className={rec.status === 'COMPLETED' ? 'badge badge-emerald' : 'badge badge-cyan'}>
                {rec.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300">
              <strong>Reason:</strong> {rec.reason}
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Estimated Reduction</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">35–50 W</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Potential Daily Saving</span>
                <span className="text-base font-bold text-cyan-400 mt-0.5 block">0.5–1.0 kWh</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {rec.status === 'PENDING' && (
                <button onClick={() => onApply(rec.id)} className="btn-primary">
                  Apply / Record Action
                </button>
              )}
              {rec.status === 'APPLIED' && (
                <>
                  <button onClick={onViewSaving} className="btn-secondary">
                    View Measured Savings →
                  </button>
                  <button onClick={() => onComplete(rec.id)} className="btn-emerald">
                    Mark as Completed
                  </button>
                </>
              )}
              {rec.status === 'COMPLETED' && (
                <button onClick={onViewSaving} className="btn-secondary">
                  ✓ Verified Savings
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. ENERGY SAVING VIEW (Sections 15 & 16)
// -------------------------------------------------------------
function EnergySavingView({ beforeAfterList, dailyData }) {
  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Energy Saving Impact</h1>
          <p className="text-xs text-slate-400 mt-1">Measured post-action verification and weekly savings profile.</p>
        </div>
        <span className="badge badge-emerald">✓ Verified Edge Data</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card glass-card-emerald p-4">
          <span className="text-[10px] text-emerald-400 block font-bold uppercase">Saved Today</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">1.42 kWh</span>
        </div>
        <div className="glass-card glass-card-emerald p-4">
          <span className="text-[10px] text-emerald-400 block font-bold uppercase">Saved This Week</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">8.7 kWh</span>
        </div>
        <div className="glass-card p-4">
          <span className="text-[10px] text-slate-400 block uppercase">Excess Identified</span>
          <span className="text-2xl font-black text-amber-300 mt-1 block">14.3 kWh</span>
        </div>
        <div className="glass-card p-4">
          <span className="text-[10px] text-slate-400 block uppercase">Verified Events</span>
          <span className="text-2xl font-black text-cyan-300 mt-1 block">27</span>
        </div>
        <div className="glass-card p-4">
          <span className="text-[10px] text-slate-400 block uppercase">Actions Done</span>
          <span className="text-2xl font-black text-white mt-1 block">19</span>
        </div>
      </div>

      {/* Before vs After Visual Progress Comparison */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Before vs After Action Comparison</h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>BEFORE ACTION</span>
              <span className="font-bold text-white">90 W</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full" style={{ width: '90%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-emerald-400 mb-1">
              <span>AFTER ACTION (SLEEP MODE)</span>
              <span className="font-bold">55 W</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '55%' }} />
            </div>
          </div>
        </div>
        <div className="text-xs text-emerald-300 font-bold pt-2 border-t border-white/5">
          Reduction: -35 W (38.9%) • Energy Saved: 0.175 kWh
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. RESEARCH EVALUATION VIEW (Section 17)
// -------------------------------------------------------------
function ResearchEvaluationView({ metrics }) {
  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Academic Research Evaluation</h1>
          <p className="text-xs text-slate-400 mt-1">B.Tech CS Technical Viva Metrics & Baseline Comparison</p>
        </div>
        <span className="badge badge-amber">Demo / Placeholder</span>
      </div>

      {/* 4 ML Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] text-cyan-400 block uppercase">State Classification</span>
          <div className="text-2xl font-black text-white">94.2%</div>
          <div className="text-[10px] text-slate-400">F1 Score: 93.1%</div>
        </div>
        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] text-cyan-400 block uppercase">Expected Energy Model</span>
          <div className="text-2xl font-black text-emerald-400">4.8 W</div>
          <div className="text-[10px] text-slate-400">MAE (R²: 0.942)</div>
        </div>
        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] text-amber-400 block uppercase">Excess Detection</span>
          <div className="text-2xl font-black text-amber-400">91.5%</div>
          <div className="text-[10px] text-slate-400">FPR: 3.2%</div>
        </div>
        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] text-emerald-400 block uppercase">Cause Attribution</span>
          <div className="text-2xl font-black text-emerald-400">87.4%</div>
          <div className="text-[10px] text-slate-400">Accuracy Score</div>
        </div>
      </div>

      {/* Baseline Comparison Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Method A (Fixed Threshold) vs Method B (Proposed)</h3>
        <table className="w-full text-left text-xs divide-y divide-white/5">
          <thead>
            <tr className="text-slate-400 text-[11px]">
              <th className="pb-2">Metric</th>
              <th className="pb-2">Fixed Threshold (Method A)</th>
              <th className="pb-2 text-cyan-300">Proposed State-Specific (Method B)</th>
              <th className="pb-2 text-right text-emerald-400">Improvement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {metrics.baselineComparison.map((row, idx) => (
              <tr key={idx}>
                <td className="py-2.5 font-bold text-white">{row.metric}</td>
                <td className="py-2.5 text-slate-400">{row.methodA_FixedThreshold}</td>
                <td className="py-2.5 text-cyan-300 font-bold">{row.methodB_StateSpecific}</td>
                <td className="py-2.5 text-right text-emerald-400 font-bold">{row.improvement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 9. REPORTS VIEW (Section 21)
// -------------------------------------------------------------
function ReportsView({ devices, selectedDevice, causeData, beforeAfter, onShowToast }) {
  const handlePrint = () => {
    window.print();
    onShowToast('Preparing report print dialog...');
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Device,State,ActualPowerW,ExpectedPowerW,ExcessPowerW,Status\n' +
      devices
        .map((d) => `"${d.name}",${d.currentState},${d.currentPowerW},${d.expectedPowerW},${d.excessPowerW},${d.status}`)
        .join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'Energy_Advisor_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('CSV dataset exported successfully.');
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-white">Generate Energy Analysis Report</h1>
          <p className="text-xs text-slate-400 mt-1">Audit report preview and dataset export.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary">
            🖨️ Generate PDF / Print
          </button>
          <button onClick={handleExportCSV} className="btn-primary">
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Printable Paper Card */}
      <div className="glass-card p-8 space-y-6 text-xs">
        <div className="border-b border-white/10 pb-4 flex justify-between">
          <div>
            <div className="text-[10px] text-cyan-400 uppercase font-bold">B.TECH CS RESEARCH PROJECT</div>
            <div className="text-xl font-black text-white">ENERGY ADVISOR AUDIT REPORT</div>
          </div>
          <div className="text-right text-slate-400">
            <div>Ref: EA-RES-2026-0928</div>
            <div>Node: {selectedDevice.esp32NodeId}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900/60 rounded">
            <span className="text-slate-400 text-[10px] block">DEVICE</span>
            <span className="font-bold text-white">{selectedDevice.name}</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded">
            <span className="text-slate-400 text-[10px] block">ACTUAL POWER</span>
            <span className="font-bold text-red-400">{selectedDevice.currentPowerW} W</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded">
            <span className="text-slate-400 text-[10px] block">EXPECTED BASELINE</span>
            <span className="font-bold text-cyan-400">{selectedDevice.expectedPowerW} W</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded">
            <span className="text-slate-400 text-[10px] block">EXCESS POWER</span>
            <span className="font-bold text-amber-400">+{selectedDevice.excessPowerW} W</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 rounded space-y-2">
          <div className="font-bold text-white">Probable Cause: {causeData.probableCause} ({causeData.confidencePercent}%)</div>
          <div className="text-slate-300">Action: Enable automatic sleep mode after 10 min inactivity.</div>
          <div className="text-emerald-400 font-bold">Measured Reduction: -35 W (38.9%) | 0.175 kWh Saved</div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 10. SETTINGS VIEW (Section 24)
// -------------------------------------------------------------
function SettingsView({ isDemoMode, setIsDemoMode, onSave }) {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 mt-1">Configure ML baseline bounds and ESP32 telemetry endpoints.</p>
        </div>
        <button onClick={onSave} className="btn-primary">
          Save Settings
        </button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase">Demo Mode</h3>
        <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl">
          <div>
            <div className="font-bold text-white">Synthetic Telemetry Stream</div>
            <div className="text-slate-400 text-[11px]">Simulates realistic Desktop PC idle anomaly (43W vs 92W).</div>
          </div>
          <input
            type="checkbox"
            checked={isDemoMode}
            onChange={(e) => setIsDemoMode(e.target.checked)}
            className="cursor-pointer accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}

// Mount the React Application
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
