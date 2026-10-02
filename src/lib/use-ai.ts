import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { ZodType } from "zod";
import { runAi } from "./ai.functions";

type Mode = "estimate" | "email" | "planner" | "research";

export function useAi<T>(mode: Mode, schema: ZodType<T>) {
  const call = useServerFn(runAi);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const last = useRef<Record<string, unknown> | null>(null);

  async function run(payload?: Record<string, unknown>): Promise<T | undefined> {
    const p = payload ?? last.current;
    if (!p) return undefined;
    last.current = p;
    setLoading(true); setError(null);
    try {
      const res: { ok: boolean; error?: string; json?: string } = await call({ data: { mode, payload: p } });
      if (!res.ok || !res.json) throw new Error(res.error ?? "AI error");
      const parsed = schema.safeParse(JSON.parse(res.json));
      if (!parsed.success) throw new Error("The AI response was incomplete. Please retry.");
      setData(parsed.data);
      return parsed.data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg); toast.error(msg);
      return undefined;
    } finally { setLoading(false); }
  }
  return { data, loading, error, run, retry: () => run() };
}
