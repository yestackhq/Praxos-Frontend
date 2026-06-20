import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Users, Loader2, FileText } from "lucide-react";
import { Modal, ModalClose, ModalFooter } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Avatar } from "@/ui/data";
import { cn } from "@/lib/utils";
import { useData, useDataActions } from "@/lib/data";

const field =
  "h-10 w-full rounded-md border border-border bg-[#3c315b]/[0.02] px-3 text-label text-ink outline-none focus:border-soft";

function docTitle(name: string): string {
  return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || name;
}

/** Create a cohort — a group of learners taking the same documents as a course.
 * On create, Praxos drafts an AI teaching plan per document; the admin reviews it
 * on the Cohorts page, then publishes to push the plan into each member's memory. */
export default function NewCohort() {
  const navigate = useNavigate();
  const { admin } = useData();
  const { createCohort } = useDataActions();
  const close = () => navigate("/admin/cohorts");

  const [name, setName] = useState("");
  const [docs, setDocs] = useState<number[]>([]);
  const [members, setMembers] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const learners = admin.people.filter((p) => p.role !== "Admin" && typeof p.id === "number");
  const documents = admin.documents.filter((d) => typeof (d as { id?: number }).id === "number");

  const toggleDoc = (id: number) =>
    setDocs((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const toggleMember = (id: number) =>
    setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createCohort(name.trim(), docs, members);
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the cohort.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={close} className="max-w-lg" labelledBy="cohort-title">
      <div className="flex items-start justify-between border-b border-hairline px-6 py-4">
        <div>
          <h2 id="cohort-title" className="text-title text-ink">Create a cohort</h2>
          <p className="text-caption text-faint">
            Pick the documents (the course) and the learners. Praxos drafts a teaching plan you can review.
          </p>
        </div>
        <ModalClose onClose={close} />
      </div>

      <div className="space-y-5 p-6">
        <label className="block">
          <span className="mb-1.5 block text-caption text-faint">Cohort name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. March new hires"
            className={field}
          />
        </label>

        <div>
          <span className="mb-2 block text-caption text-faint">
            Documents {docs.length > 0 && <span className="text-soft">· {docs.length} selected</span>}
          </span>
          {documents.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-3 text-caption text-faint">
              Upload a document first, then build a cohort around it.
            </p>
          ) : (
            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {documents.map((d) => {
                const id = (d as { id: number }).id;
                const on = docs.includes(id);
                return (
                  <li key={id}>
                    <button
                      onClick={() => toggleDoc(id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        on ? "bg-[#3c315b]/8" : "hover:bg-[#3c315b]/5",
                      )}
                    >
                      <span className={cn("grid size-5 place-items-center rounded-md border", on ? "border-transparent bg-ink text-bg" : "border-border")}>
                        {on && <Check className="size-3.5" />}
                      </span>
                      <span className="grid size-7 shrink-0 place-items-center rounded-md border border-hairline text-faint">
                        <FileText className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-label text-ink">{docTitle(d.name)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <span className="mb-2 block text-caption text-faint">
            Members {members.length > 0 && <span className="text-soft">· {members.length} selected</span>}
          </span>
          {learners.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-3 text-caption text-faint">
              Invite learners first, then group them into a cohort.
            </p>
          ) : (
            <ul className="max-h-44 space-y-1 overflow-y-auto">
              {learners.map((p) => {
                const id = p.id as number;
                const on = members.includes(id);
                return (
                  <li key={id}>
                    <button
                      onClick={() => toggleMember(id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        on ? "bg-[#3c315b]/8" : "hover:bg-[#3c315b]/5",
                      )}
                    >
                      <span className={cn("grid size-5 place-items-center rounded-md border", on ? "border-transparent bg-ink text-bg" : "border-border")}>
                        {on && <Check className="size-3.5" />}
                      </span>
                      <Avatar name={p.name} size={28} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-label text-ink">{p.name}</span>
                        <span className="block truncate text-caption text-faint">{p.email}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && (
          <p className="rounded-md border border-border bg-[#3c315b]/[0.02] px-3 py-2 text-caption text-soft">{error}</p>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={close}>Cancel</Button>
        <Button onClick={submit} disabled={!name.trim() || busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Users className="size-4" />} Create cohort
        </Button>
      </ModalFooter>
    </Modal>
  );
}
