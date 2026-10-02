import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader, Pill, selectCls } from "@/components/app/shared";
import { ARCHITECTS, SPECIALITIES } from "@/lib/architects";

export const Route = createFileRoute("/architects")({
  head: () => ({
    meta: [
      { title: "Architects — AI-Productivity-Assistant Property Holdings" },
      { name: "description", content: "Browse partner architects for houses and schools and select one for your enquiry." },
      { property: "og:title", content: "Architects — AI-Productivity-Assistant Property Holdings" },
      { property: "og:description", content: "Choose a partner architect for your build." },
    ],
  }),
  component: Architects,
});

function Architects() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("");
  const list = ARCHITECTS.filter((a) => (!spec || a.speciality === spec) && `${a.name} ${a.firm}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Architects" description="Partner architects for residential and educational projects." />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search architects" placeholder="Search by name or firm" className="bg-card pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select aria-label="Filter by speciality" className={`${selectCls} sm:w-56`} value={spec} onChange={(e) => setSpec(e.target.value)}>
          <option value="">All specialities</option>
          {SPECIALITIES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => (
          <article key={a.id} className="flex flex-col rounded-xl border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{a.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
                <div><h2 className="font-semibold text-primary">{a.name}</h2><p className="text-sm text-muted-foreground">{a.firm}</p></div>
              </div>
              <Pill label={a.availability} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Speciality</dt><dd>{a.speciality}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Experience</dt><dd>{a.years} years</dd></div>
              <div><dt className="text-xs text-muted-foreground">Rating</dt><dd className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber text-amber" />{a.rating}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Fees</dt><dd>{a.fee}</dd></div>
            </dl>
            <Button asChild className="mt-5 w-full"><Link to="/estimator" search={{ architect: a.id }}>Select for enquiry</Link></Button>
          </article>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No architects match your search.</p>}
      </div>
    </>
  );
}
