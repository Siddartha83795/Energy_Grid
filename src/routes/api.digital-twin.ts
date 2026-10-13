import { createFileRoute } from "@tanstack/react-router";
import {
  getFactoryCommandOverview,
  computeDigitalTwinState,
  generateAIForecast,
  detectAnomaliesAcrossFleet,
  generateOptimizationRecommendations,
  runWhatIfDigitalTwinSimulation,
  getResearchMetrics,
  generateMachineTelemetry,
  pushTelemetryReading,
  setActiveProtocol,
  MACHINES,
} from "../lib/digital-twin.engine";

export const Route = createFileRoute("/api/digital-twin")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const action = url.searchParams.get("action") || "overview";

        if (action === "machines") {
          return new Response(
            JSON.stringify({
              success: true,
              machines: Object.values(MACHINES),
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (action === "telemetry") {
          const mId = url.searchParams.get("machine_id") || "Machine A";
          const state = computeDigitalTwinState(mId);
          return new Response(
            JSON.stringify({
              success: true,
              machine_id: mId,
              telemetry: state.recent_telemetry,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (action === "forecast") {
          const forecast = generateAIForecast();
          return new Response(JSON.stringify({ success: true, forecast }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (action === "anomalies") {
          const anomalies = detectAnomaliesAcrossFleet();
          return new Response(JSON.stringify({ success: true, anomalies }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (action === "research") {
          const research = getResearchMetrics();
          return new Response(JSON.stringify({ success: true, research }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Default Overview & All Digital Twin States
        const overview = getFactoryCommandOverview();
        const states = {
          "Machine A": computeDigitalTwinState("Machine A"),
          "Machine B": computeDigitalTwinState("Machine B"),
          "Machine C": computeDigitalTwinState("Machine C"),
        };
        const forecast = generateAIForecast();
        const anomalies = detectAnomaliesAcrossFleet();
        const recommendations = generateOptimizationRecommendations();

        return new Response(
          JSON.stringify({
            success: true,
            overview,
            states,
            forecast,
            anomalies,
            recommendations,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      },

      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as any;

          // 1. Post telemetry packet
          if (body.type === "telemetry_post") {
            const { machine_id, state, load_pct, protocol } = body;
            if (protocol) setActiveProtocol(protocol);

            const mId = machine_id || "Machine A";
            const reading = generateMachineTelemetry(
              mId,
              state || "Running",
              load_pct || 80
            );
            pushTelemetryReading(reading);

            return new Response(
              JSON.stringify({
                success: true,
                message: "Telemetry ingested into Digital Twin pipeline.",
                reading,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          }

          // 2. What-If Scenario simulation
          if (body.type === "what_if_simulation") {
            const result = runWhatIfDigitalTwinSimulation({
              machine_id: body.machine_id || "Machine A",
              load_change_pct: Number(body.load_change_pct || -10),
              schedule_hours_shift: Number(body.schedule_hours_shift || 0),
              production_target_change_pct: Number(body.production_target_change_pct || 0),
            });
            return new Response(JSON.stringify({ success: true, result }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(
            JSON.stringify({ error: "Unknown payload type. Supported: 'telemetry_post', 'what_if_simulation'." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Failed to process Digital Twin request" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
