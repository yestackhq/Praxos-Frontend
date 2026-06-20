import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Users, FileText, Loader2, Trash2, ChevronRight, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/ui/page";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/data";
import { EmptyState } from "@/ui/EmptyState";
import { buttonVariants } from "@/ui/Button";
import { useData, useDataActions, type Cohort } from "@/lib/data";

function docTitle(name: string): string {
  return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || name;
}

function CohortCard({ c }: { c: Cohort }) {
  const navigate = useNavigate();
  const { deleteCohort } = useDataActions();
  const [busy, setBusy] = useState(false);
  const open = () => c.id != null && navigate(`/admin/cohorts/${c.id}`);

  const onDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (c.id == null || !window.confirm(`Delete cohort "${c.name}"? This won't remove the learners or documents.`)) return;
    setBusy(true);
    try {
      await deleteCohort(c.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      onClick={open}
      className="group cursor-pointer p-5 transition-colors hover:border-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-title text-ink">{c.name}</h3>
            {c.published ? (
              <Badge tone="outline">
                <CheckCircle2 className="size-3.5" /> Published
              </Badge>
            ) : (
              <Badge tone="muted">Draft</Badge>
            )}
          </div>
          <p className="mt-1 flex items-center gap-3 text-caption text-faint">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" /> {c.members} {c.members === 1 ? "learner" : "learners"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-3.5" /> {(c.documents?.length ?? 0)}{" "}
              {(c.documents?.length ?? 0) === 1 ? "document" : "documents"}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onDelete}
            disabled={busy}
            title="Delete cohort"
            aria-label={`Delete ${c.name}`}
            className="grid size-8 place-items-center rounded-md text-faint transition-colors hover:bg-[#3c315b]/5 hover:text-ink disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </button>
          <ChevronRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {c.documents && c.documents.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {c.documents.map((d) => (
            <span key={d.id} className="rounded-md border border-hairline px-2 py-1 text-caption text-soft">
              {docTitle(d.name)}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function Cohorts() {
  const { admin } = useData();
  const cohorts = admin.cohorts;

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        title="Cohorts"
        subtitle="Group learners around a set of documents. Praxos drafts a teaching plan you review, then publishes it into each learner's memory."
        action={
          <Link to="/admin/cohorts/new" className={buttonVariants({ variant: "secondary" })}>
            <Plus className="size-4" /> New cohort
          </Link>
        }
      />

      {cohorts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No cohorts yet"
          body="Create a cohort, pick its documents and learners, and Praxos drafts a section-by-section teaching plan you can review and publish."
          action={
            <Link to="/admin/cohorts/new" className={buttonVariants({ variant: "secondary" })}>
              <Plus className="size-4" /> New cohort
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cohorts.map((c) => (
            <CohortCard key={c.id ?? c.name} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
