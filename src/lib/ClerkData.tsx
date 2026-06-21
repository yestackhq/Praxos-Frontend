import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { apiPost, apiSend, apiUpload } from "@/lib/apiClient";
import { uploadOriginalPdf } from "@/lib/docStorage";
import {
  DataActionsContext,
  DataContext,
  demoBundle,
  emptyUserBundle,
  type Bundle,
  type Cohort,
  type Team,
} from "./data";

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
    // Retry generously: besides a briefly-unavailable Clerk token, the backend
    // may be COLD-STARTING (Railway sleeps idle services — 10-20s to wake). Giving
    // up after ~2s drops the user onto the misleading empty bundle, so an invited
    // learner looks like they own an empty workspace. Ride the cold start out.
    for (let attempt = 0; attempt < 7; attempt++) {
      try {
        const token = await getToken();
        const data = await apiPost<Bundle>("/api/bootstrap", { name, email }, token);
        setBundle({ ...data, mode: "user" });
        return;
      } catch {
        await new Promise((r) => setTimeout(r, Math.min(3000, 700 * (attempt + 1))));
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

  // No WebSocket layer in this app, so keep the workspace fresh the lightweight
  // way: refetch when the tab regains focus and on a slow interval while visible.
  // This is how an accepted invite / new cohort member shows up without a manual
  // refresh.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const refetch = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", refetch);
    document.addEventListener("visibilitychange", refetch);
    const id = window.setInterval(refetch, 20000);
    return () => {
      window.removeEventListener("focus", refetch);
      document.removeEventListener("visibilitychange", refetch);
      window.clearInterval(id);
    };
  }, [isLoaded, isSignedIn, load]);

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
      completeOnboarding: async (workspaceName?: string, slug?: string) => {
        await apiSend("POST", "/api/onboarding/complete", { workspaceName, slug }, await getToken());
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
      deleteDocument: async (id: number) => {
        await apiSend("DELETE", `/api/documents/${id}`, null, await getToken());
        await load();
      },
      createCohort: async (name: string, documentIds: number[], memberUserIds: number[]) => {
        const c = await apiPost<Cohort>(
          "/api/cohorts",
          { name, documentIds, memberUserIds },
          await getToken(),
        );
        await load();
        return c;
      },
      editCohort: async (
        id: number,
        patch: { name?: string; documentIds?: number[]; memberUserIds?: number[] },
      ) => {
        await apiSend("PATCH", `/api/cohorts/${id}`, patch, await getToken());
        await load();
      },
      deleteCohort: async (id: number) => {
        await apiSend("DELETE", `/api/cohorts/${id}`, null, await getToken());
        await load();
      },
      publishCohort: async (id: number) => {
        await apiSend("POST", `/api/cohorts/${id}/publish`, {}, await getToken());
        await load();
      },
      createTeam: async (name: string, lead: string, documentIds: number[], memberUserIds: number[]) => {
        const t = await apiPost<Team>(
          "/api/teams",
          { name, lead, documentIds, memberUserIds },
          await getToken(),
        );
        await load();
        return t;
      },
      editTeam: async (
        id: number,
        patch: { name?: string; lead?: string; documentIds?: number[]; memberUserIds?: number[] },
      ) => {
        await apiSend("PATCH", `/api/teams/${id}`, patch, await getToken());
        await load();
      },
      deleteTeam: async (id: number) => {
        await apiSend("DELETE", `/api/teams/${id}`, null, await getToken());
        await load();
      },
      publishTeam: async (id: number) => {
        await apiSend("POST", `/api/teams/${id}/publish`, {}, await getToken());
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
