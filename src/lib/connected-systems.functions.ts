import { createServerFn } from "@tanstack/react-start";

export interface ComputerTelemetry {
  hostname: string;
  os_type: string;
  cpu_percent: number;
  cpu_freq_ghz: number;
  memory_used_gb: number;
  memory_total_gb: number;
  memory_percent: number;
  disk_percent: number;
  network_send_kbps: number;
  network_recv_kbps: number;
  gpu_percent?: number | null;
  gpu_temp_c?: number | null;
  reported_at: string;
}

export interface ConnectedSystemNode {
  id: string;
  name: string;
  type: "machine" | "computer" | "sensor_node";
  connection_type: "wired" | "iot_wireless";
  current_power_draw_w: number;
  estimated_heat_output_w: number; // Derived: power_draw * (1 - efficiency_score / 100)
  efficiency_score: number; // 0 - 100
  status: "active" | "idle" | "offline";
  last_reading_at: string;
  signal_strength?: number; // 0-100 for wireless
  today_kwh: number;
  location: string;
  device_token?: string;
  computer_telemetry?: ComputerTelemetry;
  recommendations: string[];
}

export interface ConnectedSystemsSummary {
  total_connected: number;
  max_capacity: number;
  total_power_draw_w: number;
  total_heat_output_w: number;
  highest_efficiency_node: { name: string; score: number };
  lowest_efficiency_node: { name: string; score: number };
  potential_monthly_savings_inr: number;
}

async function getAuthUserId(): Promise<string> {
  try {
    const { getSessionCookie } = await import("./auth-cookie.server");
    const { verifySession } = await import("./auth-session.server");
    const token = await getSessionCookie();
    if (!token) return "guest_user";
    const session = verifySession(token);
    return session?.userId || "guest_user";
  } catch {
    return "guest_user";
  }
}

// Default 10 Seed Connected System Nodes
const SEED_CONNECTED_SYSTEMS: ConnectedSystemNode[] = [
  {
    id: "node-1",
    name: "Main CNC Milling Center (Deckel Maho)",
    type: "machine",
    connection_type: "wired",
    current_power_draw_w: 14200,
    estimated_heat_output_w: 2556,
    efficiency_score: 82,
    status: "active",
    last_reading_at: new Date().toISOString(),
    today_kwh: 114.6,
    location: "Bay 1 - Heavy Machining",
    recommendations: [
      "Optimal spindle speed maintained during active cutting cycles.",
      "Consider dynamic power-capping during tool changeovers to reduce peak demand charges.",
    ],
  },
  {
    id: "node-2",
    name: "Edge AI Compute Cluster (Rack 01)",
    type: "computer",
    connection_type: "wired",
    device_token: "node-2-token-secret-88192",
    current_power_draw_w: 3800,
    estimated_heat_output_w: 342,
    efficiency_score: 91,
    status: "active",
    last_reading_at: new Date().toISOString(),
    today_kwh: 76.2,
    location: "Server Room B - High Density Rack",
    computer_telemetry: {
      hostname: "EdgeAI-Node01",
      os_type: "Linux (Ubuntu Server 24.04 LTS)",
      cpu_percent: 34.2,
      cpu_freq_ghz: 3.4,
      memory_used_gb: 48.6,
      memory_total_gb: 64.0,
      memory_percent: 75.9,
      disk_percent: 42.0,
      network_send_kbps: 1420.5,
      network_recv_kbps: 840.2,
      gpu_percent: 68.0,
      gpu_temp_c: 62.0,
      reported_at: new Date().toISOString(),
    },
    recommendations: [
      "Excellent PUE workload distribution across GPU compute nodes.",
      "Schedule non-urgent LLM inference batch jobs during off-peak tariff hours (11 PM - 5 AM).",
    ],
  },
  {
    id: "node-3",
    name: "Heavy Hydraulic Press #4",
    type: "machine",
    connection_type: "wired",
    current_power_draw_w: 22500,
    estimated_heat_output_w: 8100,
    efficiency_score: 64,
    status: "idle",
    last_reading_at: new Date().toISOString(),
    today_kwh: 182.4,
    location: "Stamping Yard 3",
    recommendations: [
      "High idle power draw detected (8.1 kW standby losses for over 45 minutes).",
      "Enable automated hydraulic pump sleep mode when idle duration exceeds 10 minutes.",
      "Estimated monthly savings: ₹28,400 if automated idle shutdown is activated.",
    ],
  },
  {
    id: "node-4",
    name: "Assembly Line Conveyor B",
    type: "machine",
    connection_type: "iot_wireless",
    current_power_draw_w: 5400,
    estimated_heat_output_w: 1188,
    efficiency_score: 78,
    status: "active",
    last_reading_at: new Date(Date.now() - 15000).toISOString(),
    signal_strength: 92,
    today_kwh: 44.1,
    location: "Final Assembly Hall",
    recommendations: [
      "VFD speed modulation is tracking line output smoothly.",
      "Check motor belt tension to resolve 4% parasitic friction loss.",
    ],
  },
  {
    id: "node-5",
    name: "SCADA Gateway Workstation",
    type: "computer",
    connection_type: "wired",
    device_token: "node-5-token-secret-19348",
    current_power_draw_w: 850,
    estimated_heat_output_w: 102,
    efficiency_score: 88,
    status: "active",
    last_reading_at: new Date().toISOString(),
    today_kwh: 18.5,
    location: "Control Tower Desk 2",
    computer_telemetry: {
      hostname: "SCADA-Tower-02",
      os_type: "Windows 11 Pro",
      cpu_percent: 18.4,
      cpu_freq_ghz: 2.8,
      memory_used_gb: 12.4,
      memory_total_gb: 32.0,
      memory_percent: 38.75,
      disk_percent: 31.0,
      network_send_kbps: 450.0,
      network_recv_kbps: 620.0,
      gpu_percent: 12.0,
      gpu_temp_c: 44.0,
      reported_at: new Date().toISOString(),
    },
    recommendations: [
      "System operating within normal thermal envelope.",
      "Enable display sleep after 15 minutes of operator inactivity.",
    ],
  },
  {
    id: "node-6",
    name: "Air Compressor Station Alpha",
    type: "machine",
    connection_type: "wired",
    current_power_draw_w: 18900,
    estimated_heat_output_w: 5481,
    efficiency_score: 71,
    status: "active",
    last_reading_at: new Date().toISOString(),
    today_kwh: 151.2,
    location: "Utilities Annex - Room 102",
    recommendations: [
      "Pneumatic pressure oscillation indicates minor line pressure leakage.",
      "Schedule acoustic ultrasonic leak detector audit on main distribution manifold.",
    ],
  },
  {
    id: "node-7",
    name: "Paint Booth HVAC Blower",
    type: "machine",
    connection_type: "iot_wireless",
    current_power_draw_w: 8200,
    estimated_heat_output_w: 3444,
    efficiency_score: 58,
    status: "idle",
    last_reading_at: new Date(Date.now() - 40000).toISOString(),
    signal_strength: 74,
    today_kwh: 68.8,
    location: "Coating Plant North",
    recommendations: [
      "Blower running at 100% fan capacity despite zero vehicle bodies inside booth.",
      "Interlock HVAC exhaust fan speed with door proximity sensor to throttle to 30% standby.",
    ],
  },
  {
    id: "node-8",
    name: "Control Room CAD Server",
    type: "computer",
    connection_type: "wired",
    device_token: "node-8-token-secret-77281",
    current_power_draw_w: 1200,
    estimated_heat_output_w: 60,
    efficiency_score: 95,
    status: "active",
    last_reading_at: new Date().toISOString(),
    today_kwh: 26.4,
    location: "Engineering Office Rack",
    computer_telemetry: {
      hostname: "CAD-Master-WS",
      os_type: "Windows Workstation 2024",
      cpu_percent: 14.5,
      cpu_freq_ghz: 3.8,
      memory_used_gb: 28.4,
      memory_total_gb: 128.0,
      memory_percent: 22.2,
      disk_percent: 48.0,
      network_send_kbps: 820.0,
      network_recv_kbps: 1100.0,
      gpu_percent: 24.0,
      gpu_temp_c: 51.0,
      reported_at: new Date().toISOString(),
    },
    recommendations: [
      "Top-tier power supply efficiency rating (80-Plus Titanium certified).",
      "Observed CPU idle < 5% during non-working hours; consider automated S3 sleep scheduling.",
    ],
  },
  {
    id: "node-9",
    name: "Robotic Welding Cell #2",
    type: "machine",
    connection_type: "iot_wireless",
    current_power_draw_w: 0,
    estimated_heat_output_w: 0,
    efficiency_score: 0,
    status: "offline",
    last_reading_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    signal_strength: 0,
    today_kwh: 52.0,
    location: "Body-in-White Line 2",
    recommendations: [
      "IoT telemetry node offline since 14 minutes ago.",
      "Check wireless mesh access point connectivity or breaker switch on Cell #2.",
    ],
  },
  {
    id: "node-10",
    name: "Chiller Water Pump Unit 3",
    type: "sensor_node",
    connection_type: "iot_wireless",
    current_power_draw_w: 7100,
    estimated_heat_output_w: 2201,
    efficiency_score: 69,
    status: "active",
    last_reading_at: new Date(Date.now() - 25000).toISOString(),
    signal_strength: 88,
    today_kwh: 59.5,
    location: "Cooling Tower Yard",
    recommendations: [
      "Delta-T cooling differential narrow; pump flow rate slightly elevated.",
      "Adjust chilled water setpoint from 6.5°C to 8.0°C to optimize compressor lift.",
    ],
  },
];

export const getConnectedSystemsFn = createServerFn({ method: "GET" }).handler(async () => {
  await getAuthUserId();

  try {
    const { getDb } = await import("./mongodb.server");
    const db = await getDb();

    // Fetch stored connected systems or initialize seed data if empty
    let nodes = await db.collection<ConnectedSystemNode>("connected_systems").find({}).toArray();

    if (!nodes || nodes.length === 0) {
      await db.collection("connected_systems").insertMany(SEED_CONNECTED_SYSTEMS as any);
      nodes = SEED_CONNECTED_SYSTEMS as any;
    }

    const nowMs = Date.now();

    // Sanitize MongoDB _id and evaluate real staleness
    const sanitizedNodes: ConnectedSystemNode[] = nodes.map((n) => {
      let isStale = false;
      if (n.last_reading_at) {
        const elapsedSec = (nowMs - new Date(n.last_reading_at).getTime()) / 1000;
        if (elapsedSec > 45) {
          isStale = true;
        }
      } else {
        isStale = true;
      }

      const status = n.status === "offline" || isStale ? "offline" : n.status;

      return {
        id: n.id || (n as any)._id?.toString(),
        name: n.name,
        type: n.type,
        connection_type: n.connection_type,
        device_token: n.device_token,
        current_power_draw_w: status === "offline" ? 0 : n.current_power_draw_w,
        estimated_heat_output_w:
          status === "offline"
            ? 0
            : (n.estimated_heat_output_w ??
              Math.round(n.current_power_draw_w * (1 - (n.efficiency_score || 70) / 100))),
        efficiency_score: status === "offline" ? 0 : n.efficiency_score,
        status: status,
        last_reading_at: n.last_reading_at,
        signal_strength: n.signal_strength,
        today_kwh: n.today_kwh || 0,
        location: n.location || "Main Facility Floor",
        computer_telemetry: n.computer_telemetry,
        recommendations: n.recommendations || [],
      };
    });

    // Calculate Summary Metrics
    const activeNodes = sanitizedNodes.filter((n) => n.status !== "offline");
    const totalPower = activeNodes.reduce((acc, n) => acc + n.current_power_draw_w, 0);
    const totalHeat = activeNodes.reduce((acc, n) => acc + n.estimated_heat_output_w, 0);

    const sortedByEff = [...activeNodes].sort((a, b) => b.efficiency_score - a.efficiency_score);
    const highestEff = sortedByEff[0] || { name: "N/A", efficiency_score: 100 };
    const lowestEff = sortedByEff[sortedByEff.length - 1] || { name: "N/A", efficiency_score: 0 };

    // Calculate estimated potential monthly savings from low-efficiency / idle nodes
    const potentialMonthlySavingsInr = activeNodes.reduce((acc, n) => {
      if (n.status === "idle" || n.efficiency_score < 70) {
        const excessWatts = n.current_power_draw_w * 0.35;
        const dailyKwh = (excessWatts * 10) / 1000;
        return acc + Math.round(dailyKwh * 30 * 9.5);
      }
      return acc;
    }, 0);

    const summary: ConnectedSystemsSummary = {
      total_connected: sanitizedNodes.length,
      max_capacity: 10,
      total_power_draw_w: totalPower,
      total_heat_output_w: totalHeat,
      highest_efficiency_node: { name: highestEff.name, score: highestEff.efficiency_score },
      lowest_efficiency_node: { name: lowestEff.name, score: lowestEff.efficiency_score },
      potential_monthly_savings_inr: potentialMonthlySavingsInr,
    };

    return {
      nodes: sanitizedNodes,
      summary,
    };
  } catch (error) {
    const activeNodes = SEED_CONNECTED_SYSTEMS.filter((n) => n.status !== "offline");
    const totalPower = activeNodes.reduce((acc, n) => acc + n.current_power_draw_w, 0);
    const totalHeat = activeNodes.reduce((acc, n) => acc + n.estimated_heat_output_w, 0);

    return {
      nodes: SEED_CONNECTED_SYSTEMS,
      summary: {
        total_connected: 10,
        max_capacity: 10,
        total_power_draw_w: totalPower,
        total_heat_output_w: totalHeat,
        highest_efficiency_node: { name: "Control Room CAD Server", score: 95 },
        lowest_efficiency_node: { name: "Paint Booth HVAC Blower", score: 58 },
        potential_monthly_savings_inr: 42500,
      },
    };
  }
});

// Admin Server Function to Register New Computer Node & Issue Secret Token
export const registerComputerNodeFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { name?: string; location?: string; connection_type?: string };
    if (!o.name) throw new Error("Computer node name is required");
    return {
      name: o.name.trim(),
      location: o.location ? o.location.trim() : "Main Office Floor",
      connection_type: (o.connection_type || "wired") as "wired" | "iot_wireless",
    };
  })
  .handler(async ({ data }) => {
    const { getDb } = await import("./mongodb.server");
    const db = await getDb();

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const id = `node-${Date.now().toString().slice(-4)}`;
    const deviceToken = `node-token-secret-${randomSuffix}`;

    const newNode: ConnectedSystemNode = {
      id,
      name: data.name,
      type: "computer",
      connection_type: data.connection_type,
      device_token: deviceToken,
      current_power_draw_w: 0,
      estimated_heat_output_w: 0,
      efficiency_score: 0,
      status: "offline",
      last_reading_at: "",
      today_kwh: 0,
      location: data.location,
      recommendations: [
        "Awaiting first report... Please run energyiq-agent.py with this node's token.",
      ],
    };

    await db.collection("connected_systems").insertOne(newNode as any);

    return {
      success: true,
      node: newNode,
      device_token: deviceToken,
      message: `Node '${data.name}' registered. Use device token to connect the Python agent.`,
    };
  });
