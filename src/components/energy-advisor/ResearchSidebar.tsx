import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Cpu,
  LineChart,
  HelpCircle,
  Lightbulb,
  TrendingDown,
  FileText,
  Settings,
  GraduationCap,
  Layers,
  Sparkles,
  Server,
  Zap,
  Split,
  BookOpen,
  Database,
  Sliders,
  FlaskConical,
  Scale,
  Activity,
  History,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';

export const IEEE_EXPERIMENT_NAV_ITEMS = [
  { to: '/experiment-runner', label: 'Experiment Runner', icon: Play, badge: 'Exp 1–4' },
  { to: '/expected-energy-comparison', label: 'Exp 1: Expected Energy', icon: LineChart, badge: 'Tab III' },
  { to: '/ledger-validation', label: 'Exp 2: Ledger Validation', icon: Layers, badge: 'Tab IV' },
  { to: '/counterfactual-validation', label: 'Exp 3: Counterfactual', icon: Split, badge: 'Tab V' },
  { to: '/recommendation-effectiveness', label: 'Exp 4: Recommendations', icon: Lightbulb, badge: 'Tab VI' },
  { to: '/statistical-analysis', label: 'Statistical Tests', icon: Scale },
  { to: '/latex-export', label: 'IEEE LaTeX Export', icon: FileText, badge: '.tex' },
] as const;

export const PRIMARY_RESEARCH_NAV_ITEMS = [
  { to: '/research-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: Server },
  { to: '/energy-analysis', label: 'Energy Analysis', icon: LineChart },
  { to: '/excess-ledger', label: 'Excess Energy Ledger', icon: Layers, badge: 'Contrib 1' },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/interventions', label: 'Interventions', icon: History },
  { to: '/counterfactual-analysis', label: 'Counterfactual Analysis', icon: Split, badge: 'Contrib 2' },
  { to: '/experiments', label: 'Experiments (Lab)', icon: FlaskConical },
  { to: '/datasets', label: 'Datasets & Quality', icon: Database },
  { to: '/models', label: 'Models & Ablation', icon: Sliders },
  { to: '/research-results', label: 'Research Results', icon: Scale },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

export const SECONDARY_RESEARCH_NAV_ITEMS = [
  { to: '/device-details', label: 'Device Details', icon: Cpu },
  { to: '/cause-analysis', label: 'Cause Multi-Signal', icon: HelpCircle },
  { to: '/energy-saving', label: 'Direct Telemetry Delta', icon: TrendingDown },
  { to: '/research-evaluation', label: 'Evaluation Metrics', icon: GraduationCap },
] as const;

export function ResearchSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { liveLastSyncSeconds } = useEnergyAdvisor();

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-white/10 bg-[#070b14] text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 shadow-md shadow-cyan-500/20">
          <div className="h-full w-full bg-[#090e18] rounded-[10px] grid place-items-center text-cyan-400">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight font-display">
            ENERGY ADVISOR
          </div>
          <div className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wide">
            RESEARCH PROTOTYPE
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
          <span>Paper Experiments</span>
          <span className="text-[9px] px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">IEEE</span>
        </div>
        {IEEE_EXPERIMENT_NAV_ITEMS.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-mono transition-all duration-150 border',
                active
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm font-semibold'
                  : 'border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
              )}
            >
              <div className="flex items-center gap-2.5">
                <it.icon className={cn('h-3.5 w-3.5', active ? 'text-cyan-400' : 'text-slate-400')} />
                <span>{it.label}</span>
              </div>
              {'badge' in it && it.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-2.5 px-3 py-1.5 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
          Core Research Navigation
        </div>
        {PRIMARY_RESEARCH_NAV_ITEMS.map((it) => {
          const active = pathname === it.to || (it.to === '/research-dashboard' && pathname === '/dashboard');
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-all duration-150 border',
                active
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm font-semibold'
                  : 'border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
              )}
            >
              <div className="flex items-center gap-2.5">
                <it.icon className={cn('h-4 w-4', active ? 'text-cyan-400' : 'text-slate-400')} />
                <span>{it.label}</span>
              </div>
              {'badge' in it && it.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 px-3 py-1.5 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
          Telemetry & Diagnostics
        </div>
        {SECONDARY_RESEARCH_NAV_ITEMS.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-mono transition-all duration-150 border',
                active
                  ? 'bg-slate-800/80 text-cyan-300 border-white/20'
                  : 'border-transparent text-slate-500 hover:bg-slate-900/40 hover:text-slate-300'
              )}
            >
              <it.icon className="h-3.5 w-3.5" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-white/10 bg-[#060910] text-[11px] font-mono space-y-1.5 shrink-0">
        <div className="flex items-center justify-between text-slate-400">
          <span>Research Mode:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CONTROLLED LAB
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>ESP32 Nodes:</span>
          <span className="text-cyan-300 font-semibold">3 Online (1 Simulator)</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 text-[10px]">
          <span>Telemetry Stream:</span>
          <span>Synced {liveLastSyncSeconds}s ago</span>
        </div>
      </div>
    </aside>
  );
}
