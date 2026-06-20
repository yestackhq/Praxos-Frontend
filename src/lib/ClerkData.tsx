import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { apiPost, apiSend, apiUpload } from "@/lib/apiClient";
import { uploadOriginalPdf } from "@/lib/docStorage";
import { DataActionsContext, DataContext, demoBundle, emptyUserBundle, type Bundle } from "./data";

/**
 * Only mounted when Clerk is configured (so the hooks always have a provider).
 *  - signed out  → demo bundle (mock).
 *  - signed in   → POST /api/bootstrap with the Clerk token → the user's bundle.
 *    On any failure we use an empty user bundle, never the demo.
 * Exposes refresh() so mutations (invites, role changes) re-pull the workspace.
 */
export function ClerkDataProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [bundle, setBundle] = useState<Bundle>(demoBundle);

  const load = useCallback(async () => {
    if (!isSignedIn || !user) {
      setBundle(demoBundle);
      return;
    }
    const name = user.fullName || user.firstName || "there";
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    // The Clerk token can be briefly unavailable right after navigation, so retry
    // a few times before giving up — a transient failure must not strand the user.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const token = await getToken();
        const data = await apiPost<Bundle>("/api/bootstrap", { name, email }, token);
        setBundle({ ...data, mode: "user" });
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
    // Hard failure: land the user in the app, NOT onboarding. needsOnboarding is
    // only ever trusted from a successful backend bundle, so an already-onboarded
    // user is never looped back through the workspace-creation flow.
    setBundle({ ...emptyUserBundle(name, email), needsOnboarding: false });
  }, [isSignedIn, user, getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      const name = user.fullName || user.firstName || "there";
      const email = user.primaryEmailAddress?.emailAddress ?? "";
      setBundle({ ...emptyUserBundle(name, email), mode: "loading" });
    }
    void load();
  }, [isLoaded, load, isSignedIn, user]);

  const actions = useMemo(
    () => ({
      refresh: () => void load(),
      invite: async (email: string, role: string) => {
        await apiSend("POST", "/api/team/invites", { email, role }, await getToken());
        await load();
      },
      setRole: async (memberId: number, role: string) => {
        await apiSend("PATCH", `/api/team/members/${memberId}/role`, { role }, await getToken());
        await load();
      },
      revokeInvite: async (inviteId: number) => {
        await apiSend("DELETE", `/api/team/invites/${inviteId}`, null, await getToken());
        await load();
      },
      completeOnboarding: async (workspaceName?: string) => {
        await apiSend("POST", "/api/onboarding/complete", { workspaceName }, await getToken());
        await load();
      },
      uploadDocument: async (name: string, sections = 0) => {
        await apiSend("POST", "/api/documents", { name, sections }, await getToken());
        await load();
      },
      uploadFile: async (file: File) => {
        // Persist the original PDF straight to Supabase Storage (publishable key,
        // no secret key) — best-effort. The backend then indexes the bytes.
        const stored = await uploadOriginalPdf(file);
        await apiUpload(
          "/api/documents/upload",
          file,
          await getToken(),
          stored ? { storage_path: stored.path } : undefined,
        );
        await load();
      },
    }),
    [load, getToken],
  );

  return (
    <DataActionsContext.Provider value={actions}>
      <DataContext.Provider value={bundle}>{children}</DataContext.Provider>
    </DataActionsContext.Provider>
  );
}
