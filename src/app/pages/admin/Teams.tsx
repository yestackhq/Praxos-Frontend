import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Users, FileText, Loader2, Trash2, ChevronRight, CheckCircle2, UserRound } from "lucide-react";
import { PageHeader } from "@/ui/page";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/data";
import { EmptyState } from "@/ui/EmptyState";
import { buttonVariants } from "@/ui/Button";
import { useData, useDataActions, type Team } from "@/lib/data";

function docTitle(name: string): string {
  return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || name;
}

function TeamCard({ t }: { t: Team }) {
  const navigate = useNavigate();
  const { deleteTeam } = useDataActions();
  const [busy, setBusy] = useState(false);
  const open = () => t.id != null && navigate(`/admin/teams/${t.id}`);

  const onDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (t.id == null || !window.confirm(`Delete team "${t.name}"? This won't remove the learners or documents.`)) return;
    setBusy(true);
    try {
      await deleteTeam(t.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card onClick={open} className="group cursor-pointer p-5 transition-colors hover:border-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-title text-ink">{t.name}</h3>
            {t.published ? (
              <Badge tone="outline"><CheckCircle2 className="size-3.5" /> Published</Badge>
            ) : (
              <Badge tone="muted">Draft</Badge>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-caption text-faint">
            {t.lead && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" /> Lead: {t.lead}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" /> {t.members} {t.members === 1 ? "learner" : "learners"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-3.5" /> {(t.documents?.length ?? 0)}{" "}
              {(t.documents?.length ?? 0) === 1 ? "document" : "documents"}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onDelete}
            disabled={busy}
            title="Delete team"
            aria-label={`Delete ${t.name}`}
            className="grid size-8 place-items-center rounded-md text-faint transition-colors hover:bg-[#3c315b]/5 hover:text-ink disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </button>
          <ChevronRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
      {t.documents && t.documents.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {t.documents.map((d) => (
            <span key={d.id} className="rounded-md border border-hairline px-2 py-1 text-caption text-soft">
              {docTitle(d.name)}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function Teams() {
  const { admin } = useData();
  const teams = admin.teams;

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        title="Teams"
        subtitle="Group people under a lead, assign documents, and publish the teaching plan into each member's memory."
        action={
          <Link to="/admin/teams/new" className={buttonVariants({ variant: "secondary" })}>
            <Plus className="size-4" /> New team
          </Link>
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          body="Create a team, give it a lead, pick its documents and members, and publish a section-by-section teaching plan to everyone at once."
          action={
            <Link to="/admin/teams/new" className={buttonVariants({ variant: "secondary" })}>
              <Plus className="size-4" /> New team
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((t) => (
            <TeamCard key={t.id ?? t.name} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
