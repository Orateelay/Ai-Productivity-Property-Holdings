import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AiFootnote, EmptyState, ErrorState, Field, ModuleLayout, OutputSkeleton, PageHeader, Panel, Pill, Segmented, selectCls } from "@/components/app/shared";
import { ARCHITECTS } from "@/lib/architects";
import { useAi } from "@/lib/use-ai";
import { logActivity, SEED_ENQUIRIES, useLocal, zar, type Enquiry } from "@/lib/store";

export const Route = createFileRoute("/estimator")({
  validateSearch: (s: Record<string, unknown>) => ({ architect: typeof s['architect'] === "string" ? s['architect'] : undefined }),
  head: () => ({
    meta: [
      { title: "Cost Estimator — AI-Productivity-Assistant Property Holdings" },
      { name: "description", content: "Get an indicative ZAR cost range for building a house or school in South Africa." },
      { property: "og:title", content: "Cost Estimator — AI-Productivity-Assistant Property Holdings" },
      { property: "og:description", content: "Indicative build cost ranges for houses and schools in South Africa." },
    ],
  }),
  component: Estimator,
});

const PROVINCES = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"];
const EXTRAS = ["Pool", "Solar", "Borehole", "Garage", "Boundary wall"];

const schema = z.object({
  type: z.enum(["House", "School"]),
  city: z.string().min(2, "Enter a town or city"),
  province: z.string(),
  area: z.coerce.number().min(30, "Minimum 30 m²").max(50000),
  bedrooms: z.coerce.number().min(0).max(20).optional(),
  bathrooms: z.coerce.number().min(0).max(20).optional(),
  classrooms: z.coerce.number().min(0).max(200).optional(),
  storeys: z.coerce.number().min(1).max(5),
  finish: z.enum(["Basic", "Standard", "Premium"]),
  extras: z.array(z.string()),
  architect: z.string().min(1, "Choose an architect"),
  client: z.string().min(2, "Enter the client name"),
  email: z.string().email("Enter a valid email"),
  notes: z.string().max(1000).optional(),
});
type Form = z.infer<typeof schema>;

const Range = z.object({ low: z.number(), high: z.number() });
const Result = Range.extend({
  timelineMonths: z.number(),
  breakdown: z.array(Range.extend({ item: z.string() })).min(1),
  assumptions: z.array(z.string()),
  nextSteps: z.array(z.string()),
  disclaimer: z.string().optional(),
});

function Estimator() {
  const { architect } = Route.useSearch();
  const preset = ARCHITECTS.find((a) => a.id === architect)?.name ?? "";
  const [enquiries, setEnquiries] = useLocal<Enquiry[]>("apa.enquiries", SEED_ENQUIRIES);
  const ai = useAi("estimate", Result);
  const f = useForm<Form>({
    resolver: zodResolver(schema) as never,
    defaultValues: { type: "House", city: "", province: "Gauteng", area: 200, bedrooms: 3, bathrooms: 2, classrooms: 12, storeys: 1, finish: "Standard", extras: [], architect: preset, client: "", email: "", notes: "" },
  });
  const type = f.watch("type");
  const extras = f.watch("extras");
  const e = f.formState.errors;

  const onSubmit = async (v: Form) => {
    const { classrooms, bedrooms, bathrooms, ...rest } = v;
    const sizing = v.type === "House" ? { bedrooms, bathrooms } : { classrooms };
    const r = await ai.run({ ...rest, ...sizing, location: `${v.city}, ${v.province}, South Africa` });
    if (r) logActivity(`Estimate generated for ${v.type.toLowerCase()} in ${v.city}`, "Cost Estimator");
  };

  const save = () => {
    if (!ai.data) return;
    const v = f.getValues();
    setEnquiries((p) => [{ id: crypto.randomUUID(), client: v.client, email: v.email, type: v.type, location: `${v.city}, ${v.province}`, area: v.area, architect: v.architect, low: ai.data!.low, high: ai.data!.high, status: "New", at: new Date().toISOString(), notes: v.notes }, ...p]);
    logActivity(`Enquiry saved for ${v.client}`, "Cost Estimator");
    toast.success("Enquiry saved");
  };

  return (
    <>
      <PageHeader title="Cost Estimator" description="Client enquiries — indicative cost ranges for houses and schools." />
      <ModuleLayout
        input={
          <Panel title="Project details">
            <form onSubmit={f.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Field label="Project type"><Segmented label="Project type" value={type} options={["House", "School"] as const} onChange={(x) => f.setValue("type", x)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Town / city" htmlFor="city" error={e.city?.message}><Input id="city" placeholder="e.g. Centurion" {...f.register("city")} /></Field>
                <Field label="Province" htmlFor="province"><select id="province" className={selectCls} {...f.register("province")}>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>
                <Field label="Floor area (m²)" htmlFor="area" error={e.area?.message}><Input id="area" type="number" {...f.register("area")} /></Field>
                <Field label="Storeys" htmlFor="storeys" error={e.storeys?.message}><Input id="storeys" type="number" {...f.register("storeys")} /></Field>
                {type === "House" ? (<>
                  <Field label="Bedrooms" htmlFor="bed"><Input id="bed" type="number" {...f.register("bedrooms")} /></Field>
                  <Field label="Bathrooms" htmlFor="bath"><Input id="bath" type="number" {...f.register("bathrooms")} /></Field>
                </>) : (
                  <Field label="Classrooms" htmlFor="cls"><Input id="cls" type="number" {...f.register("classrooms")} /></Field>
                )}
              </div>
              <Field label="Finish level"><Segmented label="Finish level" value={f.watch("finish")} options={["Basic", "Standard", "Premium"] as const} onChange={(x) => f.setValue("finish", x)} /></Field>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Extras</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {EXTRAS.map((x) => (
                    <label key={x} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={extras.includes(x)} onCheckedChange={(c) => f.setValue("extras", c ? [...extras, x] : extras.filter((y) => y !== x))} />{x}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label="Preferred architect" htmlFor="arch" error={e.architect?.message}>
                <select id="arch" className={selectCls} {...f.register("architect")}>
                  <option value="">Select…</option>
                  {ARCHITECTS.map((a) => <option key={a.id} value={a.name}>{a.name} — {a.firm}</option>)}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Client name" htmlFor="client" error={e.client?.message}><Input id="client" {...f.register("client")} /></Field>
                <Field label="Email" htmlFor="email" error={e.email?.message}><Input id="email" type="email" {...f.register("email")} /></Field>
              </div>
              <Field label="Notes" htmlFor="notes"><Textarea id="notes" rows={3} {...f.register("notes")} /></Field>
              <Button type="submit" className="w-full" disabled={ai.loading}><Sparkles className="mr-2 h-4 w-4" />{ai.loading ? "Estimating…" : "Generate estimate"}</Button>
            </form>
          </Panel>
        }
        output={
          <Panel title="Estimate" actions={ai.data && !ai.loading ? <Button size="sm" variant="outline" onClick={save}><Save className="mr-2 h-4 w-4" />Save enquiry</Button> : null}>
            {ai.loading ? <OutputSkeleton /> : ai.error && !ai.data ? <ErrorState message={ai.error} onRetry={ai.retry} /> : ai.data ? (
              <div className="space-y-6">
                <div className="rounded-xl bg-primary p-5 text-primary-foreground">
                  <p className="text-xs uppercase tracking-wider opacity-80">Estimated cost range</p>
                  <p className="mt-1 text-2xl font-semibold sm:text-3xl">{zar(ai.data.low)} – {zar(ai.data.high)}</p>
                  <p className="mt-2 text-sm opacity-80">Timeline: approx. {ai.data.timelineMonths} months</p>
                  <p className="mt-3 inline-block rounded-md bg-amber px-2 py-1 text-xs font-medium text-amber-foreground">Indicative estimate only, not a formal quotation.</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Low</TableHead><TableHead className="text-right">High</TableHead></TableRow></TableHeader>
                    <TableBody>{ai.data.breakdown.map((b) => <TableRow key={b.item}><TableCell>{b.item}</TableCell><TableCell className="text-right">{zar(b.low)}</TableCell><TableCell className="text-right">{zar(b.high)}</TableCell></TableRow>)}</TableBody>
                  </Table>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div><h3 className="mb-2 text-sm font-semibold text-primary">Key assumptions</h3><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{ai.data.assumptions.map((a) => <li key={a}>{a}</li>)}</ul></div>
                  <div><h3 className="mb-2 text-sm font-semibold text-primary">Next steps</h3><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{ai.data.nextSteps.map((a) => <li key={a}>{a}</li>)}</ul></div>
                </div>
                <AiFootnote />
              </div>
            ) : <EmptyState text="Fill in the project details and generate an indicative estimate." />}
          </Panel>
        }
      />
      <Panel title="Saved enquiries" className="mt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Architect</TableHead><TableHead>Range</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {enquiries.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.client}</TableCell><TableCell>{q.type}</TableCell><TableCell>{q.location}</TableCell><TableCell>{q.architect}</TableCell>
                  <TableCell className="whitespace-nowrap">{zar(q.low)} – {zar(q.high)}</TableCell><TableCell><Pill label={q.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </>
  );
}
