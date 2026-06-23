import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { Check, ChevronsUpDown, LogOut, Plus, Settings, UserCog } from "lucide-react";
import { Avatar } from "@/ui/data";
import { useData, useDataActions } from "@/lib/data";
import { clerkEnabled } from "./clerkEnabled";

/**
 * User card at the bottom of the app shells. The WHOLE card is the trigger:
 * click anywhere on it to open the account menu (manage account / settings / sign out).
 */
export function ShellUser({ name, sub, isAdmin = false }: { name: string; sub: string; isAdmin?: boolean }) {
  if (!clerkEnabled) return <StaticCard name={name} sub={sub} />;
  return <ClerkCard name={name} sub={sub} isAdmin={isAdmin} />;
}

function StaticCard({ name, sub }: { name: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-hairline px-3 py-2.5">
      <Avatar name={name} size={32} />
      <Identity name={name} sub={sub} />
    </div>
  );
}

function Identity({ name, sub }: { name: string; sub: string }) {
  return (
    <div className="min-w-0 flex-1 text-left">
      <p className="truncate text-label text-ink">{name}</p>
      <p className="text-caption text-faint">{sub}</p>
    </div>
  );
}

function ClerkCard({ name, sub, isAdmin }: { name: string; sub: string; isAdmin: boolean }) {
  const { isSignedIn, user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { workspaces, activeWorkspaceId } = useData();
  const { setActiveWorkspace, createWorkspace } = useDataActions();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const switchTo = (id: number) => {
    setOpen(false);
    if (id !== activeWorkspaceId) {
      setActiveWorkspace(id);
      navigate("/launch"); // re-route by the new workspace's role (admin vs learner)
    }
  };

  const submitCreate = async () => {
    setBusy(true);
    try {
      await createWorkspace(newName.trim() || undefined);
      setOpen(false);
      setCreating(false);
      setNewName("");
      navigate("/launch");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Signed out (the public demo): the whole card sends you to sign in.
  if (!isSignedIn) {
    return (
      <button
        onClick={() => navigate("/sign-in")}
        className="flex w-full items-center gap-3 rounded-lg border border-hairline px-3 py-2.5 text-left transition-colors hover:border-soft hover:bg-[#3c315b]/5"
      >
        <Avatar name={name} size={32} />
        <Identity name={name} sub="Sign in" />
      </button>
    );
  }

  const display = user?.fullName || name;
  const img = user?.imageUrl;

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-2xl shadow-black/60">
          {workspaces.length > 0 && (
            <>
              <p className="px-2.5 pb-1 pt-1.5 text-caption uppercase tracking-wide text-faint">Workspaces</p>
              <div className="max-h-52 overflow-y-auto">
                {workspaces.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => switchTo(w.id)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[#3c315b]/5"
                  >
                    <Avatar name={w.name} size={22} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label text-ink">{w.name}</span>
                      <span className="block text-caption text-faint">{w.role}</span>
                    </span>
                    {w.id === activeWorkspaceId && <Check className="size-4 shrink-0 text-ink" />}
                  </button>
                ))}
              </div>
              {creating ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); void submitCreate(); }}
                  className="flex items-center gap-1.5 px-1.5 py-1.5"
                >
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Workspace name"
                    className="min-w-0 flex-1 rounded-md border border-hairline bg-bg px-2 py-1.5 text-label text-ink outline-none placeholder:text-faint focus:border-soft"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-md border border-hairline px-2.5 py-1.5 text-label text-soft transition-colors hover:border-soft hover:text-ink disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>
              ) : (
                <MenuItem icon={Plus} label="Create workspace" onClick={() => setCreating(true)} />
              )}
              <div className="my-1 h-px bg-hairline" />
            </>
          )}
          <MenuItem icon={UserCog} label="Manage account" onClick={() => { setOpen(false); openUserProfile(); }} />
          {isAdmin && (
            <MenuItem icon={Settings} label="Workspace settings" onClick={() => { setOpen(false); navigate("/admin/settings"); }} />
          )}
          <div className="my-1 h-px bg-hairline" />
          <MenuItem icon={LogOut} label="Sign out" onClick={() => { setOpen(false); void signOut({ redirectUrl: "/" }); }} />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg border border-hairline px-3 py-2.5 text-left transition-colors hover:border-soft hover:bg-[#3c315b]/5"
      >
        {img ? (
          <img src={img} alt="" className="size-8 rounded-full object-cover" />
        ) : (
          <Avatar name={display} size={32} />
        )}
        <Identity name={display} sub={sub} />
        <ChevronsUpDown className="size-4 shrink-0 text-faint" />
      </button>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: typeof LogOut; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-label text-soft transition-colors hover:bg-[#3c315b]/5 hover:text-ink"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
