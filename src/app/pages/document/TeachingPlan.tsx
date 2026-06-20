import { Link } from "react-router-dom";
import { Pencil, ArrowRight, Clock, Mic } from "lucide-react";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/data";
import { buttonVariants } from "@/ui/Button";
import { teachingPlan as p } from "@/lib/mock";

export default function TeachingPlan() {
  return (
    <div className="animate-fade-up space-y-7">
      <nav className="flex items-center gap-2 text-caption text-faint">
        <Link to="/admin/documents" className="hover:text-soft">
          Documents
        </Link>
        <span>/</span>
        <span className="text-soft">{p.doc}</span>
      </nav>

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Teaching plan</h1>
          <p className="mt-1.5 max-w-xl text-body text-soft">{p.blurb}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/admin/documents/plan/edit" className={buttonVariants({ variant: "secondary" })}>
            <Pencil className="size-4" /> Edit plan
          </Link>
          <Link to="/admin/documents/plan/assign" className={buttonVariants()}>
            Assign <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-5">
        {p.kpis.map((k) => (
          <div key={k.label} className="bg-surface px-5 py-5">
            <p className="text-caption text-faint">{k.label}</p>
            <p className="nums mt-2 text-[30px] font-semibold leading-none tracking-tight text-ink">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="eyebrow">The plan</p>
        <p className="text-caption text-faint">Taught in order, one module at a time</p>
      </div>

      <ol className="space-y-3">
        {p.modules.map((m, i) => (
          <li key={m.title}>
            <Card className="p-6">
              <div className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-hairline text-label font-medium text-soft">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-caption text-faint">Module {i + 1}</p>
                      <h3 className="mt-0.5 text-title text-ink">{m.title}</h3>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-caption text-faint">
                      <Clock className="size-3.5" /> {m.minutes} min
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-body-s text-soft">{m.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.topics.map((t) => (
                      <Badge key={t} tone="muted">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 border-t border-hairline pt-3 text-caption text-faint">
                    <Mic className="size-3.5" /> {m.source}
                  </p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
