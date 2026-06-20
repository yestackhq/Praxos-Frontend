import { useEffect, useState, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/ui/Logo";
import { cn } from "@/lib/utils";

/**
 * Responsive app shell shared by the learner + admin layouts. The sidebar is a
 * static rail from `md` up, and a slide-in drawer (opened by a hamburger top bar)
 * on phones/tablets. Navigating closes the drawer automatically.
 */
export function AppShell({ nav, footer }: { nav: ReactNode; footer: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]); // close the drawer on navigation

  return (
    <div className="flex h-screen bg-bg text-ink">
      {/* Mobile top bar (hidden on md+). */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 border-b border-hairline bg-bg/95 px-4 backdrop-blur md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="-ml-1 grid size-9 place-items-center rounded-md text-soft transition-colors hover:bg-[#3c315b]/5 hover:text-ink"
        >
          <Menu className="size-5" />
        </button>
        <Logo />
      </header>

      {/* Drawer backdrop (mobile only). */}
      {open && (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar — drawer on mobile, static rail on md+. */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[82vw] flex-col border-r border-hairline bg-bg px-3 py-5 transition-transform duration-200 ease-out",
          "md:static md:z-auto md:w-60 md:max-w-none md:translate-x-0 md:shadow-none",
          open ? "translate-x-0 shadow-2xl shadow-black/20" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="grid size-8 place-items-center rounded-md text-soft transition-colors hover:bg-[#3c315b]/5 hover:text-ink md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto">{nav}</div>
        <div className="mt-auto pt-2">{footer}</div>
      </aside>

      {/* Main content — pad-top clears the mobile bar; generous gutters on desktop. */}
      <main className="min-h-0 flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-content px-4 py-6 sm:px-6 md:px-10 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
