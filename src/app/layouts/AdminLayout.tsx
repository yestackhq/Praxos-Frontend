import { NavLink, Link } from "react-router-dom";
import { LayoutGrid, TrendingUp, Users, UserRound, FileText, Settings } from "lucide-react";
import { ShellUser } from "@/app/auth/ShellUser";
import { WorkspaceLoader } from "@/ui/WorkspaceLoader";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data";
import { AppShell } from "./AppShell";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/understanding", label: "Understanding", icon: TrendingUp },
  { to: "/admin/cohorts", label: "Cohorts", icon: Users },
  { to: "/admin/people", label: "People", icon: UserRound },
  { to: "/admin/teams", label: "Teams", icon: Users },
  { to: "/admin/documents", label: "Documents", icon: FileText },
];

export function AdminLayout() {
  const { account, role, mode } = useData();
  if (mode === "loading") return <WorkspaceLoader />;
  return (
    <AppShell
      nav={
        <>
          <nav className="flex flex-col gap-1">
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
          <Link
            to="/admin/settings"
            className="mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-label text-soft transition-colors hover:bg-[#3c315b]/5 hover:text-ink"
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </>
      }
      footer={<ShellUser name={account.name} sub={account.role} isAdmin={role === "Admin"} />}
    />
  );
}
