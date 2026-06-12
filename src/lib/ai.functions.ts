import { createServerFn } from "@tanstack/react-start";
import { getSessionCookie } from "./auth-cookie.server";
import { getDb } from "./mongodb.server";
import { verifySession } from "./auth-session.server";
import { ObjectId } from "mongodb";

export type AiInsights = {
  summary_narrative: string;
  total_potential_savings_kwh: number;
  predicted_next_month_kwh: number;
  recommendations: Array<{
    rank: number;
    machine_name: string;
    issue: string;
    action: string;
    estimated_monthly_savings_kwh: number;
    estimated_monthly_savings_inr: number;
    priority: "high" | "medium" | "low";
    implementation_effort: "easy" | "moderate" | "complex";
  }>;
  quick_wins: string[];
};

export const analyzeEnergy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { runId?: string };
    return { runId: o?.runId };
  })
  .handler(async ({ data }) => {
    const token = await getSessionCookie();
    if (!token) throw new Error("Unauthorized: No session token");
    const session = verifySession(token);
    if (!session || !session.userId) throw new Error("Unauthorized: Invalid session");

    const db = await getDb();

    // 1. Fetch user settings for tariff
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
    const tariff = Number(user?.tariff_per_kwh ?? 8.0);

    // 2. If runId is provided, fetch the existing run insights
    if (data?.runId) {
      const run = await db
        .collection("runs")
        .findOne({ run_id: data.runId, user_id: session.userId });
      if (run) {
        return {
          summary_narrative: run.genai?.summary_narrative || "No recommendations available.",
          total_potential_savings_kwh: run.genai?.total_potential_savings_kwh || 0,
          predicted_next_month_kwh:
            run.genai?.predicted_next_month_kwh || (run.summary?.total_kwh ?? 0) * 1.05,
          recommendations: run.genai?.recommendations || [],
          quick_wins: run.genai?.quick_wins || [],
        } as AiInsights;
      }
    }

    // 3. Otherwise, fallback to manual energy entries
    const entries = await db
      .collection("energy_entries")
      .find({ user_id: session.userId })
      .toArray();

    if (entries.length === 0) {
      throw new Error("Add some energy entries first.");
    }

    // 3. Aggregate entries per machine
    const agg = new Map<string, { total: number; idle: number }>();
    entries.forEach((e) => {
      const machineName = e.machine_name || "Unknown";
      const m = agg.get(machineName) ?? { total: 0, idle: 0 };
      if (e.kind === "daily") {
        m.total += Number(e.total_kwh ?? 0);
        m.idle += Number(e.idle_kwh ?? 0);
      } else {
        const k = Number(e.kwh ?? 0);
        m.total += k;
        if (e.status === "idle") m.idle += k;
      }
      agg.set(machineName, m);
    });

    const rows = Array.from(agg.entries()).map(([machine_name, v]) => ({
      machine_name,
      total_kwh: v.total,
      idle_kwh: v.idle,
      active_kwh: v.total - v.idle,
    }));

    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY not configured in .env");

    const rowsSlice = rows.slice(0, 50);
    const totalKwh = rowsSlice.reduce((s, r) => s + Number(r.total_kwh || 0), 0);
    const idleKwh = rowsSlice.reduce((s, r) => s + Number(r.idle_kwh || 0), 0);

    const sys = `You are an industrial energy efficiency expert. Reply ONLY with strict JSON (no markdown, no code fences) matching exactly this shape:
{"summary_narrative":string,"total_potential_savings_kwh":number,"predicted_next_month_kwh":number,"recommendations":[{"rank":number,"machine_name":string,"issue":string,"action":string,"estimated_monthly_savings_kwh":number,"estimated_monthly_savings_inr":number,"priority":"high"|"medium"|"low","implementation_effort":"easy"|"moderate"|"complex"}],"quick_wins":string[]}.
Tariff for INR conversion: ${tariff} INR/kWh. Top 5 recommendations max. Predict next month assuming similar utilization.`;

    const userPrompt = `Machine usage data (kWh):\n${JSON.stringify(rowsSlice)}\n\nOverall totals: total=${totalKwh.toFixed(1)} kWh, idle=${idleKwh.toFixed(1)} kWh.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
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

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Groq API error ${res.status}: ${t.slice(0, 200)}`);
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(content) as AiInsights;
    } catch {
      throw new Error("AI returned non-JSON response");
    }
  });
