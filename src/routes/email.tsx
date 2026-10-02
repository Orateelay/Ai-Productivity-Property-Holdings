import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RotateCw, Sparkles, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AiFootnote, CopyButton, EmptyState, ErrorState, Field, ModuleLayout, OutputSkeleton, PageHeader, Panel, Segmented, selectCls } from "@/components/app/shared";
import { useAi } from "@/lib/use-ai";
import { logActivity, zar, type Enquiry } from "@/lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — AI-Productivity-Assistant Property Holdings" },
      { name: "description", content: "Draft professional emails to clients, architects, suppliers and subcontractors." },
      { property: "og:title", content: "Email Generator — AI-Productivity-Assistant Property Holdings" },
      { property: "og:description", content: "AI-drafted construction emails in seconds." },
    ],
  }),
  component: EmailPage,
});

const schema = z.object({
  recipient: z.enum(["Client", "Architect", "Supplier", "Subcontractor"]),
  purpose: z.string().min(3, "Describe the purpose"),
  points: z.string().min(5, "Add some key points"),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  length: z.enum(["Short", "Medium", "Detailed"]),
});
type Form = z.infer<typeof schema>;
const Result = z.object({ subject: z.string(), body: z.string() });

function EmailPage() {
  const ai = useAi("email", Result);
  const f = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { recipient: "Client", purpose: "", points: "", tone: "Formal", length: "Medium" } });
  const e = f.formState.errors;

  const useEnquiry = () => {
    const list: Enquiry[] = JSON.parse(localStorage.getItem("apa.enquiries") ?? "[]");
    const q = list[0];
    if (!q) { toast.error("No saved enquiries yet"); return; }
    f.setValue("recipient", "Client");
    f.setValue("purpose", `Follow up on ${q.type.toLowerCase()} build enquiry`);
    f.setValue("points", `Client: ${q.client} (${q.email})\nProject: ${q.type}, ${q.area} m² in ${q.location}\nArchitect: ${q.architect}\nIndicative range: ${zar(q.low)} – ${zar(q.high)}${q.notes ? `\nNotes: ${q.notes}` : ""}\nPropose a site visit next week.`);
    toast.success(`Pre-filled from ${q.client}'s enquiry`);
  };

  const onSubmit = async (v: Form) => {
    const r = await ai.run(v);
    if (r) logActivity(`Email drafted: ${r.subject}`, "Email Generator");
  };

  return (
    <>
      <PageHeader title="Email Generator" description="Draft clear, professional emails for every stakeholder." />
      <ModuleLayout
        input={
          <Panel title="Email brief" actions={<Button variant="ghost" size="sm" onClick={useEnquiry}><FileDown className="mr-2 h-4 w-4" />Use enquiry details</Button>}>
            <form onSubmit={f.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Field label="Recipient type" htmlFor="rec"><select id="rec" className={selectCls} {...f.register("recipient")}>{["Client", "Architect", "Supplier", "Subcontractor"].map((r) => <option key={r}>{r}</option>)}</select></Field>
              <Field label="Purpose" htmlFor="purpose" error={e.purpose?.message}><Input id="purpose" placeholder="e.g. Request quote for roof trusses" {...f.register("purpose")} /></Field>
              <Field label="Key points" htmlFor="points" error={e.points?.message}><Textarea id="points" rows={6} {...f.register("points")} /></Field>
              <Field label="Tone"><Segmented label="Tone" value={f.watch("tone")} options={["Formal", "Friendly", "Persuasive"] as const} onChange={(x) => f.setValue("tone", x)} /></Field>
              <Field label="Length"><Segmented label="Length" value={f.watch("length")} options={["Short", "Medium", "Detailed"] as const} onChange={(x) => f.setValue("length", x)} /></Field>
              <Button type="submit" className="w-full" disabled={ai.loading}><Sparkles className="mr-2 h-4 w-4" />{ai.loading ? "Drafting…" : "Generate email"}</Button>
            </form>
          </Panel>
        }
        output={
          <Panel title="Preview" actions={ai.data && !ai.loading ? <div className="flex gap-2"><CopyButton text={`Subject: ${ai.data.subject}\n\n${ai.data.body}`} /><Button size="sm" variant="outline" onClick={ai.retry}><RotateCw className="mr-2 h-4 w-4" />Regenerate</Button></div> : null}>
            {ai.loading ? <OutputSkeleton /> : ai.error && !ai.data ? <ErrorState message={ai.error} onRetry={ai.retry} /> : ai.data ? (
              <div>
                <div className="rounded-xl border">
                  <div className="border-b bg-muted px-5 py-3 text-sm"><span className="text-muted-foreground">Subject: </span><span className="font-medium text-primary">{ai.data.subject}</span></div>
                  <div className="whitespace-pre-wrap break-words px-5 py-4 text-sm leading-relaxed">{ai.data.body}</div>
                </div>
                <AiFootnote />
              </div>
            ) : <EmptyState text="Describe your email and generate a draft." />}
          </Panel>
        }
      />
    </>
  );
}
