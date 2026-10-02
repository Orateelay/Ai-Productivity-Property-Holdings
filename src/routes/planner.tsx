import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiFootnote, CopyButton, EmptyState, ErrorState, Field, ModuleLayout, OutputSkeleton, PageHeader, Panel, Pill, Segmented, selectCls } from "@/components/app/shared";
import { useAi } from "@/lib/use-ai";
import { logActivity, useLocal } from "@/lib/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner — AI-Productivity-Assistant Property Holdings" },
      { name: "description", content: "Turn construction tasks into a prioritised daily or weekly schedule." },
      { property: "og:title", content: "Task Planner — AI-Productivity-Assistant Property Holdings" },
      { property: "og:description", content: "Eisenhower-style AI scheduling for builders." },
    ],
  }),
  component: Planner,
});

type Task = { id: string; title: string; duration: number; deadline: string; priority: "High" | "Medium" | "Low" };
const day = (n: number) => new Date(Date.now() + n * 86400_000).toISOString().slice(0, 10);
const SEED: Task[] = [
  { id: "t1", title: "Site inspection — Pretoria house slab", duration: 2, deadline: day(0), priority: "High" },
  { id: "t2", title: "Review school electrical drawings", duration: 3, deadline: day(2), priority: "High" },
  { id: "t3", title: "Call brick supplier re: delivery", duration: 0.5, deadline: day(1), priority: "Medium" },
  { id: "t4", title: "Update client progress report", duration: 1.5, deadline: day(3), priority: "Medium" },
  { id: "t5", title: "File NHBRC enrolment paperwork", duration: 1, deadline: day(4), priority: "Low" },
];

const taskSchema = z.object({
  title: z.string().min(2, "Enter a title"),
  duration: z.coerce.number().min(0.25, "Min 0.25h").max(40),
  deadline: z.string().min(1, "Pick a date"),
  priority: z.enum(["High", "Medium", "Low"]),
});
type TaskForm = z.infer<typeof taskSchema>;

const Result = z.object({
  items: z.array(z.object({ title: z.string(), day: z.string(), start: z.string(), end: z.string(), priority: z.enum(["High", "Medium", "Low"]), quadrant: z.string().optional(), reason: z.string() })),
  warnings: z.array(z.string()),
});
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function Planner() {
  const [tasks, setTasks] = useLocal<Task[]>("apa.tasks", SEED);
  const [mode, setMode] = useState<"Daily" | "Weekly">("Weekly");
  const [start, setStart] = useState("07:30");
  const [end, setEnd] = useState("16:30");
  const ai = useAi("planner", Result);
  const f = useForm<TaskForm>({ resolver: zodResolver(taskSchema) as never, defaultValues: { title: "", duration: 1, deadline: day(1), priority: "Medium" } });
  const e = f.formState.errors;

  const add = (v: TaskForm) => { setTasks((p) => [...p, { id: crypto.randomUUID(), ...v }]); f.reset({ ...v, title: "" }); };
  const generate = async () => {
    const r = await ai.run({ mode, workingHours: { start, end }, today: new Date().toDateString(), tasks: tasks.map(({ id: _id, ...t }) => t) });
    if (r) logActivity(`${mode} plan created (${tasks.length} tasks)`, "Task Planner");
  };
  const asText = ai.data ? ai.data.items.map((i) => `${i.day} ${i.start}-${i.end} [${i.priority}] ${i.title} — ${i.reason}`).join("\n") + (ai.data.warnings.length ? `\n\nWarnings:\n${ai.data.warnings.join("\n")}` : "") : "";

  const Item = ({ i }: { i: z.infer<typeof Result>["items"][number] }) => (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-medium text-muted-foreground">{i.start}–{i.end}</span><Pill label={i.priority} /></div>
      <p className="mt-1 text-sm font-medium text-primary">{i.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{i.quadrant ? `${i.quadrant} · ` : ""}{i.reason}</p>
    </div>
  );

  return (
    <>
      <PageHeader title="Task Planner" description="Prioritise tasks and build a realistic schedule." />
      <ModuleLayout
        input={
          <Panel title="Tasks">
            <form onSubmit={f.handleSubmit(add)} className="space-y-3" noValidate>
              <Field label="Task title" htmlFor="title" error={e.title?.message}><Input id="title" {...f.register("title")} /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Hours" htmlFor="dur" error={e.duration?.message}><Input id="dur" type="number" step="0.25" {...f.register("duration")} /></Field>
                <Field label="Deadline" htmlFor="dl" error={e.deadline?.message}><Input id="dl" type="date" {...f.register("deadline")} /></Field>
                <Field label="Priority" htmlFor="pr"><select id="pr" className={selectCls} {...f.register("priority")}><option>High</option><option>Medium</option><option>Low</option></select></Field>
              </div>
              <Button type="submit" variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" />Add task</Button>
            </form>
            <ul className="mt-5 divide-y rounded-lg border">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0"><p className="truncate text-sm">{t.title}</p><p className="text-xs text-muted-foreground">{t.duration}h · due {t.deadline}</p></div>
                  <div className="flex items-center gap-2"><Pill label={t.priority} /><Button size="icon" variant="ghost" aria-label={`Remove ${t.title}`} onClick={() => setTasks((p) => p.filter((x) => x.id !== t.id))}><Trash2 className="h-4 w-4" /></Button></div>
                </li>
              ))}
              {tasks.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted-foreground">No tasks yet</li>}
            </ul>
            <div className="mt-5 space-y-4">
              <Field label="Mode"><Segmented label="Mode" value={mode} options={["Daily", "Weekly"] as const} onChange={setMode} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start of day" htmlFor="ws"><Input id="ws" type="time" value={start} onChange={(x) => setStart(x.target.value)} /></Field>
                <Field label="End of day" htmlFor="we"><Input id="we" type="time" value={end} onChange={(x) => setEnd(x.target.value)} /></Field>
              </div>
              <Button className="w-full" onClick={generate} disabled={ai.loading || tasks.length === 0}><Sparkles className="mr-2 h-4 w-4" />{ai.loading ? "Planning…" : "Generate schedule"}</Button>
            </div>
          </Panel>
        }
        output={
          <Panel title="Schedule" actions={ai.data && !ai.loading ? <CopyButton text={asText} /> : null}>
            {ai.loading ? <OutputSkeleton /> : ai.error && !ai.data ? <ErrorState message={ai.error} onRetry={ai.retry} /> : ai.data ? (
              <div className="space-y-5">
                {ai.data.warnings.length > 0 && (
                  <div className="rounded-lg bg-amber-soft p-4 text-sm text-amber-foreground">
                    <div className="mb-1 flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" />Warnings</div>
                    <ul className="list-disc pl-5">{ai.data.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
                  </div>
                )}
                {mode === "Weekly" && ai.data.items.some((i) => DAYS.includes(i.day)) ? (
                  <div className="grid gap-3 md:grid-cols-5">
                    {DAYS.map((d) => (
                      <div key={d} className="min-w-0 space-y-2 rounded-lg bg-muted p-2">
                        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d.slice(0, 3)}</p>
                        {ai.data!.items.filter((i) => i.day === d).map((i, k) => <Item key={k} i={i} />)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <ol className="relative space-y-3 border-l-2 border-amber pl-5">
                    {ai.data.items.map((i, k) => <li key={k}><Item i={i} /></li>)}
                  </ol>
                )}
                <AiFootnote />
              </div>
            ) : <EmptyState text="Add tasks, choose a mode and generate your schedule." />}
          </Panel>
        }
      />
    </>
  );
}
