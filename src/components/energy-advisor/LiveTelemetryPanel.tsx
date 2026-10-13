import React, { useState } from 'react';
import { Activity, Cpu, Gauge, RefreshCw, Radio, Server, Signal, Thermometer, Vibrate, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Device } from '@/lib/energy-advisor-research';

interface Props {
  device?: Device;
  syncSeconds?: number;
}

export function LiveTelemetryPanel({
  device,
  syncSeconds = 2,
}: Props) {
  const [activeNodeTab, setActiveNodeTab] = useState<'node-01' | 'node-02' | 'node-03'>('node-01');

  // Fallback defaults if no device supplied
  const voltage = device?.voltageV ?? 230.2;
  const current = device?.currentA ?? 0.40;
  const power = device?.currentPowerW ?? 92;
  const energy = device?.todayEnergyKWh ?? 3.42;
  const temperature = device?.temperatureC ?? 31.4;
  const vibration = device?.vibrationG ?? 0.08;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d131f] p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-tight">
              ESP32 Live Telemetry Stream
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            Direct high-frequency sensor readings via embedded edge nodes
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
            ONLINE
          </Badge>
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <RefreshCw className="h-3 w-3 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            Sync: {syncSeconds}s ago
          </span>
        </div>
      </div>

      {/* Node selector tabs */}
      <div className="flex items-center gap-2 mb-4 font-mono text-xs">
        {[
          { id: 'node-01', label: 'ESP32 NODE 01 (Workstations)', status: 'Active' },
          { id: 'node-02', label: 'ESP32 NODE 02 (Laptops)', status: 'Active' },
          { id: 'node-03', label: 'ESP32 NODE 03 (HVAC/Fans)', status: 'Active' },
        ].map((node) => (
          <button
            key={node.id}
            onClick={() => setActiveNodeTab(node.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              activeNodeTab === node.id
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {node.label}
          </button>
        ))}
      </div>

      {/* 6 Core Physical Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Voltage</span>
          <span className="text-base font-bold text-white mt-1 block">
            {activeNodeTab === 'node-01' ? `${voltage} V` : activeNodeTab === 'node-02' ? '229.8 V' : '231.0 V'}
          </span>
          <span className="text-[9px] text-emerald-400 block mt-0.5">AC RMS Grid</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current</span>
          <span className="text-base font-bold text-white mt-1 block">
            {activeNodeTab === 'node-01' ? `${current} A` : activeNodeTab === 'node-02' ? '0.37 A' : '0.26 A'}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">CT Sensor</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-red-500/20">
          <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold">Power</span>
          <span className="text-base font-bold text-red-400 mt-1 block">
            {activeNodeTab === 'node-01' ? `${power} W` : activeNodeTab === 'node-02' ? '86 W' : '61 W'}
          </span>
          <span className="text-[9px] text-red-400/80 block mt-0.5">Active Real</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Energy Today</span>
          <span className="text-base font-bold text-cyan-400 mt-1 block">
            {activeNodeTab === 'node-01' ? `${energy} kWh` : activeNodeTab === 'node-02' ? '2.15 kWh' : '1.88 kWh'}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Cumulative</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Temperature</span>
          <span className="text-base font-bold text-slate-200 mt-1 block">
            {activeNodeTab === 'node-01' ? `${temperature} °C` : activeNodeTab === 'node-02' ? '42.1 °C' : '28.6 °C'}
          </span>
          <span className="text-[9px] text-emerald-400 block mt-0.5">DS18B20 Probe</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Vibration</span>
          <span className="text-base font-bold text-slate-200 mt-1 block">
            {activeNodeTab === 'node-01' ? `${vibration} g` : activeNodeTab === 'node-02' ? '0.12 g' : '0.45 g'}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">MPU6050 3-Axis</span>
        </div>
      </div>
    </div>
  );
}
