import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/iot")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return new Response(
          JSON.stringify({
            message: "ESP32 Industrial IoT Gateway Endpoint Active",
            supported_hardware: [
              "ESP32-WROOM-32 / DevKit V1",
              "PZEM-004T V3 (Voltage, Current, Power, Energy, PF, Frequency)",
              "SCT-013-000 (Non-invasive AC Current Transformer)",
              "DS18B20 (Digital Temperature Sensor)",
              "MPU6050 (6-DOF IMU / Vibration Acceleration)",
              "HC-SR501 (PIR Human Presence Sensor)",
              "IR Proximity / Obstacle Sensor (Machine Cycle Detection)",
              "1/2-Channel 5V Relay Module (Control / Standby Cutoff)",
              "AC Contactor (High-Power Industrial Switching)",
              "Fuse / MCB Protection",
              "Mushroom Emergency Stop (E-Stop Safety Interlock)",
              "0.96 inch SSD1306 OLED (Local Status Display)",
              "5V Active Buzzer (Audible Alarm)"
            ],
            endpoints: {
              post_telemetry: "/api/iot",
              method: "POST",
              headers: { "Content-Type": "application/json" }
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const data = (await request.json()) as any;
          const { getDb } = await import("../lib/mongodb.server");
          const db = await getDb().catch(() => null);

          // Extract all 13 IoT Sensor & Hardware Component Parameters
          const {
            email,
            userId: customUserId,
            machine_id = "ESP32_Industrial_Node_01",
            
            // 1. PZEM-004T V3 Electrical readings
            voltage_v,
            current_a,
            power_w,
            energy_wh,
            kwh,
            power_factor = 0.90,
            frequency_hz = 50.0,
            harmonics_thd_pct,

            // 2. SCT-013-000 Secondary CT clamp reading
            sct_current_a,

            // 3. DS18B20 Temperature reading
            temperature,
            temperature_c,

            // 4. MPU6050 Vibration / Acceleration
            vibration_rms,
            vibration_g,
            vibration_db,
            ax,
            ay,
            az,

            // 5. HC-SR501 PIR Human presence
            pir_motion,
            hvac_occupancy,

            // 6. IR Proximity / Obstacle machine cycle sensor
            proximity_detected,
            limit_switch,
            cycle_count,

            // 7. Relays & Actuators
            actuator_relay,
            relay_state,

            // 8. AC Contactor feedback
            contactor_state,

            // 9. Safety / Protection
            mcb_status,
            estop_active,
            estop_pressed,

            // 10. Buzzer status
            buzzer_active,

            // Auxiliary signals
            acoustic_db,
            compressed_air_pressure_bar,
            compressed_air_flow_rate,
            lux_level,
            water_flow_rate,
            vfd_speed_pct,
            protocol = "ESP32-HTTP-REST",
            status: incomingStatus,
          } = data;

          if (!machine_id) {
            return new Response(JSON.stringify({ error: "machine_id is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Normalize values
          const numVoltage = Number(voltage_v ?? 230.0);
          const numCurrent = Number(current_a ?? sct_current_a ?? 0.0);
          const numPF = Math.min(1.0, Math.max(0.1, Number(power_factor ?? 0.90)));
          const numPowerW = power_w !== undefined ? Number(power_w) : (numVoltage * numCurrent * numPF);
          const numKwh = kwh !== undefined ? Number(kwh) : (energy_wh !== undefined ? Number(energy_wh) / 1000 : (numPowerW * (1 / 3600)));
          const numTemp = Number(temperature ?? temperature_c ?? 25.0);
          
          // Normalized vibration in G / RMS
          const numVibG = vibration_g !== undefined 
            ? Number(vibration_g) 
            : vibration_rms !== undefined 
              ? Number(vibration_rms) 
              : vibration_db !== undefined 
                ? (Number(vibration_db) / 100) 
                : 0.15;
          const numVibDb = vibration_db !== undefined ? Number(vibration_db) : (numVibG * 100);

          const isPirActive = Boolean(pir_motion === 1 || pir_motion === true || hvac_occupancy === true);
          const isProximityActive = Boolean(proximity_detected === 1 || proximity_detected === true || limit_switch === "Active (Closed)" || limit_switch === "1");
          const isEstopActive = Boolean(estop_active === 1 || estop_active === true || estop_pressed === 1 || estop_pressed === true);
          const currentRelay = relay_state !== undefined ? (relay_state === 1 || relay_state === "ON" ? "ON" : "OFF") : (actuator_relay ?? "ON");

          // -------------------------------------------------------------
          // MULTI-MODAL SIGNAL FUSION & AI PREDICTIVE REASONING ENGINE
          // -------------------------------------------------------------
          let aiState = "NORMAL_OPERATION";
          let severity: "NORMAL" | "LOW" | "WARNING" | "CRITICAL" | "WASTE" = "NORMAL";
          let diagnosis = "Machine running under stable conditions.";
          let recommendation = "Operating within nominal energy parameters.";
          let excessPowerW = 0.0;
          let estimatedWasteCostPerHourInr = 0.0;
          let confidence = 0.92;

          let commandRelay: "KEEP" | "ON" | "OFF" = "KEEP";
          let commandBuzzer: "OFF" | "BEEP" | "ALARM" = "OFF";
          let oledLine1 = `P:${numPowerW.toFixed(0)}W V:${numVoltage.toFixed(0)}V`;
          let oledLine2 = `PF:${numPF.toFixed(2)} NOR`;

          // Rule 1: Emergency Stop Interlock Trip
          if (isEstopActive) {
            aiState = "EMERGENCY_STOP_TRIPPED";
            severity = "CRITICAL";
            diagnosis = "Physical Emergency Stop mushroom switch engaged! Safety circuit open.";
            recommendation = "Maintain contactor de-energized. Inspect cell for safety hazard before resetting E-stop.";
            commandRelay = "OFF";
            commandBuzzer = "ALARM";
            oledLine1 = "E-STOP ACTIVATED";
            oledLine2 = "RELAY OPEN (OFF)";
            confidence = 1.0;
          }
          // Rule 2: Overcurrent Protection (> 25A continuous or short-circuit spike)
          else if (numCurrent > 25.0 || (sct_current_a && Number(sct_current_a) > 25.0)) {
            aiState = "OVERCURRENT_ANOMALY";
            severity = "CRITICAL";
            diagnosis = `Current draw (${numCurrent.toFixed(2)} A) exceeds continuous rating. Risk of thermal degradation or MCB trip.`;
            recommendation = "Immediate load shedding recommended. Check motor stator and mechanical binding.";
            commandRelay = "OFF";
            commandBuzzer = "ALARM";
            oledLine1 = `I:${numCurrent.toFixed(1)}A OVERCUR`;
            oledLine2 = "TRIP RELAY CMD";
            confidence = 0.98;
          }
          // Rule 3: Mechanical Bearing Wear & Thermal Runaway (MPU6050 + DS18B20)
          else if (numVibG > 0.85 && numTemp > 55.0) {
            aiState = "MECHANICAL_VIBRATION_THERMAL_FAULT";
            severity = "WARNING";
            diagnosis = `Co-occurrence of high vibration (${numVibG.toFixed(2)} G) and elevated temp (${numTemp.toFixed(1)} °C). Indicates bearing defect or misalignment.`;
            recommendation = "Schedule predictive maintenance window. Lubricate bearings and check rotor balancing.";
            commandRelay = "KEEP";
            commandBuzzer = "BEEP";
            oledLine1 = `WARN: VIB ${numVibG.toFixed(1)}G`;
            oledLine2 = `TEMP: ${numTemp.toFixed(1)}C`;
            confidence = 0.91;
          }
          // Rule 4: Standby Waste / Prolonged Idle (PZEM draw > 25W, PIR = 0, Proximity = 0)
          else if (numPowerW > 25.0 && !isPirActive && !isProximityActive) {
            aiState = "STANDBY_ENERGY_WASTE";
            severity = "WASTE";
            excessPowerW = Math.max(0, numPowerW - 6.0); // Baseline standby vs idle draw
            estimatedWasteCostPerHourInr = (excessPowerW / 1000) * 8.5; // Average industrial tariff
            diagnosis = `Machine consuming ${numPowerW.toFixed(0)} W without active production. PIR reports no personnel present; proximity sensor reports no cycle feed.`;
            recommendation = `Switch auxiliary drives to low-power standby mode. Potential monthly savings: ₹${(estimatedWasteCostPerHourInr * 160).toFixed(0)}.`;
            commandRelay = "KEEP"; // Or "OFF" if auto-shutdown policy enabled
            commandBuzzer = "OFF";
            oledLine1 = `IDLE: ${numPowerW.toFixed(0)}W WASTE`;
            oledLine2 = `AI: STANDBY REC`;
            confidence = 0.89;
          }
          // Rule 5: Active Operational Production
          else if (numPowerW > 25.0 && (isPirActive || isProximityActive)) {
            aiState = "ACTIVE_PRODUCTION";
            severity = "NORMAL";
            diagnosis = "Normal loaded operation confirmed by active workpiece cycles and operator presence.";
            recommendation = "Optimal throughput. Maintain standard power policy.";
            commandRelay = "ON";
            commandBuzzer = "OFF";
            oledLine1 = `RUN: ${numPowerW.toFixed(0)}W`;
            oledLine2 = `PF:${numPF.toFixed(2)} OK`;
            confidence = 0.95;
          }
          // Rule 6: Machine Off / Standby
          else {
            aiState = "DE-ENERGIZED_STANDBY";
            severity = "NORMAL";
            diagnosis = "Machine is safely de-energized in low quiescent sleep.";
            recommendation = "Standby power leakage is within nominal limits (<20W).";
            commandRelay = "KEEP";
            commandBuzzer = "OFF";
            oledLine1 = `STBY: ${numPowerW.toFixed(1)}W`;
            oledLine2 = `SYS READY`;
            confidence = 0.96;
          }

          // Status string
          const finalStatusString = incomingStatus || (
            severity === "CRITICAL" ? "Critical Safety Alert" :
            severity === "WARNING" ? "Possible stuck-on fault — investigate" :
            severity === "WASTE" ? "Likely true idle waste" :
            "Active operation"
          );

          // -------------------------------------------------------------
          // DATABASE PERSISTENCE (MONGODB)
          // -------------------------------------------------------------
          let userId = "demo-admin-id";
          if (db) {
            // Resolve User
            let userDoc = null;
            if (customUserId) {
              const { ObjectId } = await import("mongodb");
              try {
                userDoc = await db.collection("users").findOne({ _id: new ObjectId(customUserId) });
              } catch {}
            } else if (email) {
              userDoc = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
            }

            if (!userDoc) {
              userDoc = await db.collection("users").findOne({});
            }

            if (userDoc) {
              userId = userDoc._id.toString();

              // Update sensor_readings
              const updateDoc: any = {
                updated_at: new Date(),
                status: finalStatusString,
                temperature: numTemp,
                vibration_db: numVibDb,
                vibration_g: numVibG,
                power_factor: numPF,
                harmonics_thd_pct: harmonics_thd_pct ? Number(harmonics_thd_pct) : 2.5,
                acoustic_db: acoustic_db ? Number(acoustic_db) : (numVibG > 0.5 ? 75.0 : 38.0),
                current_signature: numPowerW > 50 ? "loaded-draw" : (numPowerW > 15 ? "idle-draw" : "no-draw"),
                compressed_air_pressure_bar: compressed_air_pressure_bar ? Number(compressed_air_pressure_bar) : 6.5,
                compressed_air_flow_rate: compressed_air_flow_rate ? Number(compressed_air_flow_rate) : (isProximityActive ? 4.2 : 0.0),
                hvac_occupancy: isPirActive,
                lux_level: lux_level ? Number(lux_level) : (isPirActive ? 350 : 80),
                water_flow_rate: water_flow_rate ? Number(water_flow_rate) : 0.0,
                limit_switch: limit_switch || (isProximityActive ? "Active (Closed)" : "Open"),
                operator_beacon: isPirActive ? "Present" : "Absent",
                protocol: protocol,
                actuator_relay: currentRelay,
                vfd_speed_pct: vfd_speed_pct ? Number(vfd_speed_pct) : (isProximityActive ? 85.0 : 0.0),
                
                // Hardware specific fields
                voltage_v: numVoltage,
                current_a: numCurrent,
                power_w: numPowerW,
                sct_current_a: sct_current_a ? Number(sct_current_a) : numCurrent,
                estop_active: isEstopActive,
                pir_motion: isPirActive,
                proximity_detected: isProximityActive,
                ai_state: aiState,
                ai_severity: severity,
                ai_recommendation: recommendation,
                excess_power_w: excessPowerW,
              };

              await db.collection("sensor_readings").updateOne(
                { user_id: userId, machine_id: machine_id },
                { $set: updateDoc },
                { upsert: true }
              );

              // Insert energy entry for forecasting
              const isIdle = severity === "WASTE" || finalStatusString.toLowerCase().includes("idle");
              await db.collection("energy_entries").insertOne({
                user_id: userId,
                kind: "detailed",
                source: "esp32",
                machine_name: machine_id,
                recorded_at: new Date(),
                kwh: numKwh,
                power_w: numPowerW,
                voltage_v: numVoltage,
                current_a: numCurrent,
                power_factor: numPF,
                status: isIdle ? "idle" : "active",
                created_at: new Date(),
                updated_at: new Date(),
              });

              // If standby waste or critical fault, log to action_queue
              if (severity === "WASTE" || severity === "CRITICAL" || severity === "WARNING") {
                await db.collection("action_queue").insertOne({
                  user_id: userId,
                  timestamp: new Date(),
                  machine_id: machine_id,
                  issue: diagnosis,
                  action: recommendation,
                  estimated_weekly_savings_inr: (estimatedWasteCostPerHourInr * 40),
                  root_cause: diagnosis,
                  risk_level: severity === "CRITICAL" ? "High" : "Low",
                  status: severity === "CRITICAL" ? "Executed" : "Pending",
                  created_at: new Date(),
                });
              }
            }
          }

          // -------------------------------------------------------------
          // RETURN BIDIRECTIONAL AI ANALYTICS & ESP32 COMMAND PAYLOAD
          // -------------------------------------------------------------
          return new Response(
            JSON.stringify({
              success: true,
              timestamp: new Date().toISOString(),
              machine_id: machine_id,
              user_id: userId,
              telemetry_summary: {
                voltage_v: numVoltage,
                current_a: numCurrent,
                power_w: numPowerW,
                energy_kwh: numKwh,
                power_factor: numPF,
                temperature_c: numTemp,
                vibration_g: numVibG,
                pir_occupancy: isPirActive,
                proximity_detected: isProximityActive,
                estop_active: isEstopActive,
                relay_state: currentRelay,
              },
              ai_analysis: {
                state: aiState,
                severity: severity,
                confidence: confidence,
                diagnosis: diagnosis,
                recommendation: recommendation,
                excess_power_w: excessPowerW,
                waste_cost_inr_per_hour: estimatedWasteCostPerHourInr,
                monthly_projected_waste_inr: estimatedWasteCostPerHourInr * 160,
              },
              commands: {
                relay: commandRelay,
                buzzer: commandBuzzer,
                oled_line1: oledLine1,
                oled_line2: oledLine2,
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (e) {
          return new Response(
            JSON.stringify({
              error: e instanceof Error ? e.message : "Failed to process IoT telemetry POST",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});

