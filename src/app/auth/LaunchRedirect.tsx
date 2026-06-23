import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceLoader } from "@/ui/WorkspaceLoader";
import { Button } from "@/ui/Button";
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
  const [slow, setSlow] = useState(false);

  // Cold-start guard: the backend can sleep when idle (~10-20s to wake). If we stay
  // in "loading" too long, show a friendly retry instead of an endless spinner.
  useEffect(() => {
    if (mode !== "loading") {
      setSlow(false);
      return;
    }
    const t = window.setTimeout(() => setSlow(true), 15000);
    return () => window.clearTimeout(t);
  }, [mode]);

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

  if (slow && mode === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-ink">
        <p className="text-title text-ink">Still waking things up…</p>
        <p className="max-w-sm text-body-s text-soft">
          The server may have been idle for a bit. This usually takes a few seconds — thanks for your patience.
        </p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return <WorkspaceLoader />;
}
