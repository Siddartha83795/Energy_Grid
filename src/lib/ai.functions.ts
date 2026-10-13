import { createServerFn } from "@tanstack/react-start";

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
    confidence?: number;
    evidence?: string[];
  }>;
  quick_wins: string[];
};

export const analyzeEnergy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { runId?: string };
    return { runId: o?.runId };
  })
  .handler(async ({ data }) => {
    const { getSessionCookie } = await import("./auth-cookie.server");
    const { verifySession } = await import("./auth-session.server");
    const { getDb } = await import("./mongodb.server");
    const { ObjectId } = await import("mongodb");

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
        const hasRichInsights =
          run.genai &&
          run.genai.summary_narrative &&
          run.genai.summary_narrative !== "No recommendations available." &&
          run.genai.predicted_next_month_kwh !== undefined &&
          (run.genai.recommendations?.length === 0 ||
            run.genai.recommendations?.[0]?.confidence !== undefined);

        if (hasRichInsights) {
          return {
            summary_narrative: run.genai.summary_narrative,
            total_potential_savings_kwh: run.genai.total_potential_savings_kwh || 0,
            predicted_next_month_kwh: run.genai.predicted_next_month_kwh,
            recommendations: run.genai.recommendations || [],
            quick_wins: run.genai.quick_wins || [],
          } as AiInsights;
        }

        // Generate rich insights on demand for this run!
        const key = (process.env.GROQ_API_KEY || "").replace(/^["']|["']$/g, "").trim();
        const model = (process.env.GROQ_MODEL || "openai/gpt-oss-120b").replace(/^["']|["']$/g, "").trim();
        if (!key) throw new Error("GROQ_API_KEY not configured in .env");

        const machines = run.machines || [];
        const totalKwh = run.summary?.total_kwh || 0;
        const idleKwh = run.summary?.idle_kwh || 0;

        const sys = `You are an industrial energy efficiency expert. Reply ONLY with strict JSON (no markdown, no code fences) matching exactly this shape:
{"summary_narrative":string,"total_potential_savings_kwh":number,"predicted_next_month_kwh":number,"recommendations":[{"rank":number,"machine_name":string,"issue":string,"action":string,"estimated_monthly_savings_kwh":number,"estimated_monthly_savings_inr":number,"priority":"high"|"medium"|"low","implementation_effort":"easy"|"moderate"|"complex","confidence":number,"evidence":[string]}],"quick_wins":string[]}.
Tariff for INR conversion: ${tariff} INR/kWh. Top 5 recommendations max. Predict next month assuming similar utilization. Exclude code block backticks.`;

        const userPrompt = `Machine usage data (kWh):\n${JSON.stringify(machines.slice(0, 50))}\n\nOverall totals: total=${totalKwh.toFixed(1)} kWh, idle=${idleKwh.toFixed(1)} kWh.`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model,
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
          const result = JSON.parse(content) as AiInsights;
          await db
            .collection("runs")
            .updateOne(
              { run_id: data.runId, user_id: session.userId },
              { $set: { genai: result } },
            );
          return result;
        } catch {
          throw new Error("AI returned non-JSON response");
        }
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

    const key = (process.env.GROQ_API_KEY || "").replace(/^["']|["']$/g, "").trim();
    const model = (process.env.GROQ_MODEL || "openai/gpt-oss-120b").replace(/^["']|["']$/g, "").trim();
    if (!key) throw new Error("GROQ_API_KEY not configured in .env");

    const rowsSlice = rows.slice(0, 50);
    const totalKwh = rowsSlice.reduce((s, r) => s + Number(r.total_kwh || 0), 0);
    const idleKwh = rowsSlice.reduce((s, r) => s + Number(r.idle_kwh || 0), 0);

    const sys = `You are an industrial energy efficiency expert. Reply ONLY with strict JSON (no markdown, no code fences) matching exactly this shape:
{"summary_narrative":string,"total_potential_savings_kwh":number,"predicted_next_month_kwh":number,"recommendations":[{"rank":number,"machine_name":string,"issue":string,"action":string,"estimated_monthly_savings_kwh":number,"estimated_monthly_savings_inr":number,"priority":"high"|"medium"|"low","implementation_effort":"easy"|"moderate"|"complex","confidence":number,"evidence":[string]}],"quick_wins":string[]}.
Tariff for INR conversion: ${tariff} INR/kWh. Top 5 recommendations max. Predict next month assuming similar utilization. Exclude code block backticks.`;

    const userPrompt = `Machine usage data (kWh):\n${JSON.stringify(rowsSlice)}\n\nOverall totals: total=${totalKwh.toFixed(1)} kWh, idle=${idleKwh.toFixed(1)} kWh.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: model,
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

export const getRecommendationRootCauses = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => {
    const o = input as { runId: string };
    if (!o.runId) throw new Error("Missing runId");
    return o;
  })
  .handler(async ({ data }) => {
    const { getSessionCookie } = await import("./auth-cookie.server");
    const { verifySession } = await import("./auth-session.server");
    const token = await getSessionCookie();
    if (!token) throw new Error("Unauthorized: No session token");
    const session = verifySession(token);
    if (!session || !session.userId) throw new Error("Unauthorized: Invalid session");
    const userId = session.userId;

    const { getDb } = await import("./mongodb.server");
    const db = await getDb();

    // Check cache
    const cached = await db
      .collection("recommendation_root_causes")
      .find({ user_id: userId, run_id: data.runId })
      .toArray();

    if (cached.length > 0) {
      return cached.map((c) => ({
        rank: c.rank,
        root_cause: c.root_cause,
      }));
    }

    // Find recommendations from runs
    const run = await db.collection("runs").findOne({ run_id: data.runId, user_id: userId });
    const recommendations = run?.genai?.recommendations || [];

    if (recommendations.length === 0) return [];

    const key = (process.env.GROQ_API_KEY || "").replace(/^["']|["']$/g, "").trim();
    const model = (process.env.GROQ_MODEL || "openai/gpt-oss-120b").replace(/^["']|["']$/g, "").trim();

    const results: Array<{ rank: number; root_cause: string }> = [];

    if (key) {
      try {
        const sysPrompt = `You are an industrial energy root-cause analyst.
Given a list of energy waste recommendations, determine a plausible root cause for each machine's idle energy waste.
Reply ONLY with a strict JSON object containing a mapping of recommendation rank to a single-sentence root cause explanation starting with "Likely cause: ".
Shape: {"root_causes": [{"rank": number, "root_cause": string}]}`;

        const userPrompt = `Recommendations:\n${JSON.stringify(
          recommendations.map((r: any) => ({
            rank: r.rank,
            machine_name: r.machine_name,
            issue: r.issue,
            action: r.action,
          })),
        )}`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model,
            temperature: 0.5,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: sysPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (res.ok) {
          const resJson = (await res.json()) as any;
          const content = resJson.choices?.[0]?.message?.content ?? "{}";
          const parsed = JSON.parse(content) as {
            root_causes?: Array<{ rank: number; root_cause: string }>;
          };
          if (parsed.root_causes && Array.isArray(parsed.root_causes)) {
            results.push(...parsed.root_causes);
          }
        }
      } catch (e) {
        console.error("Groq root-causes generation failed:", e);
      }
    }

    // Populate missing or fallback if API failed
    recommendations.forEach((r: any) => {
      const exists = results.some((x) => x.rank === r.rank);
      if (!exists) {
        results.push({
          rank: r.rank,
          root_cause: `Likely cause: standby operation during ${r.machine_name} inactive shifts.`,
        });
      }
    });

    // Save cache
    const docs = results.map((r) => ({
      user_id: userId,
      run_id: data.runId,
      rank: r.rank,
      root_cause: r.root_cause,
      created_at: new Date(),
    }));

    if (docs.length > 0) {
      await db.collection("recommendation_root_causes").insertMany(docs);
    }

    return results;
  });

export type EnergyChatResponse = {
  answer: string;
  cited_machines: string[];
  evidence: string[];
  confidence: number;
  persona: "Watch" | "Diagnose" | "Act" | "Brief";
};

export const askEnergyData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { question?: string; runId?: string };
    if (!o.question || typeof o.question !== "string" || !o.question.trim()) {
      throw new Error("Please ask a valid question.");
    }
    return { question: o.question.trim(), runId: o.runId };
  })
  .handler(async ({ data }): Promise<EnergyChatResponse> => {
    const { getSessionCookie } = await import("./auth-cookie.server");
    const { verifySession } = await import("./auth-session.server");
    const token = await getSessionCookie();
    if (!token) throw new Error("Unauthorized: No session token");
    const session = verifySession(token);
    if (!session || !session.userId) throw new Error("Unauthorized: Invalid session");
    const userId = session.userId;

    const { getDb } = await import("./mongodb.server");
    const db = await getDb();

    // 1. Gather context from MongoDB
    const runs = await db
      .collection("runs")
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(3)
      .toArray();

    const entries = await db
      .collection("energy_entries")
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    const actionItems = await db
      .collection("action_queue")
      .find({ user_id: userId })
      .limit(20)
      .toArray();

    const user = await db
      .collection("users")
      .findOne({ _id: (await import("mongodb")).ObjectId.createFromHexString(userId) });
    const tariff = Number(user?.tariff_per_kwh ?? 8.0);

    // Summarize machine data context
    const machineMap = new Map<
      string,
      { total_kwh: number; idle_kwh: number; idle_cost_inr: number }
    >();
    runs.forEach((r) => {
      (r.machines || []).forEach((m: any) => {
        const name = m.machine_name || "Unknown";
        const cur = machineMap.get(name) || { total_kwh: 0, idle_kwh: 0, idle_cost_inr: 0 };
        cur.total_kwh += m.total_kwh || 0;
        cur.idle_kwh += m.idle_kwh || 0;
        cur.idle_cost_inr += m.idle_cost_inr || (m.idle_kwh || 0) * tariff;
        machineMap.set(name, cur);
      });
    });

    entries.forEach((e) => {
      const name = e.machine_name || "Unknown";
      const cur = machineMap.get(name) || { total_kwh: 0, idle_kwh: 0, idle_cost_inr: 0 };
      if (e.kind === "daily") {
        cur.total_kwh += Number(e.total_kwh || 0);
        cur.idle_kwh += Number(e.idle_kwh || 0);
        cur.idle_cost_inr += Number(e.idle_kwh || 0) * tariff;
      } else {
        const kwh = Number(e.kwh || 0);
        cur.total_kwh += kwh;
        if (e.status === "idle") {
          cur.idle_kwh += kwh;
          cur.idle_cost_inr += kwh * tariff;
        }
      }
      machineMap.set(name, cur);
    });

    const contextMachines = Array.from(machineMap.entries()).map(([machine_name, stats]) => ({
      machine_name,
      total_kwh: Math.round(stats.total_kwh * 10) / 10,
      idle_kwh: Math.round(stats.idle_kwh * 10) / 10,
      idle_cost_inr: Math.round(stats.idle_cost_inr),
      idle_ratio_pct:
        stats.total_kwh > 0 ? Math.round((stats.idle_kwh / stats.total_kwh) * 100) : 0,
    }));

    const contextActions = actionItems.map((a) => ({
      machine_id: a.machine_id,
      issue: a.issue,
      root_cause: a.root_cause,
      status: a.status,
    }));

    const key = (process.env.GROQ_API_KEY || "").replace(/^["']|["']$/g, "").trim();
    const model = (process.env.GROQ_MODEL || "openai/gpt-oss-120b").replace(/^["']|["']$/g, "").trim();

    if (key && contextMachines.length > 0) {
      try {
        const sysPrompt = `You are the Conversational Energy Advisor Q&A Assistant.
Reply ONLY with a valid JSON object matching exactly this shape:
{"answer": string, "cited_machines": [string], "evidence": [string], "confidence": number, "persona": "Watch"|"Diagnose"|"Act"|"Brief"}.

RULES:
1. Base your answer strictly on the provided user energy dataset.
2. Always cite specific machine names and numbers in 'cited_machines' and 'evidence'.
3. READ-ONLY GUARDRAIL: Do not execute actions or change database state; answer questions concisely and informatively.
4. Select persona: 'Watch' if identifying waste/anomalies, 'Diagnose' if explaining causes, 'Act' if discussing recommended fixes, or 'Brief' if giving general summaries.
5. Tariff rate: ₹${tariff}/kWh.`;

        const userPrompt = `User Question: "${data.question}"

Available Machine Dataset:
${JSON.stringify(contextMachines)}

Action Queue Items:
${JSON.stringify(contextActions)}`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model,
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: sysPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (res.ok) {
          const resJson = (await res.json()) as any;
          const content = resJson.choices?.[0]?.message?.content ?? "{}";
          const parsed = JSON.parse(content) as EnergyChatResponse;
          if (parsed.answer) {
            return {
              answer: parsed.answer,
              cited_machines: parsed.cited_machines || [],
              evidence: parsed.evidence || [],
              confidence: parsed.confidence || 0.9,
              persona: parsed.persona || "Brief",
            };
          }
        }
      } catch (e) {
        console.error("Groq chat Q&A call failed:", e);
      }
    }

    // Smart local fallback if API unavailable or dataset empty
    if (contextMachines.length > 0) {
      const highestWaste = [...contextMachines].sort((a, b) => b.idle_kwh - a.idle_kwh)[0];
      return {
        answer: `Based on your uploaded dataset, ${highestWaste.machine_name} produced the highest standby energy waste with ${highestWaste.idle_kwh} kWh (${highestWaste.idle_ratio_pct}% idle ratio), resulting in ₹${highestWaste.idle_cost_inr.toLocaleString("en-IN")} in lost operating cost.`,
        cited_machines: [highestWaste.machine_name],
        evidence: [
          `Standby draw: ${highestWaste.idle_kwh} kWh`,
          `Idle waste cost: ₹${highestWaste.idle_cost_inr}`,
          `Idle ratio: ${highestWaste.idle_ratio_pct}%`,
        ],
        confidence: 0.95,
        persona: "Watch",
      };
    }

    return {
      answer:
        "No active machine telemetry found in your session. Please upload a meter readings CSV or log entries to ask questions about your energy data.",
      cited_machines: [],
      evidence: ["Dataset is empty"],
      confidence: 1.0,
      persona: "Brief",
    };
  });
