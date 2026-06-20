import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Users, FileText, Loader2, Check, RefreshCw, Rocket, Clock } from "lucide-react";
import { Card } from "@/ui/Card";
import { Badge, Avatar } from "@/ui/data";
import { Button } from "@/ui/Button";
import { apiGet } from "@/lib/apiClient";
import { useData, useDataActions, type Team } from "@/lib/data";
import { cn } from "@/lib/utils";

function docTitle(name: string): string {
  return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || name;
}

const field =
  "h-9 rounded-md border border-border bg-[#3c315b]/[0.02] px-3 text-label text-ink outline-none focus:border-soft";

type PlanModule = { id: number; idx: number; title: string; description: string; topics: string[]; minutes: number };
type Plan = { document: { id: number; name: string }; modules: PlanModule[] };

function PickRow({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors", on ? "bg-[#3c315b]/8" : "hover:bg-[#3c315b]/5")}
    >
      <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", on ? "border-transparent bg-ink text-bg" : "border-border")}>
        {on && <Check className="size-3.5" />}
      </span>
      {children}
    </button>
  );
}

function PlanCard({ doc, token }: { doc: { id: number; name: string }; token: string | null }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regen, setRegen] = useState(false);
  const authInit = useCallback(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : undefined), [token]);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      setPlan(await apiGet<Plan>(`/api/documents/${doc.id}/plan`, authInit()));
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, [doc.id, authInit]);

  useEffect(() => {
    void fetchPlan();
  }, [fetchPlan]);

  const regenerate = async () => {
    setRegen(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/documents/${doc.id}/plan/generate`, {
        method: "POST",
        headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) setPlan(await res.json());
    } finally {
      setRegen(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-title text-ink"><FileText className="size-4 text-faint" /> {docTitle(doc.name)}</h4>
        <Button variant="ghost" size="sm" onClick={regenerate} disabled={regen || loading}>
          {regen ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Regenerate
        </Button>
      </div>
      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-caption text-faint"><Loader2 className="size-3.5 animate-spin" /> Loading plan…</p>
      ) : !plan || plan.modules.length === 0 ? (
        <p className="mt-4 text-caption text-faint">No plan yet — regenerate to draft one (needs an indexed document).</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {plan.modules.map((m) => (
            <li key={m.id} className="flex gap-3">
              <span className="nums mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-hairline text-caption text-soft">{m.idx + 1}</span>
              <div className="min-w-0">
                <p className="text-label text-ink">{m.title}</p>
                {m.description && <p className="mt-0.5 text-caption text-soft">{m.description}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {m.topics.map((t) => (
                    <span key={t} className="rounded border border-hairline px-1.5 py-0.5 text-[11px] text-faint">{t}</span>
                  ))}
                  <span className="inline-flex items-center gap-1 text-[11px] text-faint"><Clock className="size-3" /> {m.minutes} min</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function TeamDetail() {
  const { id } = useParams();
  const { admin } = useData();
  const { editTeam, publishTeam } = useDataActions();
  const { getToken } = useAuth();
  const team: Team | undefined = admin.teams.find((t) => String(t.id) === id);

  const [name, setName] = useState(team?.name ?? "");
  const [lead, setLead] = useState(team?.lead ?? "");
  const [docs, setDocs] = useState<number[]>(team?.documentIds ?? []);
  const [members, setMembers] = useState<number[]>(team?.memberIds ?? []);
  const [token, setToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getToken().then(setToken);
  }, [getToken]);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setLead(team.lead);
      setDocs(team.documentIds ?? []);
      setMembers(team.memberIds ?? []);
    }
  }, [team?.id, team?.published]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!team || team.id == null) {
    return (
      <div className="animate-fade-up">
        <Link to="/admin/teams" className="inline-flex items-center gap-1.5 text-label text-soft hover:text-ink">
          <ArrowLeft className="size-4" /> Teams
        </Link>
        <p className="mt-6 text-body-s text-faint">Team not found.</p>
      </div>
    );
  }

  const learners = admin.people.filter((p) => p.role !== "Admin" && typeof p.id === "number");
  const documents = admin.documents.filter((d) => typeof (d as { id?: number }).id === "number");
  const selectedDocs = (team.documents ?? []).filter((d) => docs.includes(d.id));
  const dirty =
    name.trim() !== team.name ||
    lead.trim() !== team.lead ||
    JSON.stringify([...docs].sort()) !== JSON.stringify([...(team.documentIds ?? [])].sort()) ||
    JSON.stringify([...members].sort()) !== JSON.stringify([...(team.memberIds ?? [])].sort());

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await editTeam(team.id!, { name: name.trim(), lead: lead.trim(), documentIds: docs, memberUserIds: members });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (dirty) await save();
    setPublishing(true);
    setError(null);
    try {
      await publishTeam(team.id!);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-6 pb-24">
      <div>
        <Link to="/admin/teams" className="inline-flex items-center gap-1.5 text-label text-soft hover:text-ink">
          <ArrowLeft className="size-4" /> Teams
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-0 flex-1 border-b border-transparent bg-transparent text-h2 text-ink outline-none focus:border-hairline"
          />
          {team.published ? <Badge tone="outline"><Check className="size-3.5" /> Published</Badge> : <Badge tone="muted">Draft</Badge>}
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-caption text-faint">
          Lead
          <input value={lead} onChange={(e) => setLead(e.target.value)} placeholder="optional" className={field} />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-2 flex items-center gap-2 text-label text-ink"><Users className="size-4 text-faint" /> Members</p>
          {learners.length === 0 ? (
            <p className="text-caption text-faint">Invite learners first.</p>
          ) : (
            <ul className="max-h-60 space-y-1 overflow-y-auto">
              {learners.map((p) => {
                const uid = p.id as number;
                return (
                  <li key={uid}>
                    <PickRow on={members.includes(uid)} onClick={() => setMembers((m) => (m.includes(uid) ? m.filter((x) => x !== uid) : [...m, uid]))}>
                      <Avatar name={p.name} size={28} />
                      <span className="min-w-0 flex-1 truncate text-label text-ink">{p.name}</span>
                    </PickRow>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <p className="mb-2 flex items-center gap-2 text-label text-ink"><FileText className="size-4 text-faint" /> Documents</p>
          {documents.length === 0 ? (
            <p className="text-caption text-faint">Upload a document first.</p>
          ) : (
            <ul className="max-h-60 space-y-1 overflow-y-auto">
              {documents.map((d) => {
                const did = (d as { id: number }).id;
                return (
                  <li key={did}>
                    <PickRow on={docs.includes(did)} onClick={() => setDocs((x) => (x.includes(did) ? x.filter((y) => y !== did) : [...x, did]))}>
                      <span className="min-w-0 flex-1 truncate text-label text-ink">{docTitle(d.name)}</span>
                    </PickRow>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {dirty && (
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Save changes
          </Button>
          <span className="text-caption text-faint">Save to refresh the teaching plans below.</span>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-title text-ink">Teaching plan</h3>
        {selectedDocs.length === 0 ? (
          <p className="rounded-xl border border-hairline px-6 py-8 text-center text-body-s text-faint">Add a document to draft a teaching plan.</p>
        ) : (
          <div className="space-y-4">
            {selectedDocs.map((d) => (
              <PlanCard key={d.id} doc={d} token={token} />
            ))}
          </div>
        )}
      </div>

      {error && <p className="rounded-md border border-border bg-[#3c315b]/[0.02] px-3 py-2 text-caption text-soft">{error}</p>}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-bg/95 px-4 py-3 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-content items-center justify-between gap-3">
          <span className="text-caption text-faint">
            {members.length} learner{members.length === 1 ? "" : "s"} · {docs.length} document{docs.length === 1 ? "" : "s"}
          </span>
          <Button onClick={publish} disabled={publishing || members.length === 0 || docs.length === 0}>
            {publishing ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
            {team.published ? "Re-publish to members" : "Publish to members"}
          </Button>
        </div>
      </div>
    </div>
  );
}
