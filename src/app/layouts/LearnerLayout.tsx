import { NavLink, Outlet } from "react-router-dom";
import { House, Route, History, FileText, LayoutGrid } from "lucide-react";
import { Logo } from "@/ui/Logo";
import { ShellUser } from "@/app/auth/ShellUser";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data";

const nav = [
  { to: "/app", label: "Overview", icon: House, end: true },
  { to: "/app/path", label: "My learning path", icon: Route },
  { to: "/app/sessions", label: "Past sessions", icon: History },
  { to: "/app/documents", label: "My documents", icon: FileText },
];

function SideLink({ to, label, icon: Icon, end }: (typeof nav)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-label transition-colors",
          isActive ? "bg-[#3c315b]/8 text-ink" : "text-soft hover:bg-[#3c315b]/5 hover:text-ink",
        )
      }
    >
      <Icon className="size-4" />
      {label}
    </NavLink>
  );
}

export function LearnerLayout() {
  const { learner, account, role } = useData();
  const isAdmin = role === "Admin";
  return (
    <div className="flex h-screen bg-bg text-ink">
      <aside className="flex w-60 shrink-0 flex-col border-r border-hairline px-3 py-5">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-7 flex flex-col gap-1">
          {nav.map((n) => (
            <SideLink key={n.to} {...n} />
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className="mt-2 flex items-center gap-3 rounded-md border-t border-hairline px-3 pb-2 pt-3 text-label text-soft transition-colors hover:text-ink"
            >
              <LayoutGrid className="size-4" /> Workspace admin
            </NavLink>
          )}
        </nav>
        <div className="mt-auto">
          {/* Show the user's real role (e.g. "Workspace owner") — not a hardcoded
              "Learner" — so an admin in their own learning view isn't mislabelled. */}
          <ShellUser name={learner.name} sub={account.role} />
        </div>
      </aside>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-content px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
