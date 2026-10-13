import React, { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Network,
  Zap,
  Flame,
  Gauge,
  IndianRupee,
  Cpu,
  RefreshCw,
  Info,
  Server,
  Activity,
  Plus,
  Monitor,
  Copy,
  Check,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getConnectedSystemsFn,
  registerComputerNodeFn,
  ConnectedSystemNode,
  ConnectedSystemsSummary,
} from "@/lib/connected-systems.functions";
import { NetworkNode } from "@/components/NetworkNode";
import { NodeDetailDrawer } from "@/components/NodeDetailDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Calculate radial node positions around central hub (center at x=500, y=280)
function getRadialPosition(index: number, total: number, radiusX = 360, radiusY = 200) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const x = 500 + radiusX * Math.cos(angle);
  const y = 280 + radiusY * Math.sin(angle);
  return { x, y };
}

export function ConnectedSystemsSection() {
  const [nodes, setNodes] = useState<ConnectedSystemNode[]>([]);
  const [summary, setSummary] = useState<ConnectedSystemsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<ConnectedSystemNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Registration Modal State
  const [registerOpen, setRegisterOpen] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const fetchSystemsFn = useServerFn(getConnectedSystemsFn);
  const registerNodeFn = useServerFn(registerComputerNodeFn);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchSystemsFn();
      setNodes(res.nodes);
      setSummary(res.summary);
    } catch (err) {
      console.error("Failed to load connected systems:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-poll telemetry every 8 seconds for live Task-Manager updates
    const interval = setInterval(() => {
      fetchSystemsFn().then((res) => {
        setNodes(res.nodes);
        setSummary(res.summary);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // GSAP ScrollTrigger Entrance Reveal Animation
  useEffect(() => {
    if (!loading && nodes.length > 0 && graphContainerRef.current) {
      gsap.registerPlugin(ScrollTrigger);

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!prefersReducedMotion) {
        const nodeEls = graphContainerRef.current.querySelectorAll(".network-node-item");
        const lines = graphContainerRef.current.querySelectorAll(".network-connection-line");

        gsap.fromTo(
          nodeEls,
          { opacity: 0, scale: 0.8, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: graphContainerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );

        gsap.fromTo(
          lines,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            stagger: 0.03,
            ease: "power2.out",
            scrollTrigger: {
              trigger: graphContainerRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }
  }, [loading, nodes.length]);

  const handleSelectNode = (node: ConnectedSystemNode) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const handleRegisterNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim() || registering) return;

    setRegistering(true);
    try {
      const res = await registerNodeFn({
        data: {
          name: nodeName,
          location: locationName || "Office Workstation",
          connection_type: "wired",
        },
      });

      if (res.success) {
        setRegisteredToken(res.device_token);
        toast.success(`Node '${res.node.name}' registered!`);
        await loadData();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register node");
    } finally {
      setRegistering(false);
    }
  };

  const copyToken = () => {
    if (registeredToken) {
      navigator.clipboard.writeText(registeredToken);
      setCopied(true);
      toast.success("Device token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hubCenterX = 500;
  const hubCenterY = 280;

  return (
    <div ref={sectionRef} className="space-y-6 my-10">
      {/* Section Title & Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
                Connected Systems Map
              </h2>
              <p className="text-xs text-slate-400">
                Unified topology: Industrial Machines & OS Computer Telemetry (Task Manager Metrics)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Register Computer Node Dialog */}
          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Computer Node
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-amber-400" /> Register Computer Node
                </DialogTitle>
              </DialogHeader>

              {registeredToken ? (
                <div className="space-y-4 py-3">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <span className="text-slate-400 font-mono text-[11px] block">
                      Generated Device Secret Token:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-950 px-3 py-2 rounded-lg text-amber-300 font-mono text-xs overflow-x-auto border border-amber-500/30">
                        {registeredToken}
                      </code>
                      <Button size="icon" variant="outline" onClick={copyToken} className="h-9 w-9">
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed font-mono">
                    Run agent on target machine:
                    <code className="block text-amber-300 mt-1">
                      python agent/energyiq-agent.py --token {registeredToken}
                    </code>
                  </div>

                  <Button
                    onClick={() => {
                      setRegisteredToken(null);
                      setNodeName("");
                      setLocationName("");
                      setRegisterOpen(false);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-xs"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegisterNode} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono uppercase text-slate-300">
                      Computer / Hostname *
                    </Label>
                    <Input
                      placeholder="e.g. CAD-Workstation-04"
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                      required
                      className="bg-slate-900 border-slate-800 text-white placeholder-slate-500 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-mono uppercase text-slate-300">
                      Location / Office Bay
                    </Label>
                    <Input
                      placeholder="e.g. Engineering Office - Desk 14"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="bg-slate-900 border-slate-800 text-white placeholder-slate-500 text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={registering}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                  >
                    {registering ? "Generating Token..." : "Register & Issue Token"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Aggregate Summary Cards Bar */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Combined Power Draw */}
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Combined Power Draw</span>
                <Zap className="w-4 h-4 text-sky-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-sky-400">
                {(summary.total_power_draw_w / 1000).toFixed(1)} kW
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Across {summary.total_connected} active machines & compute nodes
              </p>
            </CardContent>
          </Card>

          {/* Total Estimated Heat Output */}
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Estimated Heat Output</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {(summary.total_heat_output_w / 1000).toFixed(1)} kW
              </div>
              <p className="text-[10px] text-amber-400/80 mt-1 uppercase font-mono">
                * Derived Thermal Dissipation
              </p>
            </CardContent>
          </Card>

          {/* Efficiency Spectrum Comparison */}
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Efficiency Spectrum</span>
                <Gauge className="w-4 h-4 text-[#33D6A6]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[120px]">
                  Highest: {summary.highest_efficiency_node.name.split(" ")[0]}
                </span>
                <span className="font-mono font-bold text-[#33D6A6]">
                  {summary.highest_efficiency_node.score}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[120px]">
                  Lowest: {summary.lowest_efficiency_node.name.split(" ")[0]}
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {summary.lowest_efficiency_node.score}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Potential Monthly Savings */}
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Est. Reclaimable Savings</span>
                <IndianRupee className="w-4 h-4 text-[#33D6A6]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-[#33D6A6]">
                ₹{summary.potential_monthly_savings_inr.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">If idle shutdowns are activated</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Network Map Visualizer */}
      <Card className="bg-slate-950/80 border-slate-800 backdrop-blur-xl relative overflow-hidden">
        {/* Background Grid Graphic */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <CardContent className="p-6">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-mono uppercase tracking-wider">
                Scanning Industrial Gateway & OS Telemetry Nodes...
              </span>
            </div>
          ) : (
            <>
              {/* DESKTOP RADIAL NETWORK GRAPH LAYOUT (Hidden on Mobile) */}
              <div
                ref={graphContainerRef}
                className="hidden md:block relative w-full h-[560px] overflow-hidden select-none"
              >
                {/* SVG Line Connections Canvas */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 560">
                  {nodes.map((node, i) => {
                    const pos = getRadialPosition(i, nodes.length);
                    const isWireless = node.connection_type === "iot_wireless";
                    const isOffline = node.status === "offline";

                    return (
                      <line
                        key={`line-${node.id}`}
                        x1={hubCenterX}
                        y1={hubCenterY}
                        x2={pos.x}
                        y2={pos.y}
                        stroke={
                          isOffline
                            ? "rgba(100, 116, 139, 0.25)"
                            : isWireless
                            ? "rgba(245, 158, 11, 0.6)"
                            : "rgba(56, 189, 248, 0.6)"
                        }
                        strokeWidth={isWireless ? "2" : "2.5"}
                        strokeDasharray={isWireless ? "6 6" : "none"}
                        className={`network-connection-line ${
                          isWireless && !isOffline ? "animate-[dash_20s_linear_infinite]" : ""
                        }`}
                      />
                    );
                  })}
                </svg>

                {/* Central Hub Node: EnergyIQ Gateway */}
                <div
                  style={{ left: `${hubCenterX - 75}px`, top: `${hubCenterY - 45}px` }}
                  className="absolute z-30 p-4 rounded-2xl border-2 border-amber-400 bg-slate-900/95 text-center shadow-[0_0_35px_rgba(245,158,11,0.35)] flex flex-col items-center justify-center min-w-[150px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-1.5 animate-pulse">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-100 font-serif block">
                    EnergyIQ Gateway
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Central Hub • 100%</span>
                </div>

                {/* Surrounding System Nodes (Machines + Computer Nodes) */}
                {nodes.map((node, i) => {
                  const pos = getRadialPosition(i, nodes.length);
                  return (
                    <NetworkNode
                      key={node.id}
                      node={node}
                      isSelected={selectedNode?.id === node.id}
                      onSelect={handleSelectNode}
                      style={{
                        left: `${pos.x - 65}px`,
                        top: `${pos.y - 35}px`,
                      }}
                      className="network-node-item"
                    />
                  );
                })}
              </div>

              {/* MOBILE RESPONSIVE CARD LIST REFLOW (Shown on Small Screens) */}
              <div className="block md:hidden space-y-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Tap any node card below to inspect Task Manager OS metrics.</span>
                </div>

                {nodes.map((node) => (
                  <NetworkNode
                    key={`mobile-${node.id}`}
                    node={node}
                    isMobileList={true}
                    isSelected={selectedNode?.id === node.id}
                    onSelect={handleSelectNode}
                  />
                ))}
              </div>

              {/* Network Legend Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-0.5 bg-sky-400 inline-block" />
                    <span>Wired (Continuous)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-0.5 border-b-2 border-dashed border-amber-400 inline-block" />
                    <span>IoT Wireless</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-sky-400" />
                    <span>Computer OS Telemetry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Action Needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <span>Offline / Not Reporting</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  Showing {nodes.length} Monitored Nodes
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Node Detail Side Drawer */}
      <NodeDetailDrawer
        node={selectedNode}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
