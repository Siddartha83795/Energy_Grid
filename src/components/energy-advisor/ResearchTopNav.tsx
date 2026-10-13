import React from 'react';
import { useEnergyAdvisor } from '@/lib/energy-advisor-context';
import { Activity, Bell, Cpu, Radio, Search, Shield, Sparkles, SwitchCamera, User, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Link } from '@tanstack/react-router';

export function ResearchTopNav() {
  const { isDemoMode, setIsDemoMode, searchQuery, setSearchQuery, liveLastSyncSeconds, alerts } = useEnergyAdvisor();

  const unreadAlertsCount = alerts.filter((a) => a.status === 'UNREAD').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070b14]/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="h-full w-full bg-[#090e18] rounded-[10px] grid place-items-center text-cyan-400">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-white tracking-tight font-display">
                ENERGY ADVISOR
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                RESEARCH PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Context-Aware Energy Monitoring, Excess Energy Detection & Energy-Saving Analysis
            </p>
          </div>
        </div>

        {/* Center search */}
        <div className="flex-1 max-w-md mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices, nodes, or operating states..."
              className="h-9 pl-9 pr-4 bg-slate-900/80 border-white/10 text-xs font-mono text-white placeholder:text-slate-500 focus:border-cyan-500 rounded-xl w-full"
            />
          </div>
        </div>

        {/* Right status pills & toggles */}
        <div className="flex items-center gap-3 shrink-0 justify-between lg:justify-end">
          {/* Real-time Monitoring indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5 font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">Real-time Monitoring</span>
            <span className="text-emerald-400 font-bold text-[10px]">LIVE</span>
          </div>

          {/* Demo Mode Switch */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5 font-mono text-xs">
            <span className="text-[11px] text-slate-400">Demo Mode:</span>
            <Switch
              checked={isDemoMode}
              onCheckedChange={setIsDemoMode}
              className="data-[state=checked]:bg-cyan-500"
            />
            {isDemoMode && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/40 text-[9px] px-1.5 py-0">
                DEMO DATA
              </Badge>
            )}
          </div>

          {/* Alerts count */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl bg-slate-900/80 border border-white/5 text-slate-300 hover:text-white relative cursor-pointer"
          >
            <Link to="/cause-analysis">
              <Bell className="h-4 w-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-mono grid place-items-center font-bold">
                  {unreadAlertsCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
