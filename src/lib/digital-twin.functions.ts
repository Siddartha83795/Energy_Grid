import { createServerFn } from "@tanstack/react-start";
import {
  MACHINES,
  generateMachineTelemetry,
  getOrCreateTelemetryHistory,
  pushTelemetryReading,
  setForcedAnomaly,
  setActiveProtocol,
  computeDigitalTwinState,
  generateAIForecast,
  detectAnomaliesAcrossFleet,
  generateOptimizationRecommendations,
  runWhatIfDigitalTwinSimulation,
  getResearchMetrics,
  getFactoryCommandOverview,
  WhatIfScenarioInput,
  MachineTelemetry,
} from "./digital-twin.engine";

// Helper for auth session or database logging
async function getOptionalUserId(): Promise<string | null> {
  try {
    const { getSessionCookie } = await import("./auth-cookie.server");
    const { verifySession } = await import("./auth-session.server");
    const token = await getSessionCookie();
    if (!token) return null;
    const session = verifySession(token);
    return session?.userId || null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// 1. GET FULL DIGITAL TWIN DASHBOARD STATE
// -------------------------------------------------------------
export const getDigitalTwinDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getOptionalUserId();

  // Try saving latest snapshot to MongoDB if connected
  try {
    const { getDb } = await import("./mongodb.server");
    const db = await getDb();
    if (db) {
      const stateA = computeDigitalTwinState("Machine A");
      const stateB = computeDigitalTwinState("Machine B");
      const stateC = computeDigitalTwinState("Machine C");

      await db
        .collection("digital_twin_states")
        .updateOne(
          { machine_id: "Machine A" },
          { $set: { ...stateA, user_id: userId, updated_at: new Date() } },
          { upsert: true },
        );
      await db
        .collection("digital_twin_states")
        .updateOne(
          { machine_id: "Machine B" },
          { $set: { ...stateB, user_id: userId, updated_at: new Date() } },
          { upsert: true },
        );
      await db
        .collection("digital_twin_states")
        .updateOne(
          { machine_id: "Machine C" },
          { $set: { ...stateC, user_id: userId, updated_at: new Date() } },
          { upsert: true },
        );
    }
  } catch (e) {
    // Non-blocking log
    console.log("MongoDB digital twin snapshot sync note:", e instanceof Error ? e.message : e);
  }

  const overview = getFactoryCommandOverview();
  const states = {
    "Machine A": computeDigitalTwinState("Machine A"),
    "Machine B": computeDigitalTwinState("Machine B"),
    "Machine C": computeDigitalTwinState("Machine C"),
  };
  const forecast = generateAIForecast();
  const anomalies = detectAnomaliesAcrossFleet();
  const recommendations = generateOptimizationRecommendations();
  const research = getResearchMetrics();

  return {
    overview,
    states,
    forecast,
    anomalies,
    recommendations,
    research,
  };
});

// -------------------------------------------------------------
// 2. SIMULATE NEXT TELEMETRY TICK / INJECT ANOMALY
// -------------------------------------------------------------
export const triggerTelemetryTick = createServerFn({ method: "POST" })
  .validator((data: { anomaly_trigger?: string; protocol?: string }) => data)
  .handler(async ({ data }) => {
    if (data?.protocol) {
      setActiveProtocol(data.protocol as any);
    }

    const machineKeys = ["Machine A", "Machine B", "Machine C"];

    for (const mKey of machineKeys) {
      let anomalyType: any = null;
      if (data?.anomaly_trigger === `${mKey}_surge`) anomalyType = "voltage_surge";
      if (data?.anomaly_trigger === `${mKey}_heat`) anomalyType = "thermal_overheat";
      if (data?.anomaly_trigger === `${mKey}_vib`) anomalyType = "vibration_spike";

      if (anomalyType) {
        setForcedAnomaly(mKey, anomalyType);
      }

      const reading = generateMachineTelemetry(mKey, "Running", 80, anomalyType);
      pushTelemetryReading(reading);

      // Reset forced anomaly after 1 tick if injected
      if (anomalyType) {
        setTimeout(() => setForcedAnomaly(mKey, null), 2000);
      }
    }

    return { success: true, timestamp: new Date().toISOString() };
  });

// -------------------------------------------------------------
// 3. RUN WHAT-IF SCENARIO SIMULATION
// -------------------------------------------------------------
export const simulateWhatIfScenario = createServerFn({ method: "POST" })
  .validator((data: WhatIfScenarioInput) => data)
  .handler(async ({ data }) => {
    const result = runWhatIfDigitalTwinSimulation(data);
    return result;
  });

// -------------------------------------------------------------
// 4. DISPATCH OPTIMIZATION RECOMMENDATION TO APPROVAL QUEUE
// -------------------------------------------------------------
export const dispatchOptimizationToQueue = createServerFn({ method: "POST" })
  .validator(
    (data: {
      recommendation_id: string;
      recommendation_text: string;
      machine_id: string;
      savings_inr: number;
      risk_level: "Low" | "High";
    }) => data,
  )
  .handler(async ({ data }) => {
    const userId = (await getOptionalUserId()) || "demo-user";

    try {
      const { getDb } = await import("./mongodb.server");
      const db = await getDb();
      if (db) {
        await db.collection("action_queue").insertOne({
          user_id: userId,
          timestamp: new Date(),
          machine_id: data.machine_id,
          issue: `Optimization Recommendation ${data.recommendation_id}`,
          action: data.recommendation_text,
          estimated_weekly_savings_inr: data.savings_inr,
          root_cause: `Digital Twin Optimization Engine identified ${data.recommendation_text}`,
          risk_level: data.risk_level,
          status: data.risk_level === "High" ? "Pending" : "Approved",
          created_at: new Date(),
        });
      }
    } catch (e) {
      console.error("Failed to push optimization into MongoDB action_queue:", e);
    }

    return { success: true, message: `Dispatched ${data.recommendation_id} to Approval Queue.` };
  });
