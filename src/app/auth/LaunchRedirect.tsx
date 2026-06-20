import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/ui/Logo";
import { useData } from "@/lib/data";

/**
 * Post-login landing router. Clerk sends every user here after sign-in/up; we
 * wait for their workspace bundle, then route by role:
 *   needs onboarding → /onboarding
 *   Admin / Owner     → /admin   (admins land on the workspace UI, not the learner UI)
 *   everyone else     → /app
 * Rendering a neutral loader until the bundle resolves avoids a flash of the
 * wrong (learner) UI.
 */
export function LaunchRedirect() {
  const { mode, needsOnboarding, role } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "loading") return; // wait for the real bundle
    if (mode === "demo") {
      navigate("/", { replace: true }); // not signed in — shouldn't land here
      return;
    }
    if (needsOnboarding) {
      navigate("/onboarding", { replace: true });
      return;
    }
    const isAdmin = role === "Admin" || role === "Owner";
    navigate(isAdmin ? "/admin" : "/app", { replace: true });
  }, [mode, needsOnboarding, role, navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-bg text-ink">
      <Logo showWord={false} size={28} />
      <p className="text-caption text-faint">Opening your workspace…</p>
    </div>
  );
}
