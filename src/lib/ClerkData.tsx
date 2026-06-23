import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { apiPost, apiSend, apiUpload, setActiveWorkspaceId } from "@/lib/apiClient";
import { uploadOriginalPdf } from "@/lib/docStorage";
import {
  DataActionsContext,
  DataContext,
  demoBundle,
  emptyUserBundle,
  type Bundle,
  type Cohort,
  type Team,
  type WorkspaceRef,
} from "./data";

const ACTIVE_WS_KEY = "praxos.activeWorkspaceId";

// Pause the background bundle refetch while a live voice session is running, so a
// silent poll never replaces the bundle (and re-renders) mid-session. Set by
// useVoiceSession on start/end.
let _sessionActive = false;
export function setSessionActive(active: boolean): void {
  _sessionActive = active;
}

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
  const [reloadTick, setReloadTick] = useState(0); // bump to refetch (workspace switch / create)

  // Keep the latest Clerk values in refs so `load` (and `actions`) are STABLE — not
  // recreated each render. Clerk's `user`/`getToken` change reference frequently; if
  // they were in dependency arrays, the load effect would re-run every render and keep
  // flipping the bundle to "loading" → the "refreshes again and again" bug.
  const userRef = useRef(user);
  userRef.current = user;
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const isSignedInRef = useRef(isSignedIn);
  isSignedInRef.current = isSignedIn;
  const didInitRef = useRef(false); // has a real bundle loaded at least once?

  const load = useCallback(async (silent: boolean) => {
    const u = userRef.current;
    if (!isSignedInRef.current || !u) {
      didInitRef.current = false;
      setBundle(demoBundle);
      return;
    }
    const email = u.primaryEmailAddress?.emailAddress ?? "";
    // Don't bootstrap until Clerk has the email. With an empty email the backend can't
    // match a pending invite and would create a STRAY personal workspace (then route the
    // invitee to onboarding). Wait — the load effect re-runs when the email arrives.
    if (!email) return;
    const name = u.fullName || u.firstName || "";
    // Show the loader only on the FIRST real load; background refreshes stay silent.
    if (!silent && !didInitRef.current) {
      setBundle({ ...emptyUserBundle(name || "there", email), mode: "loading" });
    }
    // Send the persisted active workspace as X-Workspace-Id; the backend treats it as a
    // selector and falls back to a real membership if it's stale.
    setActiveWorkspaceId(localStorage.getItem(ACTIVE_WS_KEY));
    // Retry generously: the backend may be COLD-STARTING (Railway sleeps idle services).
    for (let attempt = 0; attempt < 7; attempt++) {
      try {
        const token = await getTokenRef.current();
        const data = await apiPost<Bundle>("/api/bootstrap", { name, email }, token);
        // Pin every later request to the workspace the server actually resolved.
        if (data.activeWorkspaceId != null) {
          setActiveWorkspaceId(data.activeWorkspaceId);
          try {
            localStorage.setItem(ACTIVE_WS_KEY, String(data.activeWorkspaceId));
          } catch {
            /* ignore */
          }
        }
        setBundle({ ...data, mode: "user" });
        didInitRef.current = true;
        return;
      } catch {
        await new Promise((r) => setTimeout(r, Math.min(3000, 700 * (attempt + 1))));
      }
    }
    // Hard failure: land the user in the app, NOT onboarding — only on a non-silent
    // (foreground) load, and only if we've never shown real data.
    if (!didInitRef.current) {
      setBundle({ ...emptyUserBundle(name || "there", email), needsOnboarding: false });
    }
  }, []);

  // Primary load: runs on sign-in, when the email becomes available, and on switch
  // (reloadTick). Deps are all primitive/stable, so this never loops.
  const email = isSignedIn ? user?.primaryEmailAddress?.emailAddress ?? "" : "";
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      didInitRef.current = false;
      setBundle(demoBundle);
      return;
    }
    // Signed in: hold the loader until the first real bundle (and until the email is
    // ready). Never clobber an already-loaded user bundle.
    setBundle((b) =>
      b.mode === "user"
        ? b
        : { ...emptyUserBundle(userRef.current?.firstName || "there", email), mode: "loading" },
    );
    if (!email) return;
    void load(false);
  }, [isLoaded, isSignedIn, email, reloadTick, load]);

  // Keep the workspace fresh without a WebSocket: silently refetch on focus + a slow
  // interval. Silent = no "loading" flash; paused during a live voice session.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const refetch = () => {
      if (document.visibilityState === "visible" && !_sessionActive) void load(true);
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

  // Actions are stable (refs/stable setters only) so consumers don't re-render when
  // Clerk re-renders. Post-mutation refreshes are SILENT (no loading flash).
  const actions = useMemo(
    () => ({
      refresh: () => void load(true),
      invite: async (email: string, role: string) => {
        await apiSend("POST", "/api/team/invites", { email, role }, await getTokenRef.current());
        await load(true);
      },
      setRole: async (memberId: number, role: string) => {
        await apiSend("PATCH", `/api/team/members/${memberId}/role`, { role }, await getTokenRef.current());
        await load(true);
      },
      revokeInvite: async (inviteId: number) => {
        await apiSend("DELETE", `/api/team/invites/${inviteId}`, null, await getTokenRef.current());
        await load(true);
      },
      completeOnboarding: async (workspaceName?: string, slug?: string) => {
        await apiSend("POST", "/api/onboarding/complete", { workspaceName, slug }, await getTokenRef.current());
        await load(true);
      },
      setActiveWorkspace: (id: number) => {
        // Switch workspace: persist it, point the API client at it, show the loader so
        // /launch re-routes by the new workspace's role, then refetch.
        setActiveWorkspaceId(id);
        try {
          localStorage.setItem(ACTIVE_WS_KEY, String(id));
        } catch {
          /* ignore */
        }
        setBundle((b) => ({ ...b, mode: "loading" }));
        setReloadTick((t) => t + 1);
      },
      createWorkspace: async (name?: string, slug?: string) => {
        const created = await apiPost<WorkspaceRef>("/api/workspaces", { name, slug }, await getTokenRef.current());
        setActiveWorkspaceId(created.id);
        try {
          localStorage.setItem(ACTIVE_WS_KEY, String(created.id));
        } catch {
          /* ignore */
        }
        setBundle((b) => ({ ...b, mode: "loading" }));
        setReloadTick((t) => t + 1);
        return created;
      },
      uploadDocument: async (name: string, sections = 0) => {
        await apiSend("POST", "/api/documents", { name, sections }, await getTokenRef.current());
        await load(true);
      },
      uploadFile: async (file: File) => {
        // Persist the original PDF straight to Supabase Storage (publishable key,
        // no secret key) — best-effort. The backend then indexes the bytes.
        const stored = await uploadOriginalPdf(file);
        await apiUpload(
          "/api/documents/upload",
          file,
          await getTokenRef.current(),
          stored ? { storage_path: stored.path } : undefined,
        );
        await load(true);
      },
      deleteDocument: async (id: number) => {
        await apiSend("DELETE", `/api/documents/${id}`, null, await getTokenRef.current());
        await load(true);
      },
      createCohort: async (name: string, documentIds: number[], memberUserIds: number[]) => {
        const c = await apiPost<Cohort>(
          "/api/cohorts",
          { name, documentIds, memberUserIds },
          await getTokenRef.current(),
        );
        await load(true);
        return c;
      },
      editCohort: async (
        id: number,
        patch: { name?: string; documentIds?: number[]; memberUserIds?: number[] },
      ) => {
        await apiSend("PATCH", `/api/cohorts/${id}`, patch, await getTokenRef.current());
        await load(true);
      },
      deleteCohort: async (id: number) => {
        await apiSend("DELETE", `/api/cohorts/${id}`, null, await getTokenRef.current());
        await load(true);
      },
      publishCohort: async (id: number) => {
        await apiSend("POST", `/api/cohorts/${id}/publish`, {}, await getTokenRef.current());
        await load(true);
      },
      createTeam: async (name: string, lead: string, documentIds: number[], memberUserIds: number[]) => {
        const t = await apiPost<Team>(
          "/api/teams",
          { name, lead, documentIds, memberUserIds },
          await getTokenRef.current(),
        );
        await load(true);
        return t;
      },
      editTeam: async (
        id: number,
        patch: { name?: string; lead?: string; documentIds?: number[]; memberUserIds?: number[] },
      ) => {
        await apiSend("PATCH", `/api/teams/${id}`, patch, await getTokenRef.current());
        await load(true);
      },
      deleteTeam: async (id: number) => {
        await apiSend("DELETE", `/api/teams/${id}`, null, await getTokenRef.current());
        await load(true);
      },
      publishTeam: async (id: number) => {
        await apiSend("POST", `/api/teams/${id}/publish`, {}, await getTokenRef.current());
        await load(true);
      },
    }),
    [load],
  );

  return (
    <DataActionsContext.Provider value={actions}>
      <DataContext.Provider value={bundle}>{children}</DataContext.Provider>
    </DataActionsContext.Provider>
  );
}
