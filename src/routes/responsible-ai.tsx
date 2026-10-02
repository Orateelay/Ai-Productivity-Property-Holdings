import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/shared";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI Use — AI-Productivity-Assistant Property Holdings" },
      { name: "description", content: "How we use AI responsibly: limitations, human review and data privacy." },
      { property: "og:title", content: "Responsible AI Use — AI-Productivity-Assistant Property Holdings" },
      { property: "og:description", content: "AI limitations, human review and data privacy." },
    ],
  }),
  component: Page,
});

const sections: [string, string][] = [
  ["AI limitations", "AI models can produce inaccurate, incomplete or outdated information, including construction prices and regulations. Outputs are drafts and starting points, not facts."],
  ["Human review", "Every estimate, email, schedule and research summary should be reviewed by a responsible person before it is shared or acted on."],
  ["Cost estimates", "Estimates are indicative only and are not a formal quotation. Final pricing requires site assessment, approved drawings and a bill of quantities."],
  ["Data privacy", "There are no user accounts. History, enquiries and tasks are stored only in your browser. Text you submit is sent to an AI service to generate a response — avoid entering sensitive personal information."],
  ["Not professional advice", "This tool does not replace registered architects, engineers, quantity surveyors or legal advisers. Always verify regulatory matters against SANS 10400, NHBRC requirements and municipal by-laws."],
];

function Page() {
  return (
    <>
      <PageHeader title="Responsible AI Use" description="How to use this assistant safely and appropriately." />
      <div className="grid max-w-3xl gap-4">
        {sections.map(([t, d]) => <Panel key={t} title={t}><p className="text-sm leading-relaxed">{d}</p></Panel>)}
      </div>
    </>
  );
}
