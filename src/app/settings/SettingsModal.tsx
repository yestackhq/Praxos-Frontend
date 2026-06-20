import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Building2, Users, CreditCard, Bell, Upload, Lock } from "lucide-react";
import { Modal, ModalClose } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Avatar } from "@/ui/data";
import { Switch } from "@/ui/Switch";
import { Dropdown } from "@/ui/Dropdown";
import { cn } from "@/lib/utils";
import { useData, useDataActions } from "@/lib/data";
import { notifications } from "@/lib/mock";

const ROLE_OPTIONS = [
  { value: "Learner", label: "Learner" },
  { value: "Manager", label: "Manager" },
  { value: "Admin", label: "Admin" },
];
const LANGS = ["English (UK)", "English (US)", "Français", "Deutsch"].map((l) => ({ value: l, label: l }));

export type SettingsTab = "account" | "workspace" | "members" | "billing" | "notifications";

const tabs: { id: SettingsTab; label: string; icon: typeof UserRound; path: string }[] = [
  { id: "account", label: "Account", icon: UserRound, path: "/admin/settings/account" },
  { id: "workspace", label: "Workspace", icon: Building2, path: "/admin/settings" },
  { id: "members", label: "Members", icon: Users, path: "/admin/settings/members" },
  { id: "billing", label: "Billing", icon: CreditCard, path: "/admin/settings/billing" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/admin/settings/notifications" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption text-faint">{label}</span>
      {children}
    </label>
  );
}
const inputCls =
  "h-10 w-full rounded-md border border-border bg-[#3c315b]/[0.02] px-3 text-label text-ink outline-none focus:border-soft";

export function SettingsModal({ tab }: { tab: SettingsTab }) {
  const navigate = useNavigate();
  const close = () => navigate("/admin");
  const footerSave = tab === "members" || tab === "billing";

  return (
    <Modal onClose={close} className="max-w-3xl" labelledBy="settings-title">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <h2 id="settings-title" className="text-title text-ink">
          Settings
        </h2>
        <ModalClose onClose={close} />
      </div>

      <div className="flex h-[480px]">
        <nav className="w-48 shrink-0 border-r border-hairline p-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(t.path)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-label transition-colors",
                t.id === tab ? "bg-[#3c315b]/8 text-ink" : "text-soft hover:bg-[#3c315b]/5 hover:text-ink",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 overflow-y-auto p-6">
          {tab === "account" && <AccountTab />}
          {tab === "workspace" && <WorkspaceTab />}
          {tab === "members" && <MembersTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "notifications" && <NotificationsTab />}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-hairline px-6 py-4">
        {footerSave ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save changes</Button>
          </>
        )}
      </div>
    </Modal>
  );
}

function AccountTab() {
  const { account } = useData();
  return (
    <div className="space-y-5">
      <p className="eyebrow">Account</p>
      <div className="flex items-center gap-3">
        <Avatar name={account.name} size={56} />
        <Button variant="secondary" size="sm">
          <Upload className="size-3.5" /> Change photo
        </Button>
      </div>
      <Field label="Full name">
        <input defaultValue={account.name} className={inputCls} />
      </Field>
      <Field label="Email">
        <input defaultValue={account.email} className={inputCls} />
      </Field>
      <Field label="Job title">
        <input defaultValue={account.role} className={inputCls} />
      </Field>
    </div>
  );
}

function WorkspaceTab() {
  const { workspace } = useData();
  const slug = workspace.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [lang, setLang] = useState("English (UK)");
  return (
    <div className="space-y-5">
      <p className="eyebrow">Workspace</p>
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-lg bg-ink text-title font-semibold text-bg">
          {workspace.name[0]}
        </span>
        <Button variant="secondary" size="sm">
          <Upload className="size-3.5" /> Upload logo
        </Button>
      </div>
      <Field label="Workspace name">
        <input defaultValue={workspace.name} className={inputCls} />
      </Field>
      <Field label="Workspace URL">
        <input defaultValue={`praxos.io/${slug}`} className={inputCls} />
      </Field>
      <div className="block">
        <span className="mb-1.5 block text-caption text-faint">Default teaching language</span>
        <Dropdown value={lang} onChange={setLang} options={LANGS} />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-hairline p-4">
        <div>
          <p className="text-label text-ink">Delete workspace</p>
          <p className="text-caption text-faint">Permanently remove all documents, people and data.</p>
        </div>
        <Button variant="danger" size="sm">
          Delete
        </Button>
      </div>
    </div>
  );
}

function MembersTab() {
  const navigate = useNavigate();
  const { admin, role } = useData();
  const { setRole } = useDataActions();
  const members = admin.people;
  const admins = members.filter((m) => m.role === "Admin" || m.role === "Owner").length;
  const isAdmin = role === "Admin" || role === "Owner";
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-h3 text-ink">Members</h3>
          <p className="text-caption text-faint">
            {members.length} {members.length === 1 ? "person" : "people"}
            {admins ? ` · ${admins} admin${admins === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/admin/people/invite")}>
          <Users className="size-3.5" /> Invite member
        </Button>
      </div>
      <ul className="divide-y divide-hairline">
        {members.map((m) => (
          <li key={m.email} className="flex items-center gap-3 py-3">
            <Avatar name={m.name} size={34} />
            <div className="min-w-0 flex-1">
              <p className="text-label text-ink">{m.name}</p>
              <p className="text-caption text-faint">{m.email}</p>
            </div>
            {isAdmin && m.id != null ? (
              <Dropdown
                size="sm"
                align="end"
                className="w-32"
                value={m.role}
                onChange={(v) => void setRole(m.id!, v)}
                options={ROLE_OPTIONS}
              />
            ) : (
              <span className="rounded-md border border-border px-2.5 py-1.5 text-caption text-soft">{m.role}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="grid size-12 place-items-center rounded-xl border border-hairline text-soft">
        <Lock className="size-5" />
      </span>
      <h3 className="mt-4 text-title text-ink">Billing is coming soon</h3>
      <p className="mt-1.5 max-w-xs text-body-s text-soft">
        Plans and invoices are locked while Praxos is in early access. Your workspace is free during this period.
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-caption text-faint">
        <CreditCard className="size-3.5" /> No card required
      </span>
    </div>
  );
}

function NotificationsTab() {
  const Group = ({ title, items }: { title: string; items: typeof notifications.email }) => (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-4">
        {items.map((n) => (
          <li key={n.title} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-label text-ink">{n.title}</p>
              <p className="text-caption text-faint">{n.desc}</p>
            </div>
            <Switch defaultOn={n.on} />
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="space-y-7">
      <Group title="Email" items={notifications.email} />
      <Group title="In-app" items={notifications.inApp} />
    </div>
  );
}
