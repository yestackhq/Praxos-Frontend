import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Modal, ModalClose, ModalFooter } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Dropdown } from "@/ui/Dropdown";
import { useData, useDataActions } from "@/lib/data";
import { inviteDefaults } from "@/lib/mock";

const ROLE_OPTIONS = [
  { value: "Learner", label: "Learner", hint: "Takes courses" },
  { value: "Manager", label: "Manager", hint: "Sees their team" },
  { value: "Admin", label: "Admin", hint: "Full workspace access" },
];

export default function InvitePeople({ back = "/admin/people" }: { back?: string }) {
  const navigate = useNavigate();
  const { mode } = useData();
  const { invite } = useDataActions();
  const isDemo = mode === "demo";
  const close = () => navigate(back);

  const [emails, setEmails] = useState<string[]>(isDemo ? inviteDefaults : []);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState("Learner");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commit = (value?: string) => {
    const v = (value ?? draft).trim().replace(/,$/, "");
    if (v && !emails.includes(v)) setEmails((e) => [...e, v]);
    setDraft("");
  };

  const send = async () => {
    const all = [...emails];
    if (draft.trim()) all.push(draft.trim());
    const unique = [...new Set(all.map((e) => e.trim()).filter(Boolean))];
    if (unique.length === 0) return close();
    if (isDemo) return close(); // read-only preview

    setBusy(true);
    setError(null);
    try {
      for (const email of unique) await invite(email, role);
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send invites");
      setBusy(false);
    }
  };

  const count = emails.length + (draft.trim() ? 1 : 0);

  return (
    <Modal onClose={close} className="max-w-lg" labelledBy="invite-title">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <h2 id="invite-title" className="text-title text-ink">
          Invite people
        </h2>
        <ModalClose onClose={close} />
      </div>

      <div className="space-y-5 p-6">
        <label className="block">
          <span className="mb-1.5 block text-caption text-faint">Email addresses</span>
          <div className="flex flex-wrap gap-2 rounded-md border border-border bg-[#3c315b]/[0.02] p-2 focus-within:border-soft">
            {emails.map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[#3c315b]/5 px-2 py-1 text-caption text-soft">
                {e}
                <button onClick={() => setEmails(emails.filter((x) => x !== e))} className="text-faint hover:text-ink">
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === ",") && (e.preventDefault(), commit())}
              onBlur={() => commit()}
              placeholder="name@company.com"
              className="min-w-[160px] flex-1 bg-transparent px-1 text-label text-ink outline-none placeholder:text-faint"
            />
          </div>
        </label>

        <div className="block">
          <span className="mb-1.5 block text-caption text-faint">Role</span>
          <Dropdown value={role} onChange={setRole} options={ROLE_OPTIONS} />
          <span className="mt-1.5 block text-caption text-faint">
            Admins can manage documents, people and settings. They join with this role when they sign up.
          </span>
        </div>

        {error && <p className="text-caption text-red-400">{error}</p>}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={close} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={send} disabled={busy || count === 0}>
          {busy ? "Sending…" : `Send ${count || ""} invite${count === 1 ? "" : "s"}`.trim()}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
