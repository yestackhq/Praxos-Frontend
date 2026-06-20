import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutGrid, TrendingUp, Users, UserRound, FileText, Settings } from "lucide-react";
import { Logo } from "@/ui/Logo";
import { ShellUser } from "@/app/auth/ShellUser";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/understanding", label: "Understanding", icon: TrendingUp },
  { to: "/admin/cohorts", label: "Cohorts", icon: Users },
  { to: "/admin/people", label: "People", icon: UserRound },
  { to: "/admin/teams", label: "Teams", icon: Users },
  { to: "/admin/documents", label: "Documents", icon: FileText },
];

export function AdminLayout() {
  const { workspace, account } = useData();
  return (
    <div className="flex h-screen bg-bg text-ink">
      <aside className="flex w-60 shrink-0 flex-col border-r border-hairline px-3 py-5">
        <div className="px-2">
          <Logo />
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-hairline px-3 py-2.5">
          <span className="grid size-7 place-items-center rounded-md bg-ink text-caption font-semibold text-bg">
            {workspace.name[0]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-label text-ink">{workspace.name}</p>
            <p className="text-caption text-faint">{workspace.plan}</p>
          </div>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
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
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-label text-soft transition-colors hover:bg-[#3c315b]/5 hover:text-ink"
          >
            <Settings className="size-4" />
            Settings
          </Link>
          <div className="mt-1">
            <ShellUser name={account.name} sub={account.role} />
          </div>
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
