import { test, expect } from "@playwright/test";

/**
 * Visits every route, asserts a key heading, and screenshots each into
 * ../.design/screens/. SPA routes are reached via in-app history to exercise
 * the client router (and survive the dev server's history fallback).
 */

const SHOT_DIR = "../.design/screens";

type Route = { path: string; name: string; expect: string | RegExp; settle?: number };

const routes: Route[] = [
  { path: "/", name: "marketing", expect: /Voice-first onboarding/ },
  { path: "/sign-in", name: "auth-signin", expect: "Welcome back" },
  { path: "/sign-up", name: "auth-signup", expect: "Create your workspace" },
  { path: "/app", name: "learner-home", expect: /Good morning/ },
  { path: "/app/path", name: "learner-path", expect: "My learning path" },
  { path: "/app/sessions", name: "learner-sessions", expect: "Past sessions" },
  { path: "/app/documents", name: "learner-documents", expect: "My documents" },
  { path: "/app/session", name: "learner-live", expect: /Start session/ },
  { path: "/app/summary", name: "learner-summary", expect: "Solid grasp. Well done." },
  { path: "/admin", name: "admin-overview", expect: "Overview" },
  { path: "/admin/cohorts", name: "admin-cohorts", expect: "Cohorts" },
  { path: "/admin/people", name: "admin-people", expect: "People" },
  { path: "/admin/teams", name: "admin-teams", expect: "Teams" },
  { path: "/admin/documents", name: "admin-documents", expect: "Documents" },
  { path: "/admin/documents/plan", name: "doc-teaching-plan", expect: "Teaching plan" },
  { path: "/admin/documents/plan/edit", name: "doc-edit-plan", expect: "Editing" },
  { path: "/admin/documents/analyzing", name: "doc-analyzing", expect: "Building the teaching plan" },
  { path: "/admin/settings", name: "settings-workspace", expect: "Settings" },
  { path: "/admin/settings/members", name: "settings-members", expect: "Members" },
  { path: "/admin/settings/billing", name: "settings-billing", expect: "Billing is coming soon" },
  { path: "/admin/settings/notifications", name: "settings-notifications", expect: "Weekly understanding summary" },
  { path: "/admin/people/invite", name: "modal-invite", expect: "Invite people" },
  { path: "/admin/teams/new", name: "modal-new-team", expect: "Create a team" },
  { path: "/admin/teams/lead", name: "modal-assign-lead", expect: "Assign team lead" },
  { path: "/admin/documents/plan/assign", name: "modal-assign-plan", expect: "Assign teaching plan" },
];

for (const r of routes) {
  test(`route ${r.path} (${r.name})`, async ({ page }) => {
    await page.goto(r.path, { waitUntil: "networkidle" });
    await expect(page.getByText(r.expect).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(r.settle ?? 350); // let fonts/charts settle
    await page.screenshot({ path: `${SHOT_DIR}/${r.name}.png`, fullPage: false });
  });
}
