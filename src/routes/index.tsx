import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Inbox, ListChecks, Mail, Calculator, CalendarClock, BookOpen, Users, ArrowRight, Clock } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/shared";
import { useLocal, SEED_ACTIVITY, SEED_ENQUIRIES, type Activity, type Enquiry } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI-Productivity-Assistant Property Holdings" },
      { name: "description", content: "Overview of projects, enquiries, tasks and AI activity for a South African builder." },
      { property: "og:title", content: "Dashboard — AI-Productivity-Assistant Property Holdings" },
      { property: "og:description", content: "Overview of projects, enquiries, tasks and AI activity." },
    ],
  }),
  component: Dashboard,
});

const actions = [
  { to: "/estimator", title: "Cost Estimator", desc: "Indicative build cost ranges in ZAR", icon: Calculator },
  { to: "/email", title: "Email Generator", desc: "Draft client & supplier emails", icon: Mail },
  { to: "/planner", title: "Task Planner", desc: "Prioritised daily or weekly schedule", icon: CalendarClock },
  { to: "/research", title: "Research Assistant", desc: "Summaries, insights, recommendations", icon: BookOpen },
  { to: "/architects", title: "Architects", desc: "Browse and select an architect", icon: Users },
] as const;

function Dashboard() {
  const [activity] = useLocal<Activity[]>("apa.activity", SEED_ACTIVITY);
  const [enquiries] = useLocal<Enquiry[]>("apa.enquiries", SEED_ENQUIRIES);
  const kpis = [
    { label: "Active Projects", value: 12, note: "8 houses · 4 schools", icon: Briefcase },
    { label: "New Enquiries", value: enquiries.filter((e) => e.status === "New").length + 4, note: "This week", icon: Inbox },
    { label: "Tasks Due Today", value: 7, note: "2 high priority", icon: ListChecks },
    { label: "Emails Drafted", value: 23, note: "Last 30 days", icon: Mail },
  ];
  return (
    <>
      <PageHeader title="Welcome back" description="Here's what's happening across your builds today." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{k.label}</span>
              <k.icon className="h-4 w-4 text-amber" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-primary">{k.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{k.note}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="group rounded-xl border bg-card p-5 shadow-soft transition hover:border-amber">
            <div className="mb-3 inline-flex rounded-lg bg-amber-soft p-2"><a.icon className="h-5 w-5 text-amber-foreground" /></div>
            <div className="flex items-center justify-between font-medium text-primary">{a.title}<ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" /></div>
            <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
          </Link>
        ))}
      </div>

      <Panel title="Recent activity" className="mt-8">
        <ul className="divide-y">
          {activity.slice(0, 8).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="text-sm text-foreground">{a.text}</p>
                <p className="text-xs text-muted-foreground">{a.module}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{new Date(a.at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
