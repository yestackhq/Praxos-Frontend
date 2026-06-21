import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { X, Users, UserRound, FileText, Loader2 } from "lucide-react";
import { Avatar, Badge, ProgressBar, ScoreRing } from "@/ui/data";
import { apiGet } from "@/lib/apiClient";
import { clerkEnabled } from "@/app/auth/clerkEnabled";
import type { Person } from "@/lib/data";

type Detail = {
  sessions: { doc: string; date: string; score: number; duration: string }[];
  path: { title: string; status: string; progress: number | null }[];
};

/** The fetched part (sessions + path). Only mounted when Clerk is configured, so
 * `useAuth` is never called without a provider (keeps the demo build alive). */
function PersonExtra({ personId }: { personId: number }) {
  const { getToken } = useAuth();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const token = await getToken();
        const d = await apiGet<Detail>(
          `/api/people/${personId}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        );
        if (!cancelled) setDetail(d);
      } catch {
        /* leave empty */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [personId, getToken]);

  return (
    <>
      <p className="eyebrow mt-7">Recent sessions</p>
      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-caption text-faint">
          <Loader2 className="size-3.5 animate-spin" /> Loading…
        </p>
      ) : !detail || detail.sessions.length === 0 ? (
        <p className="mt-3 text-body-s text-faint">No sessions yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-hairline">
          {detail.sessions.map((s, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <FileText className="size-4 shrink-0 text-faint" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-label text-ink">{s.doc}</p>
                <p className="text-caption text-faint">
                  {s.date} · {s.duration}
                </p>
              </div>
              <span className="nums text-label text-soft">{s.score}</span>
            </li>
          ))}
        </ul>
      )}

      {detail && detail.path.length > 0 && (
        <>
          <p className="eyebrow mt-7">Learning path</p>
          <ul className="mt-3 space-y-3">
            {detail.path.map((p, i) => (
              <li key={i}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-label text-ink">{p.title}</span>
                  <span className="text-caption capitalize text-faint">{p.status.replace("_", " ")}</span>
                </div>
                <ProgressBar value={p.progress ?? 0} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

/** Right-side detail drawer for one learner — opened by clicking a row in the
 * Understanding table. */
export function PersonDrawer({ person, onClose }: { person: Person | null; onClose: () => void }) {
  useEffect(() => {
    if (!person) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [person, onClose]);

  if (!person) return null;
  const cohort = person.cohort && !["—", "-", ""].includes(person.cohort) ? person.cohort : "";
  const team = person.team || "";

  return (
    <>
      <button aria-label="Close" onClick={onClose} className="fixed inset-0 z-40 bg-black/30" />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-96 max-w-full flex-col border-l border-hairline bg-bg shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <span className="text-caption text-faint">Learner</span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-md text-soft transition-colors hover:bg-[#3c315b]/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-4">
            <Avatar name={person.name} size={52} />
            <div className="min-w-0">
              <p className="truncate text-title text-ink">{person.name}</p>
              <p className="truncate text-caption text-faint">{person.email}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="muted">{person.role}</Badge>
            {cohort && (
              <Badge tone="outline">
                <Users className="size-3.5" /> {cohort}
              </Badge>
            )}
            {team && (
              <Badge tone="outline">
                <UserRound className="size-3.5" /> {team}
              </Badge>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-xl border border-hairline p-4">
            <ScoreRing value={person.understanding} size={64} />
            <div>
              <p className="text-label text-ink">Understanding</p>
              <p className="text-caption text-faint">
                {person.understanding > 0 ? "demonstrated across sessions" : "not measured yet"}
              </p>
            </div>
          </div>

          {clerkEnabled && person.id != null ? (
            <PersonExtra personId={person.id} />
          ) : (
            <p className="mt-7 text-body-s text-faint">Sign in to view this learner's sessions.</p>
          )}
        </div>
      </aside>
    </>
  );
}
