import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useData } from "@/lib/data";

/**
 * Sends a first-time signed-in user (any auth method, including Google) into the
 * onboarding flow when they reach the app. Gates on the workspace's `onboarded`
 * flag from the backend — not the sign-up route — so OAuth users get it too.
 */
export function OnboardingGate() {
  const { mode, needsOnboarding } = useData();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== "user") return; // wait for the real bundle (not demo/loading)
    const inApp = pathname.startsWith("/app") || pathname.startsWith("/admin");
    if (needsOnboarding && inApp) {
      navigate("/onboarding", { replace: true });
    } else if (!needsOnboarding && pathname === "/onboarding") {
      navigate("/admin", { replace: true });
    }
  }, [mode, needsOnboarding, pathname, navigate]);

  return null;
}
