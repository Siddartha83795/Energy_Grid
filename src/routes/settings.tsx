import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';
import { ResearchTopNav } from '@/components/energy-advisor/ResearchTopNav';
import { ResearchSidebar } from '@/components/energy-advisor/ResearchSidebar';
import {
  Bell,
  CheckCircle2,
  Cpu,
  Database,
  Radio,
  RefreshCw,
  Save,
  Server,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const Route = createFileRoute('/settings')({
  head: () => ({
    meta: [{ title: 'System Settings & Telemetry Config — Energy Advisor' }],
  }),
  component: SettingsPage,
});

export function SettingsPage() {
  const { isDemoMode, setIsDemoMode } = useEnergyAdvisor();

  const [toleranceWatts, setToleranceWatts] = useState('5');
  const [minDurationMinutes, setMinDurationMinutes] = useState('15');
  const [confidenceThreshold, setConfidenceThreshold] = useState('85');
  const [esp32BrokerHost, setEsp32BrokerHost] = useState('mqtt://192.168.1.105:1883');
  const [samplingFrequencyHz, setSamplingFrequencyHz] = useState('1');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Research baseline parameters & ESP32 broker configurations saved successfully.');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <ResearchTopNav />

      <div className="flex-1 flex">
        <ResearchSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  System Settings & Telemetry Config
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Configure edge IoT nodes, ML expected-energy regression hyperparameters, and anomaly thresholds.
              </p>
            </div>

            <Button
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono h-9 cursor-pointer"
            >
              <Save className="h-4 w-4 mr-1.5" /> Save Configuration
            </Button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
            {/* Section 1: Demonstration & Simulator Mode */}
            <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Demo Mode & Synthetic Stream
                  </h3>
                </div>
                {isDemoMode && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px]">
                    DEMO DATA ACTIVE
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <div className="font-bold text-white">Enable Research Demonstration Data</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Feeds realistic laboratory Desktop PC idle anomaly (43W baseline vs 92W actual).
                  </div>
                </div>
                <Switch
                  checked={isDemoMode}
                  onCheckedChange={setIsDemoMode}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
            </div>

            {/* Section 2: ML Model Hyperparameters */}
            <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  State-Specific Expected Energy Model Bounds
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Baseline Tolerance Margin (±W)</label>
                  <Input
                    type="number"
                    value={toleranceWatts}
                    onChange={(e) => setToleranceWatts(e.target.value)}
                    className="bg-slate-900 border-white/10 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Allowable deviation before triggering potential excess.
                  </span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Minimum Anomaly Duration (Minutes)</label>
                  <Input
                    type="number"
                    value={minDurationMinutes}
                    onChange={(e) => setMinDurationMinutes(e.target.value)}
                    className="bg-slate-900 border-white/10 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Eliminates short transitory load spikes.
                  </span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Multi-Signal Confidence Threshold (%)</label>
                  <Input
                    type="number"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(e.target.value)}
                    className="bg-slate-900 border-white/10 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Requires &ge;85% sensor consensus to verify excess.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Hardware Nodes & Broker Config */}
            <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Radio className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  ESP32 Microcontroller & MQTT Telemetry Bus
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">MQTT / WebSocket Broker URI</label>
                  <Input
                    value={esp32BrokerHost}
                    onChange={(e) => setEsp32BrokerHost(e.target.value)}
                    className="bg-slate-900 border-white/10 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Local broker endpoint for ESP32 edge telemetry ingestion.
                  </span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Sampling Frequency (Hz)</label>
                  <Input
                    type="number"
                    value={samplingFrequencyHz}
                    onChange={(e) => setSamplingFrequencyHz(e.target.value)}
                    className="bg-slate-900 border-white/10 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    1 Hz = 1 reading / second per physical endpoint.
                  </span>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
