import { createFileRoute } from "@tanstack/react-router";
import {
  INITIAL_COUNTERFACTUALS,
  calculateCounterfactualSaving,
} from "@/lib/energy-advisor-research";

export const Route = createFileRoute("/api/counterfactual")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const deviceId = url.searchParams.get("deviceId");

        let data = INITIAL_COUNTERFACTUALS;
        if (deviceId) {
          data = data.filter((d) => d.device_id === deviceId);
        }

        return new Response(
          JSON.stringify({
            count: data.length,
            evaluations: data,
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
            device_id = "dev-01",
            workload_id = "WL-MED",
            counterfactual_old_wh = 240,
            measured_post_wh = 182,
            old_policy = "π0: 30-min idle sleep",
            new_policy = "π1: 10-min ACPI sleep",
          } = body;

          const savingWh = calculateCounterfactualSaving(counterfactual_old_wh, measured_post_wh);

          const evaluation = {
            eval_id: `CF-API-${Date.now().toString().slice(-4)}`,
            device_id,
            workload_id,
            old_policy_name: old_policy,
            new_policy_name: new_policy,
            counterfactual_old_policy_energy_wh: counterfactual_old_wh,
            measured_new_policy_energy_wh: measured_post_wh,
            workload_conditioned_saving_wh: savingWh,
            status: savingWh > 20 ? "VERIFIED EFFECTIVE" : "LOW / NOT VERIFIED",
          };

          return new Response(JSON.stringify({ success: true, evaluation }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: err.message || "Invalid counterfactual parameters" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
