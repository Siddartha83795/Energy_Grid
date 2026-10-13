import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/mongodb.server";

export const Route = createFileRoute("/api/agent/report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const token =
            request.headers.get("x-device-token") ||
            new URL(request.url).searchParams.get("token");

          if (!token) {
            return new Response(
              JSON.stringify({ success: false, error: "Missing x-device-token header" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const body = await request.json();

          // Validate required telemetry fields
          if (
            body.cpu_percent === undefined ||
            body.memory_used_gb === undefined ||
            body.memory_total_gb === undefined
          ) {
            return new Response(
              JSON.stringify({ success: false, error: "Invalid telemetry payload" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const db = await getDb();
          const nowISO = new Date().toISOString();

          // Find computer node by token or default matching node
          let node = await db
            .collection("connected_systems")
            .findOne({ $or: [{ device_token: token }, { id: token }] });

          if (!node) {
            // Find any unassigned computer node
            node = await db
              .collection("connected_systems")
              .findOne({ type: "computer" });
          }

          const nodeId = node ? node.id : "node-2";

          const computerTelemetry = {
            hostname: body.hostname || "Workstation",
            os_type: body.os_type || "Windows",
            cpu_percent: Number(body.cpu_percent),
            cpu_freq_ghz: Number(body.cpu_freq_ghz || 2.4),
            memory_used_gb: Number(body.memory_used_gb),
            memory_total_gb: Number(body.memory_total_gb),
            memory_percent: Number(body.memory_percent || ((body.memory_used_gb / body.memory_total_gb) * 100).toFixed(1)),
            disk_percent: Number(body.disk_percent || 0),
            network_send_kbps: Number(body.network_send_kbps || 0),
            network_recv_kbps: Number(body.network_recv_kbps || 0),
            gpu_percent: body.gpu_percent !== undefined ? body.gpu_percent : null,
            gpu_temp_c: body.gpu_temp_c !== undefined ? body.gpu_temp_c : null,
            reported_at: nowISO,
          };

          // Store historical time-series reading
          await db.collection("computer_metrics").insertOne({
            node_id: nodeId,
            device_token: token,
            ...computerTelemetry,
            created_at: new Date(),
          });

          // Calculate estimated equivalent watts for compute node (idle 80W + dynamic load up to 350W)
          const computedWatts = Math.round(80 + (computerTelemetry.cpu_percent / 100) * 270);
          const computedEfficiency = Math.max(
            10,
            Math.min(99, Math.round(100 - (100 - computerTelemetry.cpu_percent) * 0.4))
          );

          // Update computer node status & telemetry in connected_systems
          await db.collection("connected_systems").updateOne(
            { id: nodeId },
            {
              $set: {
                status: "active",
                last_reading_at: nowISO,
                current_power_draw_w: computedWatts,
                efficiency_score: computedEfficiency,
                computer_telemetry: computerTelemetry,
              },
            }
          );

          return new Response(
            JSON.stringify({
              success: true,
              message: "Real-time telemetry recorded successfully",
              node_id: nodeId,
              recorded_at: nowISO,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          console.error("Agent telemetry report error:", error);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Server error recording agent telemetry",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
