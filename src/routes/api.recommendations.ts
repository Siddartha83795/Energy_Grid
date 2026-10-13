import { createFileRoute } from "@tanstack/react-router";
import { INITIAL_RECOMMENDATIONS } from "@/lib/energy-advisor-research";

export const Route = createFileRoute("/api/recommendations")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return new Response(
          JSON.stringify({
            count: INITIAL_RECOMMENDATIONS.length,
            recommendations: INITIAL_RECOMMENDATIONS,
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
          const newRec = {
            id: `rec-${Date.now().toString().slice(-4)}`,
            deviceId: body.deviceId || "dev-01",
            deviceName: body.deviceName || "Desktop PC (Workstation)",
            title: body.title || "Corrective Power Policy",
            description: body.description || "Description of intervention",
            reason: body.reason || "Contextual excess energy detected",
            cause: body.cause || "PROLONGED_IDLE",
            evidence: body.evidence || ["Contextual sensor evidence"],
            confidencePercent: body.confidencePercent || 90,
            estimatedImpact: body.estimatedImpact || {
              powerReductionW: 35,
              dailySavingKWh: 0.8,
              monthlyCostSavingINR: 240,
            },
            suggestedAction: body.suggestedAction || "Adjust policy timeout",
            expectedBenefit: body.expectedBenefit || "Reduce unnecessary idle draw",
            riskAssessment: body.riskAssessment || "LOW",
            approvalRequired: false,
            status: "PENDING",
          };

          return new Response(JSON.stringify({ success: true, recommendation: newRec }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: err.message || "Invalid recommendation payload" }),
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
