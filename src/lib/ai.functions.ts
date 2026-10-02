import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

const LIMIT = 30; // requests per IP per hour
const hits = new Map<string, number[]>();

const PROMPTS: Record<string, string> = {
  estimate: `You are an experienced South African quantity surveyor (2026 prices, ZAR). Given a house or school brief, produce an indicative estimate. ALWAYS return a range, assumptions and a disclaimer. Respond ONLY with JSON:
{"low":number,"high":number,"timelineMonths":number,"breakdown":[{"item":"Foundation"|"Structure"|"Roofing"|"Finishes"|"Electrical"|"Plumbing"|"Professional fees"|"Contingency","low":number,"high":number}],"assumptions":string[],"nextSteps":string[],"disclaimer":string}
Include all 8 breakdown items. Factor in regional cost differences, storeys, finish level and extras.`,
  email: `You write professional emails for a South African construction contractor that builds houses and schools. Respond ONLY with JSON: {"subject":string,"body":string}. Use plain text body with line breaks, sign off as "AI-Productivity-Assistant Property Holdings".`,
  planner: `You are a productivity coach for a construction contractor. Prioritise tasks Eisenhower-style and schedule them within working hours. Respond ONLY with JSON:
{"items":[{"title":string,"day":string,"start":"HH:MM","end":"HH:MM","priority":"High"|"Medium"|"Low","quadrant":"Do"|"Schedule"|"Delegate"|"Eliminate","reason":string}],"warnings":string[]}
For daily mode use day "Today". For weekly mode use Monday..Friday. Add a warning for every task that does not fit or misses its deadline.`,
  research: `You are a research assistant for a South African building contractor (houses and schools). Reference SANS 10400, NHBRC and relevant norms where helpful. Respond ONLY with JSON: {"summary":string,"insights":string[],"recommendations":string[],"verify":string[]}`,
};

const Input = z.object({
  mode: z.enum(["estimate", "email", "planner", "research"]),
  payload: z.record(z.any()),
});

export const runAi = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000);
    if (recent.length >= LIMIT) {
      return { ok: false as const, error: "Rate limit reached. Please try again in an hour." };
    }
    recent.push(now);
    hits.set(ip, recent);

    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { ok: false as const, error: "AI service is not configured." };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: PROMPTS[data.mode],
        input: JSON.stringify(data.payload),
        text: { format: { type: "json_object" } },
      }),
    });
    if (res.status === 429) return { ok: false as const, error: "AI is busy right now. Please retry shortly." };
    if (res.status === 402) return { ok: false as const, error: "AI credits are exhausted." };
    if (!res.ok) return { ok: false as const, error: "The AI service returned an error." };
    const json = await res.json();
    const text: string =
      json.output_text ??
      (json.output ?? [])
        .flatMap((o: { content?: { type: string; text?: string }[] }) => o.content ?? [])
        .filter((c: { type: string }) => c.type === "output_text")
        .map((c: { text?: string }) => c.text ?? "")
        .join("");
    try {
      const cleaned = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
      JSON.parse(cleaned);
      return { ok: true as const, json: cleaned };
    } catch {
      return { ok: false as const, error: "Could not read the AI response. Please retry." };
    }
  });
