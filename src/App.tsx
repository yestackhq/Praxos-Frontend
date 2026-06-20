import { Routes, Route, Navigate } from "react-router-dom";
import { LearnerLayout } from "@/app/layouts/LearnerLayout";
import { AdminLayout } from "@/app/layouts/AdminLayout";
import Landing from "@/app/marketing/Landing";
import SignInPage from "@/app/auth/SignInPage";
import SignUpPage from "@/app/auth/SignUpPage";
import { LaunchRedirect } from "@/app/auth/LaunchRedirect";
import { DataProvider } from "@/lib/data";
import Onboarding from "@/app/onboarding/Onboarding";
import { OnboardingGate } from "@/app/onboarding/OnboardingGate";
import LearnerHome from "@/app/pages/learner/Home";
import LearningPath from "@/app/pages/learner/LearningPath";
import PastSessions from "@/app/pages/learner/PastSessions";
import MyDocuments from "@/app/pages/learner/MyDocuments";
import SessionSummary from "@/app/pages/learner/SessionSummary";
import LiveSession from "@/app/pages/learner/LiveSession";
import AdminOverview from "@/app/pages/admin/Overview";
import Understanding from "@/app/pages/admin/Understanding";
import Cohorts from "@/app/pages/admin/Cohorts";
import People from "@/app/pages/admin/People";
import Teams from "@/app/pages/admin/Teams";
import AdminDocuments from "@/app/pages/admin/Documents";
import Analyzing from "@/app/pages/document/Analyzing";
import TeachingPlan from "@/app/pages/document/TeachingPlan";
import EditPlan from "@/app/pages/document/EditPlan";
import { SettingsModal } from "@/app/settings/SettingsModal";
import InvitePeople from "@/app/modals/InvitePeople";
import NewTeam from "@/app/modals/NewTeam";
import AssignTeamLead from "@/app/modals/AssignTeamLead";
import AssignPlan from "@/app/modals/AssignPlan";
import NewCohort from "@/app/modals/NewCohort";

export default function App() {
  return (
    <DataProvider>
    <OnboardingGate />
    <Routes>
      {/* Marketing + auth */}
      <Route path="/" element={<Landing />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/launch" element={<LaunchRedirect />} />

      {/* Learner app */}
      <Route path="/app" element={<LearnerLayout />}>
        <Route index element={<LearnerHome />} />
        <Route path="path" element={<LearningPath />} />
        <Route path="sessions" element={<PastSessions />} />
        <Route path="documents" element={<MyDocuments />} />
      </Route>
      {/* Full-bleed screens (no sidebar) */}
      <Route path="/app/session" element={<LiveSession />} />
      <Route path="/admin/documents/analyzing" element={<Analyzing />} />
      <Route
        path="/app/summary"
        element={
          <div className="min-h-screen bg-bg px-6">
            <div className="mx-auto max-w-content">
              <SessionSummary />
            </div>
          </div>
        }
      />

      {/* Admin app */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="understanding" element={<Understanding />} />
        <Route path="cohorts" element={<Cohorts />} />
        <Route path="cohorts/new" element={<><Cohorts /><NewCohort /></>} />
        <Route path="people" element={<People />} />
        <Route path="people/invite" element={<><People /><InvitePeople /></>} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/new" element={<><Teams /><NewTeam /></>} />
        <Route path="teams/lead" element={<><Teams /><AssignTeamLead /></>} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="documents/plan" element={<TeachingPlan />} />
        <Route path="documents/plan/assign" element={<><TeachingPlan /><AssignPlan /></>} />
        <Route path="documents/plan/edit" element={<EditPlan />} />
        <Route path="settings" element={<><AdminOverview /><SettingsModal tab="workspace" /></>} />
        <Route path="settings/account" element={<><AdminOverview /><SettingsModal tab="account" /></>} />
        <Route path="settings/members" element={<><AdminOverview /><SettingsModal tab="members" /></>} />
        <Route path="settings/billing" element={<><AdminOverview /><SettingsModal tab="billing" /></>} />
        <Route path="settings/notifications" element={<><AdminOverview /><SettingsModal tab="notifications" /></>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </DataProvider>
  );
}
