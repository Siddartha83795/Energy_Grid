import { createFileRoute } from "@tanstack/react-router";
import { INITIAL_CAUSE_LEDGER } from "@/lib/energy-advisor-research";

export const Route = createFileRoute("/api/ledger")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const deviceId = url.searchParams.get("deviceId");
        const cause = url.searchParams.get("cause");

        let entries = INITIAL_CAUSE_LEDGER;
        if (deviceId) {
          entries = entries.filter((e) => e.device_id === deviceId);
        }
        if (cause) {
          entries = entries.filter((e) => e.cause === cause);
        }

        const totalExcessWh =
          Math.round(entries.reduce((sum, e) => sum + e.estimated_excess_wh, 0) * 10) / 10;

        return new Response(
          JSON.stringify({
            count: entries.length,
            total_potential_excess_wh: totalExcessWh,
            ledger: entries,
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
          const newEntry = {
            ledger_id: `LEDGER-${Date.now().toString().slice(-4)}`,
            device_id: body.device_id || "dev-01",
            device_name: body.device_name || "Desktop PC (Workstation)",
            start_time: body.start_time || "10:00 AM",
            end_time: body.end_time || "11:00 AM",
            duration_minutes: body.duration_minutes || 60,
            cause: body.cause || "PROLONGED_IDLE",
            estimated_excess_wh: body.estimated_excess_wh || 45.0,
            evidence: body.evidence || ["Contextual sensor evidence verified via API"],
            confidence: body.confidence || 0.9,
            operating_state: body.operating_state || "IDLE",
            expected_power_w: body.expected_power_w || 43,
            actual_power_w: body.actual_power_w || 88,
            validation_status: body.validation_status || "POTENTIAL_EXCESS",
          };

          return new Response(JSON.stringify({ success: true, entry: newEntry }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message || "Invalid ledger payload" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
