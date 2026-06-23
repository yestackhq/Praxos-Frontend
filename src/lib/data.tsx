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

export type PathItem = (typeof mock.learningPath)[number] & { docId?: number | null };
export type Person = (typeof mock.people)[number] & { id?: number; team?: string; band?: string };
export type PendingInvite = { id: number; email: string; role: string };
export type AdminDoc = (typeof mock.adminDocuments)[number] & { id?: number };
export type CohortDoc = { id: number; name: string };
export type ContinueLearning = typeof mock.continueLearning & { docId?: number | null };
export type MyDoc = (typeof mock.myDocuments)[number] & { docId?: number | null };
export interface Cohort {
  id?: number;
  name: string;
  members: number;
  avg: number;
  completion: number;
  status: string;
  published?: boolean;
  memberIds?: number[];
  documentIds?: number[];
  documents?: CohortDoc[];
  understanding?: number;
  band?: string;
}
export interface Team {
  id?: number;
  name: string;
  lead: string;
  members: number;
  avg: number;
  paths?: number;
  published?: boolean;
  memberIds?: number[];
  documentIds?: number[];
  documents?: CohortDoc[];
}

export type WorkspaceRef = { id: number; name: string; slug: string; role: string };

export interface Bundle {
  mode: "demo" | "user" | "loading";
  needsOnboarding: boolean;
  workspace: { name: string; plan: string; slug?: string };
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
  workspaces: WorkspaceRef[]; // every workspace this person belongs to (drives the switcher)
  activeWorkspaceId: number | null;
  continueLearning: ContinueLearning | null;
  learningPath: PathItem[];
  pastSessions: typeof mock.pastSessions;
  myDocuments: MyDoc[];
  admin: {
    kpis: typeof mock.adminKpis;
    understandingKpis: typeof mock.adminKpis;
    understandingTrend: typeof mock.understandingTrend;
    understandingSeries: { date: string; score: number }[];
    cohortHealth: { name: string; value: number; pct: number; band?: string }[];
    teamHealth: { name: string; value: number }[];
    needsAttention: typeof mock.needsAttention;
    recentActivity: typeof mock.recentActivity;
    cohorts: Cohort[];
    people: Person[];
    pendingInvites: PendingInvite[];
    teams: Team[];
    documents: AdminDoc[];
  };
}

export const demoBundle: Bundle = {
  mode: "demo",
  needsOnboarding: false,
  workspace: mock.workspace,
  learner: mock.learner,
  account: { name: mock.account.name, email: mock.account.email, role: mock.account.role },
  role: "Admin",
  workspaces: [{ id: 0, name: mock.workspace.name, slug: "demo", role: "Admin" }],
  activeWorkspaceId: 0,
  continueLearning: mock.continueLearning,
  learningPath: mock.learningPath,
  pastSessions: mock.pastSessions,
  myDocuments: mock.myDocuments,
  admin: {
    kpis: mock.adminKpis,
    understandingKpis: mock.adminKpis,
    understandingTrend: mock.understandingTrend,
    understandingSeries: [],
    cohortHealth: mock.cohortHealth,
    teamHealth: mock.cohortHealth.map((c) => ({ name: c.name, value: c.value })),
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
    workspaces: [],
    activeWorkspaceId: null,
    continueLearning: null,
    learningPath: [],
    pastSessions: [],
    myDocuments: [],
    admin: {
      kpis: mock.adminKpis.map((k) => ({ ...k, value: k.value.includes("%") ? "0%" : "0", hint: "no data yet" })),
      understandingKpis: mock.adminKpis.map((k) => ({ ...k, value: k.value.includes("%") ? "0%" : "0", hint: "no data yet" })),
      understandingTrend: [],
      understandingSeries: [],
      cohortHealth: [],
      teamHealth: [],
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
  completeOnboarding: (workspaceName?: string, slug?: string) => Promise<void>;
  setActiveWorkspace: (id: number) => void;
  createWorkspace: (name?: string, slug?: string) => Promise<WorkspaceRef>;
  uploadDocument: (name: string, sections?: number) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  createCohort: (name: string, documentIds: number[], memberUserIds: number[]) => Promise<Cohort>;
  editCohort: (
    id: number,
    patch: { name?: string; documentIds?: number[]; memberUserIds?: number[] },
  ) => Promise<void>;
  deleteCohort: (id: number) => Promise<void>;
  publishCohort: (id: number) => Promise<void>;
  createTeam: (name: string, lead: string, documentIds: number[], memberUserIds: number[]) => Promise<Team>;
  editTeam: (
    id: number,
    patch: { name?: string; lead?: string; documentIds?: number[]; memberUserIds?: number[] },
  ) => Promise<void>;
  deleteTeam: (id: number) => Promise<void>;
  publishTeam: (id: number) => Promise<void>;
}
const noop = async () => {};
export const DataActionsContext = createContext<DataActions>({
  refresh: () => {},
  invite: noop,
  setRole: noop,
  revokeInvite: noop,
  completeOnboarding: noop,
  setActiveWorkspace: () => {},
  createWorkspace: async () => ({ id: 0, name: "", slug: "", role: "Admin" }),
  uploadDocument: noop,
  uploadFile: noop,
  deleteDocument: noop,
  createCohort: async () => ({ name: "", members: 0, avg: 0, completion: 0, status: "Draft" }),
  editCohort: noop,
  deleteCohort: noop,
  publishCohort: noop,
  createTeam: async () => ({ name: "", lead: "", members: 0, avg: 0 }),
  editTeam: noop,
  deleteTeam: noop,
  publishTeam: noop,
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
