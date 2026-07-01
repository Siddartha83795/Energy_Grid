import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Activity,
  Thermometer,
  Radio,
  ShieldAlert,
  Zap,
  Volume2,
  TrendingUp,
  Wind,
  Gauge,
  Users,
  Lightbulb,
  ToggleRight,
  Wifi,
  Power,
  Settings,
  Cpu,
} from "lucide-react";
import { getSensorReadings } from "@/lib/new-features.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/multi-signal")({
  head: () => ({ meta: [{ title: "Multi-Signal Check — Energy Advisor" }] }),
  component: MultiSignalPage,
});

function MultiSignalPage() {
  const getSensors = useServerFn(getSensorReadings);
  const queryClient = useQueryClient();
  const [simulating, setSimulating] = useState(false);

  const { data: sensors, isLoading, error } = useQuery({
    queryKey: ["sensorReadings"],
    queryFn: () => getSensors(),
  });

  const hasEspData = sensors?.some((s) => s.updated_at !== null && s.updated_at !== undefined) || false;

  const simulateEspPost = async () => {
    setSimulating(true);
    try {
      const response = await fetch("/api/iot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machine_id: "CNC_Mill_1",
          temperature: 28.5 + Math.random() * 5,
          vibration_db: 36.2 + Math.random() * 8,
          kwh: 0.15 + Math.random() * 0.2,
          status: "Active operation (Hardware stream)",
          power_factor: 0.95,
          harmonics_thd_pct: 2.1,
          acoustic_db: 78.0,
          current_signature: "loaded-draw",
          compressed_air_pressure_bar: 6.8,
          compressed_air_flow_rate: 6.2,
          hvac_occupancy: true,
          lux_level: 320.0,
          water_flow_rate: 4.8,
          limit_switch: "Active (Closed)",
          operator_beacon: "Present",
          protocol: "Modbus TCP (ESP32)",
          actuator_relay: "ON",
          vfd_speed_pct: 82.0,
        }),
      });

      if (response.ok) {
        toast.success("ESP32 telemetry stream simulation successful!");
        queryClient.invalidateQueries({ queryKey: ["sensorReadings"] });
      } else {
        toast.error("Failed to stream ESP32 telemetry");
      }
    } catch (e) {
      toast.error("Error simulating ESP32 stream");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" /> Multi-Signal Check
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Multi-Modal Sensor Fusion — Dynamic readings from CT clamps, vibration accelerometers, acoustics, air flow meters, and limit switches validating electrical waste states.
        </p>
      </header>

      {/* ESP32 Hardware Connector Section */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
            <Cpu className="h-5 w-5 animate-pulse" /> ESP32 Hardware Connector
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect physical hardware nodes (such as ESP32 boards equipped with CT clamps/sensors) directly to the system. Stream telemetry logs in real-time to the API endpoint to update analysis dashboards and forecasting predictions.
          </p>
          <div className="text-xs font-mono bg-muted p-3 rounded-lg border flex flex-col gap-1.5 text-muted-foreground overflow-x-auto">
            <div><strong className="text-foreground">POST URL:</strong> {typeof window !== "undefined" ? `${window.location.origin}/api/iot` : "/api/iot"}</div>
            <div><strong className="text-foreground">Headers:</strong> Content-Type: application/json</div>
            <div><strong className="text-foreground">Payload shape:</strong> {"{ \"machine_id\": \"CNC_Mill_1\", \"temperature\": 27.5, \"vibration_db\": 35.0, \"kwh\": 0.25, \"status\": \"Active\" }"}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 shrink-0 w-full md:w-auto">
          <Button onClick={simulateEspPost} disabled={simulating} className="w-full md:w-auto">
            {simulating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Simulating Stream…
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" /> Simulate ESP32 Stream
              </>
            )}
          </Button>
          <div className="text-center md:text-right text-[11px] text-muted-foreground">
            Connection Status:{" "}
            {hasEspData ? (
              <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 justify-center md:justify-end inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Connected (Live Telemetry)
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold inline-flex">
                Awaiting Hardware Connection
              </span>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching sensor telemetry…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border bg-card p-6 text-destructive text-center max-w-md mx-auto">
          <ShieldAlert className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Failed to load sensor readings</h2>
          <p className="text-sm text-muted-foreground mt-1">Please try reloading the page.</p>
        </div>
      )}

      {sensors && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors.map((s) => {
            const isFault = s.status.includes("stuck-on");
            const isIdleWaste = s.status.includes("idle waste");
            const isActive = s.status.includes("Active");

            return (
              <div
                key={s.machine_id}
                className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{s.machine_id}</h3>
                      <span className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                        Protocol: {s.protocol}
                      </span>
                    </div>
                    <Badge
                      variant={isFault ? "destructive" : isIdleWaste ? "secondary" : "default"}
                      className={
                        isFault
                          ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                          : isIdleWaste
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                      }
                    >
                      {s.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-4 text-xs">
                    {/* Category 1: Electrical Sensing */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Electrical Sensing</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Zap className="h-3.5 w-3.5 text-yellow-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Power Factor</div>
                            <div className="font-semibold">{s.power_factor.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Activity className="h-3.5 w-3.5 text-purple-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Harmonics THD</div>
                            <div className="font-semibold">{s.harmonics_thd_pct.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category 2: Condition Monitoring */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Condition Monitoring</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Temp</div>
                            <div className="font-semibold">{s.temperature.toFixed(1)} °C</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Radio className="h-3.5 w-3.5 text-blue-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Vibration</div>
                            <div className="font-semibold">{s.vibration_db.toFixed(1)} dB</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Volume2 className="h-3.5 w-3.5 text-teal-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Acoustics</div>
                            <div className="font-semibold">{s.acoustic_db.toFixed(0)} dB</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Load State</div>
                            <div className="font-semibold capitalize">{s.current_signature}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category 3: Environmental & Aux */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Environmental & Aux</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Wind className="h-3.5 w-3.5 text-sky-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Air Flow</div>
                            <div className="font-semibold">{s.compressed_air_flow_rate.toFixed(1)} m³/m</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Gauge className="h-3.5 w-3.5 text-cyan-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Air Press.</div>
                            <div className="font-semibold">{s.compressed_air_pressure_bar.toFixed(1)} bar</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Users className="h-3.5 w-3.5 text-emerald-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Occupancy</div>
                            <div className="font-semibold">{s.hvac_occupancy ? "Active" : "Vacant"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Lux Level</div>
                            <div className="font-semibold">{s.lux_level.toFixed(0)} lux</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category 4: Context & Actuation */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">State & Actuation</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <ToggleRight className="h-3.5 w-3.5 text-rose-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Limit Switch</div>
                            <div className="font-semibold truncate">{s.limit_switch}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Wifi className="h-3.5 w-3.5 text-blue-400" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">BLE Beacon</div>
                            <div className="font-semibold">{s.operator_beacon}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Power className="h-3.5 w-3.5 text-lime-500" />
                          <div>
                            <div className="text-[9px] text-muted-foreground">Actuator Relay</div>
                            <div className="font-semibold">{s.actuator_relay}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded border border-dashed">
                          <Settings className="h-3.5 w-3.5 text-gray-500 animate-spin" style={{ animationDuration: '6s' }} />
                          <div>
                            <div className="text-[9px] text-muted-foreground">VFD Speed</div>
                            <div className="font-semibold">{s.vfd_speed_pct.toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
