import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/iot")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return new Response(
          JSON.stringify({
            message: "ESP32 IoT telemetry endpoint active. Send POST requests to this URL.",
            endpoints: {
              post_telemetry: "/api/iot",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const data = (await request.json()) as any;
          const { getDb } = await import("../lib/mongodb.server");
          const db = await getDb();

          const {
            email,
            userId: customUserId,
            machine_id,
            temperature,
            vibration_db,
            status,
            kwh,
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
          } = data;

          if (!machine_id) {
            return new Response(JSON.stringify({ error: "machine_id is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // 1. Resolve User Doc
          let userDoc = null;
          if (customUserId) {
            const { ObjectId } = await import("mongodb");
            try {
              userDoc = await db.collection("users").findOne({ _id: new ObjectId(customUserId) });
            } catch {}
          } else if (email) {
            userDoc = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
          }

          // Default fallback to first user (Admin) in the database
          if (!userDoc) {
            userDoc = await db.collection("users").findOne({});
          }

          if (!userDoc) {
            return new Response(
              JSON.stringify({ error: "No user found in database to associate IoT telemetry." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const userId = userDoc._id.toString();

          // 2. Update Live Sensor Telemetry (sensor_readings collection)
          const updateDoc: any = {
            updated_at: new Date(),
          };

          if (temperature !== undefined) updateDoc.temperature = Number(temperature);
          if (vibration_db !== undefined) updateDoc.vibration_db = Number(vibration_db);
          if (status !== undefined) updateDoc.status = String(status);
          if (power_factor !== undefined) updateDoc.power_factor = Number(power_factor);
          if (harmonics_thd_pct !== undefined)
            updateDoc.harmonics_thd_pct = Number(harmonics_thd_pct);
          if (acoustic_db !== undefined) updateDoc.acoustic_db = Number(acoustic_db);
          if (current_signature !== undefined)
            updateDoc.current_signature = String(current_signature);
          if (compressed_air_pressure_bar !== undefined)
            updateDoc.compressed_air_pressure_bar = Number(compressed_air_pressure_bar);
          if (compressed_air_flow_rate !== undefined)
            updateDoc.compressed_air_flow_rate = Number(compressed_air_flow_rate);
          if (hvac_occupancy !== undefined) updateDoc.hvac_occupancy = Boolean(hvac_occupancy);
          if (lux_level !== undefined) updateDoc.lux_level = Number(lux_level);
          if (water_flow_rate !== undefined) updateDoc.water_flow_rate = Number(water_flow_rate);
          if (limit_switch !== undefined) updateDoc.limit_switch = String(limit_switch);
          if (operator_beacon !== undefined) updateDoc.operator_beacon = String(operator_beacon);
          if (protocol !== undefined) updateDoc.protocol = String(protocol);
          if (actuator_relay !== undefined) updateDoc.actuator_relay = String(actuator_relay);
          if (vfd_speed_pct !== undefined) updateDoc.vfd_speed_pct = Number(vfd_speed_pct);

          await db.collection("sensor_readings").updateOne(
            { user_id: userId, machine_id: machine_id },
            {
              $set: updateDoc,
            },
            { upsert: true }
          );

          // 3. Log reading in energy_entries for analytical modeling and forecasting
          if (kwh !== undefined) {
            const isIdle =
              (status && status.toLowerCase().includes("idle")) ||
              (current_signature && current_signature.toLowerCase().includes("idle"));

            await db.collection("energy_entries").insertOne({
              user_id: userId,
              kind: "detailed",
              source: "esp32",
              machine_name: machine_id,
              recorded_at: new Date(),
              kwh: Number(kwh),
              status: isIdle ? "idle" : "active",
              created_at: new Date(),
              updated_at: new Date(),
            });
          }

          return new Response(JSON.stringify({ success: true, machine_id, user_id: userId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({
              error: e instanceof Error ? e.message : "Failed to process IoT telemetry POST",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
