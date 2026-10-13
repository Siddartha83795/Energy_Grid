import { createFileRoute } from "@tanstack/react-router";
import { calculateExcessEnergyWh } from "@/lib/energy-advisor-research";

export const Route = createFileRoute("/api/readings")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return new Response(
          JSON.stringify({
            message: "Energy Advisor Readings Ingestion API",
            schema: [
              "timestamp",
              "device_id",
              "power_w",
              "voltage_v",
              "current_a",
              "temperature_c",
              "vibration",
              "cpu_load",
              "workload",
              "operating_state",
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json();
          const {
            device_id,
            power_w = 45,
            expected_power_w = 40,
            duration_s = 1,
            operating_state = "IDLE",
          } = body;

          const { excessPowerW, excessEnergyWh } = calculateExcessEnergyWh(
            power_w,
            expected_power_w,
            duration_s,
          );

          return new Response(
            JSON.stringify({
              success: true,
              received_at: new Date().toISOString(),
              device_id,
              power_w,
              expected_power_w,
              excess_power_w: excessPowerW,
              excess_energy_wh: excessEnergyWh,
              operating_state,
              status: excessPowerW > 10 ? "POTENTIAL_EXCESS" : "NORMAL",
            }),
            {
              status: 201,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message || "Invalid reading data" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
