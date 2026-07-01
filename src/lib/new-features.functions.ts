import { createServerFn } from "@tanstack/react-start";

async function getAuthUserId(): Promise<string> {
  const { getSessionCookie } = await import("./auth-cookie.server");
  const { verifySession } = await import("./auth-session.server");
  const token = await getSessionCookie();
  if (!token) throw new Error("Unauthorized: No session token");
  const session = verifySession(token);
  if (!session || !session.userId) throw new Error("Unauthorized: Invalid session");
  return session.userId;
}

// -----------------
// 1. APPROVAL QUEUE (AGENTIC ACTION LAYER)
// -----------------
export const getActionQueue = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getAuthUserId();
  const { getDb } = await import("./mongodb.server");
  const db = await getDb();

  // Fetch logged actions
  let actions = await db.collection("action_log").find({ user_id: userId }).toArray();

  // If empty, let's detect some waste events from latest run and call Groq for root-cause analysis
  if (actions.length === 0) {
    const latestRun = await db
      .collection("runs")
      .findOne({ user_id: userId }, { sort: { created_at: -1 } });

    if (latestRun && latestRun.machines) {
      const key = process.env.GROQ_API_KEY;
      if (key) {
        // Find machines with high idle draw
        const offenders = latestRun.machines.filter(
          (m: any) => m.idle_kwh > 50 || m.utilization_pct < 70,
        );

        for (const off of offenders.slice(0, 3)) {
          const savings = off.idle_cost_inr;

          // Groq call to generate root cause reasoning
          const sysPrompt =
            "You are an industrial energy root-cause analyst. Return ONLY a single sentence explanation of why a machine was left running in standby mode.";
          const userPrompt = `Machine ${off.machine_name} has idle consumption of ${off.idle_kwh.toFixed(1)} kWh, representing ${off.utilization_pct.toFixed(1)}% utilization and ₹${savings.toFixed(0)} waste cost. State a plausible causal explanation (e.g. operator forgot checklist, scheduled maintenance overrun).`;

          let rootCause = "Operator left machine on standby during shift changeover.";
          try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                messages: [
                  { role: "system", content: sysPrompt },
                  { role: "user", content: userPrompt },
                ],
              }),
            });
            if (res.ok) {
              const resJson = (await res.json()) as any;
              rootCause = resJson.choices?.[0]?.message?.content?.trim() || rootCause;
            }
          } catch (e) {
            console.error("Root-cause generation failed:", e);
          }

          // Action agent logic: high-impact (savings >= 500) requires approval
          const isHighImpact = savings >= 500;

          await db.collection("action_log").insertOne({
            user_id: userId,
            timestamp: new Date(),
            machine_id: off.machine_name,
            issue: `Excessive standby draw (${off.idle_kwh.toFixed(0)} kWh)`,
            action: isHighImpact
              ? "Power down main breaker switch and cooling pump"
              : "Send automatic low-power standby command",
            estimated_weekly_savings_inr: savings / 4,
            root_cause: rootCause,
            status: isHighImpact ? "pending" : "auto-suggested",
            created_at: new Date(),
          });
        }

        actions = await db.collection("action_log").find({ user_id: userId }).toArray();
      }
    }
  }

  return actions.map((act) => ({
    id: act._id.toString(),
    machine_id: act.machine_id,
    issue: act.issue,
    action: act.action,
    estimated_weekly_savings_inr: act.estimated_weekly_savings_inr,
    root_cause: act.root_cause,
    status: act.status,
    timestamp: act.timestamp,
  }));
});

export const updateActionStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { actionId: string; status: "approved" | "rejected" };
    if (!o.actionId || !o.status) throw new Error("Missing arguments");
    return o;
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const { getDb } = await import("./mongodb.server");
    const { ObjectId } = await import("mongodb");
    const db = await getDb();

    await db
      .collection("action_log")
      .updateOne(
        { _id: new ObjectId(data.actionId), user_id: userId },
        { $set: { status: data.status, updated_at: new Date() } },
      );

    return { success: true };
  });

// -----------------
// 2. PREDICTIVE FORECASTING
// -----------------
export const getForecastData = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getAuthUserId();
  const { getDb } = await import("./mongodb.server");
  const db = await getDb();

  const entries = await db.collection("energy_entries").find({ user_id: userId }).toArray();
  if (entries.length === 0) return { machines: [], forecasts: [] };

  // Calculate historical idle probability per hour (0-23) for each machine
  const hourlyStats = new Map<string, { totals: number[]; idles: number[] }>();

  entries.forEach((e) => {
    const m = e.machine_name || "Unknown";
    if (!hourlyStats.has(m)) {
      hourlyStats.set(m, {
        totals: new Array(24).fill(0),
        idles: new Array(24).fill(0),
      });
    }

    // Parse hour
    let hr = 0;
    if (e.recorded_at) {
      hr = new Date(e.recorded_at).getHours();
    } else if (e.entry_date) {
      hr = 12; // default middle of day
    }

    const stats = hourlyStats.get(m)!;

    if (e.kind === "daily") {
      stats.totals[hr] += Number(e.total_kwh ?? 0);
      stats.idles[hr] += Number(e.idle_kwh ?? 0);
    } else {
      const k = Number(e.kwh ?? 0);
      stats.totals[hr] += k;
      if (e.status === "idle") {
        stats.idles[hr] += k;
      }
    }
  });

  const machines = Array.from(hourlyStats.keys());
  const forecasts: any[] = [];

  // Project next 24 hours starting from now
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hr = futureTime.getHours();

    machines.forEach((mach) => {
      const stats = hourlyStats.get(mach)!;
      const total = stats.totals[hr];
      const idle = stats.idles[hr];

      const prob = total > 0 ? idle / total : 0.15 + Math.random() * 0.1;
      const idlePct = Math.min(100, prob * 100);

      let risk: "Low" | "Medium" | "High" = "Low";
      if (idlePct > 60) risk = "High";
      else if (idlePct > 30) risk = "Medium";

      forecasts.push({
        timestamp: futureTime.toISOString(),
        hour: `${String(hr).padStart(2, "0")}:00`,
        machine_name: mach,
        forecasted_idle_pct: Math.round(idlePct),
        risk_rating: risk,
      });
    });
  }

  return { machines, forecasts };
});

// -----------------
// 3. CARBON & COST IMPACT (RENEWABLE / TARIFF OPTIMIZATION)
// -----------------
export const getCarbonCostSavings = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getAuthUserId();
  const { getDb } = await import("./mongodb.server");
  const db = await getDb();

  // Calculate total idle kWh and cost from latest run
  const latestRun = await db
    .collection("runs")
    .findOne({ user_id: userId }, { sort: { created_at: -1 } });

  let totalIdleKwh = 0;
  let totalIdleCost = 0;

  if (latestRun) {
    totalIdleKwh = latestRun.summary?.idle_kwh || 0;
    totalIdleCost = latestRun.summary?.idle_cost_inr || 0;
  } else {
    const entries = await db.collection("energy_entries").find({ user_id: userId }).toArray();
    entries.forEach((e) => {
      if (e.kind === "daily") {
        totalIdleKwh += Number(e.idle_kwh ?? 0);
      } else if (e.status === "idle") {
        totalIdleKwh += Number(e.kwh ?? 0);
      }
    });
    totalIdleCost = totalIdleKwh * 8.0;
  }

  // Grid factor: 0.82 kg CO2e/kWh
  const co2eSaved = totalIdleKwh * 0.82;

  // Shift cost savings: if we move 15% of peak tariff (₹10/kWh) to solar peaks or off-peak (saving ₹3.5/kWh)
  const costShiftingSavings = totalIdleKwh * 0.15 * 3.5;

  return {
    total_idle_kwh: totalIdleKwh,
    co2_saved_kg: co2eSaved,
    cost_saved_timing_shift_inr: costShiftingSavings,
    grid_emission_factor: 0.82,
    tariffs: [
      { name: "Peak Band (09:00 - 18:00)", rate: "₹10.00 / kWh" },
      { name: "Off-Peak Band (06:00 - 09:00, 18:00 - 23:00)", rate: "₹6.50 / kWh" },
      { name: "Night Band (23:00 - 06:00)", rate: "₹4.00 / kWh" },
    ],
  };
});

// -----------------
// 4. LEADERBOARD & ADOPTION STATUS
// -----------------
export const getLeaderboardStats = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getAuthUserId();
  const { getDb } = await import("./mongodb.server");
  const db = await getDb();

  const entries = await db.collection("energy_entries").find({ user_id: userId }).toArray();
  if (entries.length === 0) return { machineRankings: [], shiftRankings: [] };

  // Machine stats
  const mStats = new Map<string, { total: number; idle: number }>();
  // Shift stats (Shift A: 6-14, Shift B: 14-22, Shift C: 22-6)
  const shiftStats = {
    "Shift A (Morning)": { total: 0, idle: 0 },
    "Shift B (Evening)": { total: 0, idle: 0 },
    "Shift C (Night)": { total: 0, idle: 0 },
  };

  entries.forEach((e) => {
    const mach = e.machine_name || "Unknown";
    const ms = mStats.get(mach) ?? { total: 0, idle: 0 };

    let hr = 12;
    if (e.recorded_at) hr = new Date(e.recorded_at).getHours();

    let shiftKey: keyof typeof shiftStats = "Shift B (Evening)";
    if (hr >= 6 && hr < 14) shiftKey = "Shift A (Morning)";
    else if (hr >= 22 || hr < 6) shiftKey = "Shift C (Night)";

    if (e.kind === "daily") {
      const tot = Number(e.total_kwh ?? 0);
      const idl = Number(e.idle_kwh ?? 0);
      ms.total += tot;
      ms.idle += idl;
      shiftStats[shiftKey].total += tot;
      shiftStats[shiftKey].idle += idl;
    } else {
      const k = Number(e.kwh ?? 0);
      ms.total += k;
      shiftStats[shiftKey].total += k;
      if (e.status === "idle") {
        ms.idle += k;
        shiftStats[shiftKey].idle += k;
      }
    }
    mStats.set(mach, ms);
  });

  const machineRankings = Array.from(mStats.entries())
    .map(([name, val]) => {
      const active = val.total - val.idle;
      const util = val.total > 0 ? (active / val.total) * 100 : 100;
      return {
        machine_name: name,
        total_kwh: val.total,
        idle_kwh: val.idle,
        utilization_pct: util,
      };
    })
    .sort((a, b) => b.utilization_pct - a.utilization_pct);

  const shiftRankings = Object.entries(shiftStats)
    .map(([name, val]) => {
      const active = val.total - val.idle;
      const util = val.total > 0 ? (active / val.total) * 100 : 100;
      return {
        shift_name: name,
        total_kwh: val.total,
        idle_kwh: val.idle,
        utilization_pct: util,
      };
    })
    .sort((a, b) => b.utilization_pct - a.utilization_pct);

  return { machineRankings, shiftRankings };
});

export const getRecStatuses = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => {
    const o = input as { runId: string };
    if (!o.runId) throw new Error("Missing runId");
    return o;
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const { getDb } = await import("./mongodb.server");
    const db = await getDb();

    const items = await db
      .collection("recommendation_status")
      .find({ user_id: userId, run_id: data.runId })
      .toArray();

    return items.map((it) => ({
      rank: it.rank,
      status: it.status,
    }));
  });

export const updateRecStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as {
      runId: string;
      rank: number;
      status: "Accepted" | "Rejected" | "Implemented";
    };
    if (!o.runId || o.rank === undefined || !o.status) throw new Error("Missing args");
    return o;
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const { getDb } = await import("./mongodb.server");
    const db = await getDb();

    await db
      .collection("recommendation_status")
      .updateOne(
        { user_id: userId, run_id: data.runId, rank: data.rank },
        { $set: { status: data.status, updated_at: new Date() } },
        { upsert: true },
      );

    return { success: true };
  });

// -----------------
// 5. MULTI-SIGNAL CHECK
// -----------------
export const getSensorReadings = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getAuthUserId();
  const { getDb } = await import("./mongodb.server");
  const db = await getDb();

  let readings = await db.collection("sensor_readings").find({ user_id: userId }).toArray();

  // Pre-populate if empty
  if (readings.length === 0) {
    const defaultSensors = [
      {
        machine_id: "CNC_Mill_1",
        temperature: 25.4,
        vibration_db: 32.1,
        status: "Likely true idle waste",
      },
      {
        machine_id: "CNC_Lathe_1",
        temperature: 24.2,
        vibration_db: 30.5,
        status: "Likely true idle waste",
      },
      {
        machine_id: "Robotic_Welder_1",
        temperature: 26.8,
        vibration_db: 58.4,
        status: "Possible stuck-on fault — investigate",
      },
      {
        machine_id: "Pick_Place_1",
        temperature: 22.5,
        vibration_db: 28.0,
        status: "Likely true idle waste",
      },
      {
        machine_id: "Assembly_Conveyor_1",
        temperature: 23.1,
        vibration_db: 29.5,
        status: "Likely true idle waste",
      },
      {
        machine_id: "Injection_Molder_2",
        temperature: 138.5,
        vibration_db: 81.2,
        status: "Active operation",
      },
      {
        machine_id: "Thermoformer_2",
        temperature: 108.2,
        vibration_db: 74.5,
        status: "Active operation",
      },
      {
        machine_id: "Packaging_Robot_2",
        temperature: 23.8,
        vibration_db: 31.0,
        status: "Likely true idle waste",
      },
      {
        machine_id: "Labeling_Machine_2",
        temperature: 21.9,
        vibration_db: 25.2,
        status: "Likely true idle waste",
      },
      {
        machine_id: "Palletizer_2",
        temperature: 22.8,
        vibration_db: 28.9,
        status: "Likely true idle waste",
      },
    ];

    const docs = defaultSensors.map((s) => ({
      user_id: userId,
      machine_id: s.machine_id,
      temperature: s.temperature,
      vibration_db: s.vibration_db,
      status: s.status,
      created_at: new Date(),
    }));

    await db.collection("sensor_readings").insertMany(docs);
    readings = await db.collection("sensor_readings").find({ user_id: userId }).toArray();
  }

  return readings.map((r) => {
    const isFault = r.status.includes("stuck-on");
    const isIdleWaste = r.status.includes("idle waste");
    const isActive = r.status.includes("Active");

    // Use values from database if they exist, otherwise simulate
    const power_factor =
      r.power_factor !== undefined
        ? r.power_factor
        : isActive
          ? 0.92 + Math.random() * 0.06
          : isFault
            ? 0.82 + Math.random() * 0.05
            : 0.72 + Math.random() * 0.06;
    const harmonics_thd_pct =
      r.harmonics_thd_pct !== undefined
        ? r.harmonics_thd_pct
        : isActive
          ? 1.5 + Math.random() * 2.0
          : isFault
            ? 8.0 + Math.random() * 4.0
            : 5.0 + Math.random() * 3.0;

    // Simulate condition monitoring
    const acoustic_db =
      r.acoustic_db !== undefined
        ? r.acoustic_db
        : isActive
          ? 78.0 + Math.random() * 12.0
          : isFault
            ? 62.0 + Math.random() * 8.0
            : 35.0 + Math.random() * 8.0;
    const current_signature =
      r.current_signature !== undefined
        ? r.current_signature
        : isActive
          ? "loaded-draw"
          : isIdleWaste
            ? "idle-draw"
            : "no-draw";

    // Simulate environmental & auxiliary
    const compressed_air_pressure_bar =
      r.compressed_air_pressure_bar !== undefined
        ? r.compressed_air_pressure_bar
        : 6.0 + Math.random() * 1.5;
    const compressed_air_flow_rate =
      r.compressed_air_flow_rate !== undefined
        ? r.compressed_air_flow_rate
        : isActive
          ? 4.0 + Math.random() * 6.0
          : isIdleWaste
            ? 0.3 + Math.random() * 0.6
            : 0.0;
    const hvac_occupancy =
      r.hvac_occupancy !== undefined
        ? r.hvac_occupancy
        : isActive || isFault
          ? true
          : Math.random() > 0.6;
    const lux_level =
      r.lux_level !== undefined
        ? r.lux_level
        : hvac_occupancy
          ? 300 + Math.random() * 100
          : 80 + Math.random() * 50;
    const water_flow_rate =
      r.water_flow_rate !== undefined
        ? r.water_flow_rate
        : isActive
          ? 5.0 + Math.random() * 8.0
          : 0.0;

    // Simulate machine state / context
    const limit_switch =
      r.limit_switch !== undefined
        ? r.limit_switch
        : isActive
          ? "Active (Closed)"
          : "Inactive (Open)";
    const operator_beacon =
      r.operator_beacon !== undefined ? r.operator_beacon : isActive ? "Present" : "Absent";

    // Simulate protocols & edge configurations
    const protocolMap: Record<string, string> = {
      CNC_Mill_1: "Modbus TCP",
      CNC_Lathe_1: "Modbus TCP",
      Robotic_Welder_1: "OPC-UA",
      Pick_Place_1: "MQTT",
      Assembly_Conveyor_1: "Modbus RTU",
      Injection_Molder_2: "OPC-UA",
      Thermoformer_2: "OPC-UA",
      Packaging_Robot_2: "MQTT",
      Labeling_Machine_2: "Modbus RTU",
      Palletizer_2: "MQTT",
    };
    const protocol =
      r.protocol !== undefined ? r.protocol : protocolMap[r.machine_id] || "Modbus RTU";

    // Simulate actuation
    const actuator_relay =
      r.actuator_relay !== undefined
        ? r.actuator_relay
        : isIdleWaste
          ? "ON"
          : isActive
            ? "ON"
            : "STANDBY";
    const vfd_speed_pct =
      r.vfd_speed_pct !== undefined
        ? r.vfd_speed_pct
        : isActive
          ? 80 + Math.random() * 20
          : isIdleWaste
            ? 15 + Math.random() * 10
            : 0;

    return {
      machine_id: r.machine_id,
      temperature: r.temperature,
      vibration_db: r.vibration_db,
      status: r.status,
      power_factor,
      harmonics_thd_pct,
      acoustic_db,
      current_signature,
      compressed_air_pressure_bar,
      compressed_air_flow_rate,
      hvac_occupancy,
      lux_level,
      water_flow_rate,
      limit_switch,
      operator_beacon,
      protocol,
      actuator_relay,
      vfd_speed_pct,
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    };
  });
});
