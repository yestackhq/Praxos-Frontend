import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Users } from "lucide-react";
import { Modal, ModalClose, ModalFooter } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Avatar } from "@/ui/data";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data";

const field =
  "h-10 w-full rounded-md border border-border bg-[#3c315b]/[0.02] px-3 text-label text-ink outline-none focus:border-soft";

/** Create a cohort — a group of learners tracked together (onboarding wave, a team,
 * a compliance round). Members get the same path and roll up as one on the dashboard. */
export default function NewCohort() {
  const navigate = useNavigate();
  const { admin } = useData();
  const close = () => navigate("/admin/cohorts");
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const learners = admin.people.filter((p) => p.role !== "Admin");

  const toggle = (email: string) =>
    setPicked((p) => (p.includes(email) ? p.filter((x) => x !== email) : [...p, email]));

  return (
    <Modal onClose={close} className="max-w-lg" labelledBy="cohort-title">
      <div className="flex items-start justify-between border-b border-hairline px-6 py-4">
        <div>
          <h2 id="cohort-title" className="text-title text-ink">Create a cohort</h2>
          <p className="text-caption text-faint">Group learners to compare progress and assign paths together.</p>
        </div>
        <ModalClose onClose={close} />
      </div>

      <div className="space-y-5 p-6">
        <label className="block">
          <span className="mb-1.5 block text-caption text-faint">Cohort name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. March new hires" className={field} />
        </label>

        <div>
          <span className="mb-2 block text-caption text-faint">
            Members {picked.length > 0 && <span className="text-soft">· {picked.length} selected</span>}
          </span>
          {learners.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-3 text-caption text-faint">
              Invite learners first, then group them into a cohort.
            </p>
          ) : (
            <ul className="max-h-56 space-y-1 overflow-y-auto">
              {learners.map((p) => {
                const on = picked.includes(p.email);
                return (
                  <li key={p.email}>
                    <button
                      onClick={() => toggle(p.email)}
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
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={close}>Cancel</Button>
        <Button onClick={close} disabled={!name.trim()}>
          <Users className="size-4" /> Create cohort
        </Button>
      </ModalFooter>
    </Modal>
  );
}
