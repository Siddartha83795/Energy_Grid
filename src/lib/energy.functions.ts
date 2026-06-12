import { createServerFn } from "@tanstack/react-start";
import { getSessionCookie } from "./auth-cookie.server";
import { getDb } from "./mongodb.server";
import { verifySession } from "./auth-session.server";
import { ObjectId } from "mongodb";

async function getAuthUserId(): Promise<string> {
  const token = await getSessionCookie();
  if (!token) throw new Error("Unauthorized: No session token");
  const session = verifySession(token);
  if (!session || !session.userId) throw new Error("Unauthorized: Invalid session");
  return session.userId;
}

export const getEnergyEntries = createServerFn({ method: "GET" })
  .handler(async () => {
    const userId = await getAuthUserId();
    const db = await getDb();
    const cursor = db.collection("energy_entries")
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(200);
    const items = await cursor.toArray();
    return items.map(item => ({
      id: item._id.toString(),
      kind: item.kind,
      machine_name: item.machine_name,
      recorded_at: item.recorded_at || null,
      kwh: item.kwh ?? null,
      status: item.status ?? null,
      entry_date: item.entry_date ?? null,
      total_kwh: item.total_kwh ?? null,
      idle_kwh: item.idle_kwh ?? null,
    }));
  });

export const addDetailedEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { machine_name?: string; recorded_at?: string; kwh?: number; status?: string };
    if (!o.machine_name || o.kwh === undefined) throw new Error("Missing required fields");
    return {
      machine_name: o.machine_name.trim(),
      recorded_at: o.recorded_at ? new Date(o.recorded_at).toISOString() : new Date().toISOString(),
      kwh: Number(o.kwh),
      status: o.status || "active",
    };
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const db = await getDb();
    const res = await db.collection("energy_entries").insertOne({
      user_id: userId,
      kind: "detailed",
      source: "manual",
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return { id: res.insertedId.toString() };
  });

export const addDailyEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { machine_name?: string; entry_date?: string; total_kwh?: number; idle_kwh?: number };
    if (!o.machine_name || !o.entry_date || o.total_kwh === undefined || o.idle_kwh === undefined) {
      throw new Error("Missing required fields");
    }
    return {
      machine_name: o.machine_name.trim(),
      entry_date: o.entry_date,
      total_kwh: Number(o.total_kwh),
      idle_kwh: Number(o.idle_kwh),
    };
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const db = await getDb();
    const res = await db.collection("energy_entries").insertOne({
      user_id: userId,
      kind: "daily",
      source: "manual",
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return { id: res.insertedId.toString() };
  });

export const deleteEnergyEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { id: string };
    return { id: o.id };
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const db = await getDb();
    
    // Non-admins can only delete their own entries
    const query: any = { _id: new ObjectId(data.id) };
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (user?.role !== "admin") {
      query.user_id = userId;
    }
    
    const res = await db.collection("energy_entries").deleteOne(query);
    return { deletedCount: res.deletedCount };
  });

export const clearAndInsertEntries = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { entries: Array<any> };
    if (!Array.isArray(o.entries)) throw new Error("entries array required");
    return { entries: o.entries };
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const db = await getDb();
    
    // Clear old entries
    await db.collection("energy_entries").deleteMany({ user_id: userId });
    
    if (data.entries.length > 0) {
      const documents = data.entries.map((e) => ({
        user_id: userId,
        kind: e.kind || "detailed",
        source: e.source || "csv",
        machine_name: e.machine_name || "",
        recorded_at: e.recorded_at ? new Date(e.recorded_at).toISOString() : null,
        kwh: e.kwh !== undefined ? Number(e.kwh) : null,
        status: e.status || null,
        entry_date: e.entry_date || null,
        total_kwh: e.total_kwh !== undefined ? Number(e.total_kwh) : null,
        idle_kwh: e.idle_kwh !== undefined ? Number(e.idle_kwh) : null,
        created_at: new Date(),
        updated_at: new Date(),
      }));
      await db.collection("energy_entries").insertMany(documents);
    }
    
    return { success: true, count: data.entries.length };
  });

export const updateUserSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { fullName?: string; company?: string; theme?: string; currency?: string; tariff_per_kwh?: number; notifications_enabled?: boolean };
    return o;
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const db = await getDb();
    
    const updateFields: any = {};
    if (data.fullName !== undefined) updateFields.full_name = data.fullName;
    if (data.company !== undefined) updateFields.company = data.company;
    if (data.theme !== undefined) updateFields.theme = data.theme;
    if (data.currency !== undefined) updateFields.currency = data.currency;
    if (data.tariff_per_kwh !== undefined) updateFields.tariff_per_kwh = Number(data.tariff_per_kwh);
    if (data.notifications_enabled !== undefined) updateFields.notifications_enabled = Boolean(data.notifications_enabled);
    updateFields.updated_at = new Date();
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );
    
    return { success: true };
  });

export const processAnalysisRun = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { energyData: any[]; shiftData: any[]; scheduleData: any[] };
    if (!Array.isArray(o.energyData) || !Array.isArray(o.shiftData) || !Array.isArray(o.scheduleData)) {
      throw new Error("Invalid input data arrays");
    }
    return o;
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const db = await getDb();

    // Fetch user settings to get the current tariff rate
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    const tariff = Number(user?.tariff_per_kwh ?? 8.0);

    const { energyData, shiftData, scheduleData } = data;

    // Helper to parse dates safely
    const parseDate = (d: any): number => {
      if (!d) return 0;
      if (typeof d === "string") {
        const normalized = d.trim().replace(" ", "T");
        const parsed = Date.parse(normalized);
        return isNaN(parsed) ? 0 : parsed;
      }
      const parsed = new Date(d).getTime();
      return isNaN(parsed) ? 0 : parsed;
    };

    // 1. Analyze active / idle status for each energy reading
    // Group energy meter readings by machine name
    const machineGroups = new Map<string, Array<{ timestamp: number; kwh: number; isIdle: boolean }>>();
    const uniqueMachines = new Set<string>();

    // Index schedules by machine_id for faster lookup
    const schedulesByMachine = new Map<string, Array<{ start: number; end: number }>>();
    scheduleData.forEach((s) => {
      const mId = String(s.machine_id || s.machine_name || "").trim();
      if (!mId) return;
      const start = parseDate(s.start);
      const end = parseDate(s.end);
      const list = schedulesByMachine.get(mId) ?? [];
      list.push({ start, end });
      schedulesByMachine.set(mId, list);
    });

    let totalKwh = 0;
    let totalIdleKwh = 0;

    energyData.forEach((row) => {
      const machineId = String(row.machine_id || row.machine_name || "").trim();
      if (!machineId) return;
      uniqueMachines.add(machineId);

      const kwh = Number(row.kwh ?? 0);
      const timestampStr = row.timestamp;
      const ts = parseDate(timestampStr);

      // Check if this reading matches any schedule
      const machineSchedules = schedulesByMachine.get(machineId) ?? [];
      const isActive = machineSchedules.some((s) => ts >= s.start && ts <= s.end);
      const isIdle = !isActive;

      totalKwh += kwh;
      if (isIdle) {
        totalIdleKwh += kwh;
      }

      const list = machineGroups.get(machineId) ?? [];
      list.push({ timestamp: ts, kwh, isIdle });
      machineGroups.set(machineId, list);
    });

    // 2. Build MachineRows
    const machines: any[] = [];
    machineGroups.forEach((readings, machine_name) => {
      let mTotal = 0;
      let mIdle = 0;
      readings.forEach((r) => {
        mTotal += r.kwh;
        if (r.isIdle) mIdle += r.kwh;
      });
      const mActive = mTotal - mIdle;
      const utilization_pct = mTotal > 0 ? (mActive / mTotal) * 100 : 0;
      const idle_cost_inr = mIdle * tariff;

      machines.push({
        machine_name,
        total_kwh: mTotal,
        idle_kwh: mIdle,
        active_kwh: mActive,
        utilization_pct,
        idle_cost_inr,
      });
    });

    // 3. Build HourlyPoints
    const hourlyGroups = new Map<string, number>();
    energyData.forEach((row) => {
      const timestampStr = row.timestamp;
      if (!timestampStr) return;
      try {
        const normalized = typeof timestampStr === "string" ? timestampStr.trim().replace(" ", "T") : timestampStr;
        const date = new Date(normalized);
        if (isNaN(date.getTime())) return;
        const hr = String(date.getHours()).padStart(2, "0") + ":00";
        const val = hourlyGroups.get(hr) ?? 0;
        hourlyGroups.set(hr, val + Number(row.kwh ?? 0));
      } catch {}
    });

    const hourly = Array.from(hourlyGroups.entries())
      .map(([hour, kwh]) => ({ hour, kwh }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // 4. Generate AI Recommendations
    let genai = {
      summary_narrative: "No recommendations available.",
      total_potential_savings_kwh: 0,
      recommendations: [] as any[],
      quick_wins: [] as string[],
    };

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && machines.length > 0) {
      try {
        const sys = `You are an industrial energy efficiency expert. Reply ONLY with strict JSON (no markdown, no code fences) matching exactly this shape:
{"summary_narrative":string,"total_potential_savings_kwh":number,"recommendations":[{"rank":number,"machine_name":string,"issue":string,"action":string,"estimated_monthly_savings_kwh":number,"estimated_monthly_savings_inr":number,"priority":"high"|"medium"|"low","implementation_effort":"easy"|"moderate"|"complex"}],"quick_wins":string[]}.
Tariff for INR conversion: ${tariff} INR/kWh. Top 5 recommendations max.`;

        const userPrompt = `Machine usage data (kWh):\n${JSON.stringify(machines)}\n\nOverall totals: total=${totalKwh.toFixed(1)} kWh, idle=${totalIdleKwh.toFixed(1)} kWh.`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: sys },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const content = json.choices?.[0]?.message?.content ?? "{}";
          genai = JSON.parse(content);
        }
      } catch (e) {
        console.error("AI recommendation generation failed:", e);
      }
    }

    const runId = new ObjectId().toString();

    // 5. Store run document
    const runDoc = {
      user_id: userId,
      run_id: runId,
      summary: {
        total_kwh: totalKwh,
        idle_kwh: totalIdleKwh,
        idle_cost_inr: totalIdleKwh * tariff,
        machines_analyzed: uniqueMachines.size,
      },
      machines,
      hourly,
      genai,
      created_at: new Date(),
    };

    await db.collection("runs").insertOne(runDoc);

    return { run_id: runId };
  });

export const fetchDashboardData = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => {
    const o = input as { runId: string };
    if (!o.runId) throw new Error("runId is required");
    return { runId: o.runId };
  })
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const db = await getDb();

    const run = await db.collection("runs").findOne({ run_id: data.runId, user_id: userId });
    if (!run) throw new Error("Analysis run not found");

    return {
      summary: run.summary,
      machines: run.machines,
      hourly: run.hourly,
      genai: run.genai,
    };
  });

