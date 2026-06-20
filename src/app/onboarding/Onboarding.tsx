import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, UploadCloud, X, FileCheck2, Loader2 } from "lucide-react";
import { Logo } from "@/ui/Logo";
import { Button } from "@/ui/Button";
import { Dropdown } from "@/ui/Dropdown";
import { cn } from "@/lib/utils";
import { useData, useDataActions } from "@/lib/data";

const ROLE_OPTIONS = [
  { value: "Learner", label: "Learner", hint: "Takes courses" },
  { value: "Manager", label: "Manager", hint: "Sees their team" },
  { value: "Admin", label: "Admin", hint: "Full workspace access" },
];

const input =
  "h-11 w-full rounded-md border border-border bg-[#3c315b]/[0.02] px-3.5 text-label text-ink outline-none transition-colors focus:border-soft placeholder:text-faint";

function Dots({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3].map((i) => (
        <span key={i} className={cn("size-1.5 rounded-full", i === step ? "bg-ink" : "bg-hairline")} />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption text-faint">{label}</span>
      {children}
    </label>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { workspace, learner } = useData();
  const { invite, completeOnboarding } = useDataActions();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(
    workspace.name && !workspace.name.endsWith("'s workspace") ? workspace.name : `${learner.firstName}'s team`,
  );

  // invites
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState("Admin");
  const commit = () => {
    const v = draft.trim().replace(/,$/, "");
    if (v && !emails.includes(v)) setEmails((e) => [...e, v]);
    setDraft("");
  };
  const [invited, setInvited] = useState(0);

  const sendInvites = async () => {
    const all = [...emails];
    if (draft.trim()) all.push(draft.trim());
    const unique = [...new Set(all.map((e) => e.trim()).filter(Boolean))];
    setBusy(true);
    try {
      for (const email of unique) await invite(email, role);
      setInvited(unique.length);
      setStep(3);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      await completeOnboarding(name.trim() || undefined);
      navigate("/admin");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-bg px-6 text-ink">
      <div className="absolute left-8 top-7">
        <Logo />
      </div>

      <div className="w-full max-w-[468px] animate-fade-up rounded-2xl border border-hairline bg-surface p-9 shadow-2xl shadow-black/50">
        {/* Step 1 - workspace */}
        {step === 1 && (
          <div className="space-y-4">
            <Dots step={1} />
            <p className="eyebrow">Step 1 of 3</p>
            <h1 className="text-h2 text-ink">Create your workspace</h1>
            <p className="text-body-s text-soft">
              Name your workspace. It is where your team's documents, people and progress live.
            </p>
            <Field label="Workspace name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." className={input} />
            </Field>
            <Button className="mt-2 w-full" disabled={!name.trim()} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2 - invite team / create admins */}
        {step === 2 && (
          <div className="space-y-4">
            <Dots step={2} />
            <p className="eyebrow">Step 2 of 3</p>
            <h1 className="text-h2 text-ink">Invite your team</h1>
            <p className="text-body-s text-soft">
              Add teammates by email and pick a role. Admins can manage documents, people and settings, so invite a
              co-admin here.
            </p>
            <Field label="Email addresses">
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
                  onBlur={commit}
                  placeholder="name@company.com"
                  className="min-w-[150px] flex-1 bg-transparent px-1 text-label text-ink outline-none placeholder:text-faint"
                />
              </div>
            </Field>
            <Field label="Role">
              <Dropdown value={role} onChange={setRole} options={ROLE_OPTIONS} />
            </Field>
            <p className="text-caption text-faint">They join with this role the moment they sign up.</p>
            <div className="mt-2 flex gap-2.5">
              <Button variant="secondary" disabled={busy} onClick={() => setStep(3)}>
                Skip for now
              </Button>
              <Button className="flex-1" disabled={busy} onClick={sendInvites}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : `Send ${emails.length + (draft.trim() ? 1 : 0) || ""} invites`.trim()}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 - first document */}
        {step === 3 && (
          <div className="space-y-4">
            <Dots step={3} />
            <p className="eyebrow">Step 3 of 3</p>
            <h1 className="text-h2 text-ink">Add your first document</h1>
            <p className="text-body-s text-soft">
              Upload a policy or guide. Praxos reads it and turns it into a guided, spoken course in minutes.
            </p>
            <button className="group flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border py-9 text-center transition-colors hover:border-soft hover:bg-[#3c315b]/[0.02]">
              <UploadCloud className="size-6 text-faint group-hover:text-soft" />
              <span className="text-title text-ink">Drag a PDF here, or click to browse</span>
              <span className="text-caption text-faint">PDF up to 50MB</span>
            </button>
            <div className="mt-2 flex gap-2.5">
              <Button variant="secondary" disabled={busy} onClick={() => setStep(4)}>
                Skip for now
              </Button>
              <Button className="flex-1" disabled={busy} onClick={() => setStep(4)}>
                Finish setup
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 - all set */}
        {step === 4 && (
          <div className="flex flex-col items-center space-y-4 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-ink text-bg">
              <Check className="size-7" />
            </span>
            <h1 className="text-h2 text-ink">Your workspace is ready</h1>
            <p className="text-body-s text-soft">{name} is all set up. Here is what we put in place.</p>
            <ul className="w-full divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-[#3c315b]/[0.02] text-left">
              {[
                { t: "Workspace created", m: name },
                { t: "Teammates invited", m: invited ? `${invited} sent` : "skipped" },
                { t: "First document", m: "add it anytime" },
              ].map((r) => (
                <li key={r.t} className="flex items-center gap-2.5 px-4 py-3">
                  <FileCheck2 className="size-4 text-ink" />
                  <span className="flex-1 text-label text-ink">{r.t}</span>
                  <span className="text-body-s text-soft">{r.m}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-2 w-full" disabled={busy} onClick={finish}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Go to dashboard"}
            </Button>
          </div>
        )}

        {step > 1 && step < 4 && (
          <button onClick={() => setStep((s) => s - 1)} className="mt-4 block w-full text-center text-caption text-faint hover:text-soft">
            Back
          </button>
        )}
      </div>
    </div>
  );
}
