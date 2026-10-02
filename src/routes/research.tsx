import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiFootnote, CopyButton, EmptyState, ErrorState, Field, ModuleLayout, OutputSkeleton, PageHeader, Panel, Segmented, selectCls } from "@/components/app/shared";
import { useAi } from "@/lib/use-ai";
import { logActivity } from "@/lib/store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — AI-Productivity-Assistant Property Holdings" },
      { name: "description", content: "Summaries, insights and recommendations on building topics in South Africa." },
      { property: "og:title", content: "Research Assistant — AI-Productivity-Assistant Property Holdings" },
      { property: "og:description", content: "AI research on regulations, materials and school design." },
    ],
  }),
  component: Research,
});

const schema = z.object({
  text: z.string().min(10, "Enter at least 10 characters"),
  output: z.enum(["Summary", "Insights", "Recommendations"]),
  length: z.enum(["Brief", "Standard", "In-depth"]),
  focus: z.string(),
});
type Form = z.infer<typeof schema>;
const Result = z.object({ summary: z.string(), insights: z.array(z.string()), recommendations: z.array(z.string()), verify: z.array(z.string()) });

function Research() {
  const ai = useAi("research", Result);
  const f = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { text: "", output: "Summary", length: "Standard", focus: "" } });
  const onSubmit = async (v: Form) => {
    const r = await ai.run(v);
    if (r) logActivity(`Research: ${v.text.slice(0, 50)}${v.text.length > 50 ? "…" : ""}`, "Research Assistant");
  };
  const d = ai.data;
  const text = d ? `Summary\n${d.summary}\n\nKey Insights\n- ${d.insights.join("\n- ")}\n\nRecommendations\n- ${d.recommendations.join("\n- ")}\n\nThings to verify\n- ${d.verify.join("\n- ")}` : "";

  return (
    <>
      <PageHeader title="Research Assistant" description="Paste an article or ask a question about building, materials or regulations." />
      <ModuleLayout
        input={
          <Panel title="Source or question">
            <form onSubmit={f.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Field label="Article text or topic" htmlFor="text" error={f.formState.errors.text?.message}><Textarea id="text" rows={9} placeholder="e.g. What are the SANS 10400-XA requirements for school classrooms?" {...f.register("text")} /></Field>
              <Field label="Output type"><Segmented label="Output type" value={f.watch("output")} options={["Summary", "Insights", "Recommendations"] as const} onChange={(x) => f.setValue("output", x)} /></Field>
              <Field label="Length"><Segmented label="Length" value={f.watch("length")} options={["Brief", "Standard", "In-depth"] as const} onChange={(x) => f.setValue("length", x)} /></Field>
              <Field label="Focus (optional)" htmlFor="focus">
                <select id="focus" className={selectCls} {...f.register("focus")}>
                  <option value="">None</option>
                  {["Building regulations", "Materials", "School design", "Sustainability", "Safety"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Button type="submit" className="w-full" disabled={ai.loading}><Sparkles className="mr-2 h-4 w-4" />{ai.loading ? "Researching…" : "Run research"}</Button>
            </form>
          </Panel>
        }
        output={
          <Panel title="Findings" actions={d && !ai.loading ? <CopyButton text={text} /> : null}>
            {ai.loading ? <OutputSkeleton /> : ai.error && !d ? <ErrorState message={ai.error} onRetry={ai.retry} /> : d ? (
              <div className="space-y-6">
                <section><h3 className="mb-2 text-sm font-semibold text-primary">Summary</h3><p className="text-sm leading-relaxed">{d.summary}</p></section>
                {([["Key Insights", d.insights], ["Recommendations", d.recommendations], ["Things to verify", d.verify]] as const).map(([t, list]) => (
                  <section key={t}><h3 className="mb-2 text-sm font-semibold text-primary">{t}</h3><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{list.map((x) => <li key={x}>{x}</li>)}</ul></section>
                ))}
                <div className="flex gap-2 rounded-lg bg-amber-soft p-3 text-xs text-amber-foreground"><Info className="h-4 w-4 shrink-0" />Always verify regulatory information against current SANS standards, NHBRC requirements and your local municipality.</div>
                <AiFootnote />
              </div>
            ) : <EmptyState text="Your summary, insights and recommendations will appear here." />}
          </Panel>
        }
      />
    </>
  );
}
