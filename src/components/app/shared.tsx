import type { ReactNode } from "react";
import { AlertCircle, Copy, RotateCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function Panel({ title, children, actions, className }: { title: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 rounded-xl border bg-card p-5 shadow-soft sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function ModuleLayout({ input, output }: { input: ReactNode; output: ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">{input}{output}</div>;
}

export function AiFootnote() {
  return (
    <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
      AI-generated content may contain errors or outdated information. Review and verify before use. Cost
      estimates are indicative only and not a binding quotation or professional advice.
    </p>
  );
}

export function OutputSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Generating">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-destructive-soft p-8 text-center">
      <AlertCircle className="h-6 w-6 text-destructive" />
      <p className="text-sm text-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}><RotateCw className="mr-2 h-4 w-4" />Retry</Button>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <div className="rounded-full bg-amber-soft p-3"><Sparkles className="h-5 w-5 text-amber-foreground" /></div>
      <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied to clipboard"); }}>
      <Copy className="mr-2 h-4 w-4" />Copy
    </Button>
  );
}

const PRI: Record<string, string> = {
  High: "bg-destructive-soft text-destructive",
  Medium: "bg-amber-soft text-amber-foreground",
  Low: "bg-success-soft text-success",
  New: "bg-amber-soft text-amber-foreground",
  Quoted: "bg-secondary text-primary",
  Won: "bg-success-soft text-success",
  Lost: "bg-destructive-soft text-destructive",
  Available: "bg-success-soft text-success",
  Limited: "bg-amber-soft text-amber-foreground",
  Booked: "bg-destructive-soft text-destructive",
};
export function Pill({ label }: { label: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", PRI[label] ?? "bg-secondary text-primary")}>{label}</span>;
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)}
          className={cn("flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === o ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground")}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, htmlFor, error, children }: { label: string; htmlFor?: string | undefined; error?: string | undefined; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export const selectCls = "flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
