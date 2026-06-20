import { createContext, useContext, type ReactNode } from "react";
import { clerkEnabled } from "@/app/auth/clerkEnabled";
import * as mock from "@/lib/mock";
import { ClerkDataProvider } from "./ClerkData";

/**
 * Workspace data layer.
 *
 *  - Signed out  → the shared Meridian/Daniel demo (mock) for the "See it live" preview.
 *  - Signed in   → the user's OWN workspace from the backend (empty for new users).
 *
 * A signed-in user never falls back to the demo data.
 */

export type PathItem = (typeof mock.learningPath)[number];
export type Person = (typeof mock.people)[number] & { id?: number };
export type PendingInvite = { id: number; email: string; role: string };

export interface Bundle {
  mode: "demo" | "user" | "loading";
  needsOnboarding: boolean;
  workspace: { name: string; plan: string };
  learner: {
    name: string;
    firstName: string;
    understanding: number;
    pathProgress: string;
    practisedThisWeek: string;
    sessions: number;
    streak: number;
  };
  account: { name: string; email: string; role: string };
  role: string; // the current user's workspace role
  continueLearning: typeof mock.continueLearning | null;
  learningPath: PathItem[];
  pastSessions: typeof mock.pastSessions;
  myDocuments: typeof mock.myDocuments;
  admin: {
    kpis: typeof mock.adminKpis;
    understandingTrend: typeof mock.understandingTrend;
    cohortHealth: typeof mock.cohortHealth;
    needsAttention: typeof mock.needsAttention;
    recentActivity: typeof mock.recentActivity;
    cohorts: typeof mock.cohorts;
    people: Person[];
    pendingInvites: PendingInvite[];
    teams: typeof mock.teams;
    documents: typeof mock.adminDocuments;
  };
}

export const demoBundle: Bundle = {
  mode: "demo",
  needsOnboarding: false,
  workspace: mock.workspace,
  learner: mock.learner,
  account: { name: mock.account.name, email: mock.account.email, role: mock.account.role },
  role: "Admin",
  continueLearning: mock.continueLearning,
  learningPath: mock.learningPath,
  pastSessions: mock.pastSessions,
  myDocuments: mock.myDocuments,
  admin: {
    kpis: mock.adminKpis,
    understandingTrend: mock.understandingTrend,
    cohortHealth: mock.cohortHealth,
    needsAttention: mock.needsAttention,
    recentActivity: mock.recentActivity,
    cohorts: mock.cohorts,
    people: mock.people,
    pendingInvites: [],
    teams: mock.teams,
    documents: mock.adminDocuments,
  },
};

/** Empty bundle for a signed-in user (used while loading and as a safe fallback). */
export function emptyUserBundle(name: string, email: string): Bundle {
  const first = (name || "there").trim().split(" ")[0] || "there";
  return {
    mode: "user",
    // Least-privilege placeholder used while loading / on a failed bootstrap. It
    // must NOT claim ownership or onboarding: an invited learner whose bootstrap
    // is slow (cold backend) would otherwise be shown an empty workspace they
    // appear to OWN — the "create your own workspace" screen. The real role +
    // onboarding flag only ever come from a successful backend bundle.
    needsOnboarding: false,
    workspace: { name: `${first}'s workspace`, plan: "Personal workspace" },
    learner: { name, firstName: first, understanding: 0, pathProgress: "0 / 0", practisedThisWeek: "0m", sessions: 0, streak: 0 },
    account: { name, email, role: "Learner" },
    role: "Learner",
    continueLearning: null,
    learningPath: [],
    pastSessions: [],
    myDocuments: [],
    admin: {
      kpis: mock.adminKpis.map((k) => ({ ...k, value: k.value.includes("%") ? "0%" : "0", hint: "no data yet" })),
      understandingTrend: [],
      cohortHealth: [],
      needsAttention: [],
      recentActivity: [],
      cohorts: [],
      people: email ? [{ name, email, cohort: "-", documents: 0, understanding: 0, role: "Admin" }] : [],
      pendingInvites: [],
      teams: [],
      documents: [],
    },
  };
}

export const DataContext = createContext<Bundle>(demoBundle);
export const useData = () => useContext(DataContext);

/** Actions on the workspace data. No-ops in demo mode (no backend / not signed in). */
export interface DataActions {
  refresh: () => void;
  invite: (email: string, role: string) => Promise<void>;
  setRole: (memberId: number, role: string) => Promise<void>;
  revokeInvite: (inviteId: number) => Promise<void>;
  completeOnboarding: (workspaceName?: string) => Promise<void>;
  uploadDocument: (name: string, sections?: number) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}
const noop = async () => {};
export const DataActionsContext = createContext<DataActions>({
  refresh: () => {},
  invite: noop,
  setRole: noop,
  revokeInvite: noop,
  completeOnboarding: noop,
  uploadDocument: noop,
  uploadFile: noop,
  deleteDocument: noop,
});
export const useDataActions = () => useContext(DataActionsContext);

/** Public provider: routes to the Clerk-aware provider when auth is configured. */
export function DataProvider({ children }: { children: ReactNode }) {
  if (!clerkEnabled) {
    // Demo: actions are no-ops (the preview is read-only).
    return <DataContext.Provider value={demoBundle}>{children}</DataContext.Provider>;
  }
  return <ClerkDataProvider>{children}</ClerkDataProvider>;
}
