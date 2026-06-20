/**
 * Demo data for the Praxos LMS UI. Mirrors the Figma screens so every page
 * renders with realistic content before the FastAPI backend is wired in.
 */

export const learner = {
  name: "Daniel Acheampong",
  firstName: "Daniel",
  role: "Learner",
  streak: 5,
  understanding: 74,
  pathProgress: "1 / 5",
  practisedThisWeek: "38m",
  sessions: 12,
};

export const workspace = { name: "Meridian Health", plan: "Admin workspace" };

export type PathStatus = "mastered" | "in_progress" | "up_next" | "locked";

export const learningPath: {
  title: string;
  sections: number;
  status: PathStatus;
  progress?: number;
}[] = [
  { title: "Code of conduct", sections: 5, status: "mastered" },
  { title: "Data protection & GDPR", sections: 6, status: "in_progress", progress: 62 },
  { title: "Information security basics", sections: 4, status: "up_next" },
  { title: "Expense & travel policy", sections: 3, status: "locked" },
  { title: "Anti-harassment training", sections: 4, status: "locked" },
];

export const continueLearning = {
  doc: "Data protection & GDPR",
  position: "Document 2 of 5 in your path",
  remaining: "About 12 minutes of talking left to reach mastery.",
  understanding: 62,
};

export const pastSessions = [
  { doc: "Code of conduct", date: "18 Jun", score: 88, duration: "9m", topics: "5 / 5" },
  { doc: "Data protection & GDPR", date: "17 Jun", score: 62, duration: "14m", topics: "4 / 6" },
  { doc: "Information security basics", date: "15 Jun", score: 71, duration: "11m", topics: "3 / 4" },
  { doc: "Code of conduct", date: "12 Jun", score: 54, duration: "8m", topics: "3 / 5" },
];

export const myDocuments = [
  { name: "Data protection & GDPR", pages: 24, status: "Assigned", added: "2 days ago" },
  { name: "Code of conduct", pages: 12, status: "Mastered", added: "1 week ago" },
  { name: "Information security basics", pages: 18, status: "Assigned", added: "1 week ago" },
  { name: "Expense & travel policy", pages: 9, status: "Locked", added: "2 weeks ago" },
];

export const sessionSummary = {
  score: 82,
  headline: "Solid grasp. Well done.",
  blurb:
    "You demonstrated 4 of 5 topics and can explain data subject rights clearly. Retention windows still needs a little work, so we will pick that up next time.",
  demonstrated: "4 of 5 demonstrated",
  topics: [
    { name: "What personal data means", status: "Demonstrated" },
    { name: "Lawful bases for processing", status: "Demonstrated" },
    { name: "Data subject rights", status: "Demonstrated" },
    { name: "Retention windows", status: "Needs review" },
    { name: "Breach reporting duties", status: "Demonstrated" },
  ],
};

export const liveSession = {
  doc: "Data protection & GDPR",
  nowTeaching: "Data subject rights",
  understanding: 71,
  demonstratedCount: 2,
  caption: {
    spoken: "A data subject can ask to see everything you hold on them. That request is a subject access ",
    pending: "request, and you have one month to respond.",
    you: "You: They can ask for their data, and we have 30 days to reply.",
  },
  topics: [
    { name: "What personal data means", state: "done" as const },
    { name: "Lawful bases for processing", state: "done" as const },
    { name: "Data subject rights", state: "now" as const },
    { name: "Retention windows", state: "locked" as const },
    { name: "Breach reporting duties", state: "locked" as const },
  ],
  notes: [
    "Rises only when you explain it in your own words",
    "Background noise and silence never lower it",
  ],
  transcript: [
    { who: "Tutor", text: "Let's talk about data subject rights. What can someone ask you to do with their data?" },
    { who: "You", text: "They can ask to see it, correct it, or delete it." },
    { who: "Tutor", text: "Good. When they ask to see it, what is that request called?" },
    { who: "You", text: "A subject access request." },
    { who: "Tutor", text: "Exactly. And how long do you have to respond?" },
  ],
};

/* ── Admin ────────────────────────────────────────────────── */
export const adminKpis = [
  { label: "Avg understanding", value: "74", hint: "↗ +6 this month" },
  { label: "Active learners", value: "128", hint: "↗ of 142 invited" },
  { label: "Completion", value: "86%", hint: "↗ +4 this week" },
  { label: "At risk", value: "11", hint: "↘ needs follow-up" },
  { label: "Sessions today", value: "34", hint: "↗ +12 vs yesterday" },
];

export const understandingTrend = [
  { m: "Mar", v: 58 }, { m: "", v: 60 }, { m: "Apr", v: 64 }, { m: "", v: 62 },
  { m: "May", v: 69 }, { m: "", v: 72 }, { m: "Jun", v: 74 }, { m: "", v: 78 },
];

export const cohortHealth = [
  { name: "March new hires", value: 71, pct: 58 },
  { name: "Q1 Engineering", value: 82, pct: 74 },
  { name: "Sales onboarding", value: 64, pct: 41 },
  { name: "Compliance refresh", value: 77, pct: 66 },
];

export const needsAttention = [
  { name: "Omar Haddad", cohort: "Sales onboarding · stuck on Subject rights", score: 38 },
  { name: "Marcus Lindqvist", cohort: "March new hires · stuck on Retention", score: 46 },
  { name: "Grace Mwangi", cohort: "March new hires · stuck on Retention", score: 49 },
  { name: "Lena Vogt", cohort: "Sales onboarding · stuck on Breach reporting", score: 51 },
];

export const recentActivity = [
  { who: "Priya Nair", what: "mastered Code of conduct", when: "12m" },
  { who: "Kenji Watanabe", what: "finished a session, now 88", when: "38m" },
  { who: "3 people", what: "joined March new hires", when: "1h" },
  { who: "Data protection & GDPR", what: "was re-indexed", when: "2h" },
];

export const cohorts = [
  { name: "March new hires", members: 24, avg: 71, completion: 58, status: "On track" },
  { name: "Q1 Engineering", members: 31, avg: 82, completion: 74, status: "On track" },
  { name: "Sales onboarding", members: 18, avg: 64, completion: 41, status: "At risk" },
  { name: "Compliance refresh", members: 42, avg: 77, completion: 66, status: "On track" },
];

export const people = [
  { name: "Aisha Bello", email: "aisha.bello@meridian.health", cohort: "March new hires", documents: 3, understanding: 71, role: "Learner" },
  { name: "Tomás Herrera", email: "tomas.h@meridian.health", cohort: "March new hires", documents: 3, understanding: 63, role: "Learner" },
  { name: "Marcus Lindqvist", email: "marcus.l@meridian.health", cohort: "Q1 Engineering", documents: 2, understanding: 78, role: "Learner" },
  { name: "Grace Mwangi", email: "grace.m@meridian.health", cohort: "Sales onboarding", documents: 4, understanding: 49, role: "Learner" },
  { name: "Kenji Watanabe", email: "kenji.w@meridian.health", cohort: "Q1 Engineering", documents: 2, understanding: 88, role: "Learner" },
  { name: "Priya Nair", email: "priya.n@meridian.health", cohort: "Compliance refresh", documents: 5, understanding: 100, role: "Manager" },
  { name: "Sofia Okonkwo", email: "sofia.o@meridian.health", cohort: "-", documents: 24, understanding: 0, role: "Admin" },
];

export const adminDocuments = [
  { name: "Code of conduct", sections: 5, assigned: 142, status: "Indexed" },
  { name: "Data protection & GDPR", sections: 6, assigned: 128, status: "Indexed" },
  { name: "Information security basics", sections: 4, assigned: 96, status: "Indexed" },
  { name: "Expense & travel policy", sections: 3, assigned: 54, status: "Indexed" },
  { name: "Anti-bribery & corruption", sections: 5, assigned: 31, status: "Indexed" },
  { name: "Health & safety handbook", sections: 8, assigned: 0, status: "Indexing" },
];

export const teams = [
  { name: "Engineering", lead: "Marcus Lindqvist", members: 18, paths: 3, avg: 82 },
  { name: "Sales", lead: "Grace Mwangi", members: 31, paths: 2, avg: 64 },
  { name: "Operations", lead: "Tomás Herrera", members: 24, paths: 4, avg: 71 },
  { name: "People & Culture", lead: "Sofia Okonkwo", members: 9, paths: 5, avg: 88 },
  { name: "Finance", lead: "Priya Nair", members: 12, paths: 3, avg: 76 },
  { name: "Customer Success", lead: "Kenji Watanabe", members: 16, paths: 3, avg: 79 },
];

export const cohortTabs = ["March new hires", "Q1 Engineering", "Sales onboarding", "Compliance refresh"];

export const cohortDetail = {
  kpis: [
    { label: "Members", value: "24", hint: "2 joined this week" },
    { label: "Avg understanding", value: "71", hint: "+9 in 7 days" },
    { label: "Completion", value: "58%", hint: "on track" },
    { label: "Mastered", value: "1.6", hint: "docs per person" },
    { label: "At risk", value: "3", hint: "need a nudge" },
  ],
  completionTrend: [
    { m: "Wk 1", v: 36 }, { m: "Wk 2", v: 40 }, { m: "Wk 3", v: 44 }, { m: "Wk 4", v: 49 },
    { m: "Wk 5", v: 52 }, { m: "Wk 6", v: 55 }, { m: "Wk 7", v: 57 }, { m: "Now", v: 58 },
  ],
  stands: { total: 120, mastered: 46, inProgress: 49, notStarted: 25 },
  pathDocs: [
    { name: "Code of conduct", avg: 88, completion: 92, mastered: "22 / 24" },
    { name: "Data protection & GDPR", avg: 64, completion: 54, mastered: "9 / 24" },
    { name: "Information security basics", avg: 58, completion: 41, mastered: "6 / 24" },
  ],
};

export const analyzing = {
  file: "Data protection & GDPR.pdf",
  meta: "1.4 MB · uploaded just now",
  steps: [
    { label: "Extracting text", note: "Found 4,210 words", state: "done" as const },
    { label: "Splitting into sections", note: "6 sections", state: "done" as const },
    { label: "Mapping key concepts", note: "5 topics found so far", state: "active" as const },
    { label: "Building the teaching plan", note: "", state: "pending" as const },
    { label: "Indexing for voice", note: "", state: "pending" as const },
  ],
  progress: 62,
};

export const teachingPlan = {
  doc: "Data protection & GDPR",
  blurb: "Praxos turned this document into a 5-module course. Edit it, then assign it to people, teams or cohorts.",
  kpis: [
    { label: "Modules", value: "5" },
    { label: "Est. time", value: "48 min" },
    { label: "Key topics", value: "18" },
    { label: "Difficulty", value: "Intermediate" },
    { label: "Source sections", value: "6" },
  ],
  modules: [
    {
      title: "What personal data means",
      desc: "Learners can identify what counts as personal and special-category data, with real examples from the policy.",
      topics: ["Definitions", "Special categories", "Worked examples", "Pseudonymisation"],
      minutes: 8,
      source: "From section 1 · Taught by voice, checked with 2 questions",
    },
    {
      title: "Lawful bases for processing",
      desc: "Learners can name the six lawful bases and pick the right one for a given scenario.",
      topics: ["Consent", "Contract", "Legal obligation", "Legitimate interest", "Vital interests", "Public task"],
      minutes: 11,
      source: "From section 2 · Taught by voice, checked with 3 questions",
    },
    {
      title: "Data subject rights",
      desc: "Learners can explain the key rights and walk through handling a subject access request.",
      topics: ["Right of access", "Rectification", "Erasure", "Subject access request", "The 30-day rule"],
      minutes: 12,
      source: "From sections 3-4 · Taught by voice, checked with 3 questions",
    },
    {
      title: "Retention & data minimisation",
      desc: "Learners can apply retention schedules and justify minimisation decisions.",
      topics: ["Retention windows", "Minimisation"],
      minutes: 8,
      source: "From section 5 · Taught by voice, checked with 2 questions",
    },
    {
      title: "Breach reporting",
      desc: "Learners know the 72-hour rule and exactly who to notify when something goes wrong.",
      topics: ["72-hour rule", "Who to notify"],
      minutes: 9,
      source: "From section 6 · Taught by voice, checked with 2 questions",
    },
  ],
};

export const members = [
  { name: "Sofia Okonkwo", email: "sofia.o@meridian.health", role: "Admin" },
  { name: "Priya Nair", email: "priya.n@meridian.health", role: "Manager" },
  { name: "Marcus Lindqvist", email: "marcus.l@meridian.health", role: "Member" },
  { name: "Grace Mwangi", email: "grace.m@meridian.health", role: "Member" },
  { name: "Kenji Watanabe", email: "kenji.w@meridian.health", role: "Member" },
];

export const billing = {
  plan: "Business",
  price: "$1,420",
  per: "billed monthly",
  detail: "$10 / learner / month · 142 active learners",
  card: "Visa ending 4242",
  cardExpiry: "Expires 09 / 27",
  invoices: [
    { date: "Jun 1, 2026", amount: "$1,420.00", status: "Paid" },
    { date: "May 1, 2026", amount: "$1,310.00", status: "Paid" },
    { date: "Apr 1, 2026", amount: "$1,290.00", status: "Paid" },
  ],
};

export const notifications = {
  email: [
    { title: "Weekly understanding summary", desc: "A Monday digest of how your team is tracking.", on: true },
    { title: "At-risk alerts", desc: "When someone drops below 50 understanding.", on: true },
    { title: "New learner joins", desc: "When a person accepts an invite.", on: false },
  ],
  inApp: [
    { title: "Plan completions", desc: "When a cohort finishes an assigned plan.", on: true },
    { title: "Product updates", desc: "Occasional news about new Praxos features.", on: false },
  ],
};

export const account = {
  name: "Sofia Okonkwo",
  email: "sofia.o@meridian.health",
  role: "People Operations",
};

/* ── Modals ───────────────────────────────────────────────── */
export const inviteDefaults = ["ana.silva@acme.com", "ben.cole@acme.com", "dev.rao@acme.com"];

export const teamLeadCandidates = [
  { name: "Marcus Lindqvist", role: "Senior Engineer", score: 82 },
  { name: "Kenji Watanabe", role: "Staff Engineer", score: 88 },
  { name: "Dev Rao", role: "Engineering Manager", score: 79 },
  { name: "Aisha Bello", role: "Backend Engineer", score: 71 },
  { name: "Ben Cole", role: "Platform Engineer", score: 66 },
];

/* ── Marketing ────────────────────────────────────────────── */
export const marketing = {
  companies: ["Northwind Freight", "Meridian Health", "Atlas Advisory", "Quanta Financial", "Vantage Retail", "Halden Energy"],
  features: [
    {
      title: "Guided learning paths",
      desc: "Each document becomes an ordered course. Praxos decides what to teach next and keeps everyone moving toward mastery.",
    },
    {
      title: "Understanding you can trust",
      desc: "Scores only move when a learner explains an idea in their own words. Background noise and silence never inflate them.",
    },
    {
      title: "Voice-first, hands-free",
      desc: "Designed for talking it through. Your team learns on a commute or between meetings, with no slides to click.",
    },
    {
      title: "Similar documents, taught together",
      desc: "Praxos groups related policies so concepts reinforce each other instead of being learned in isolation.",
    },
    {
      title: "See where everyone is",
      desc: "Admin dashboards show understanding across cohorts and teams, and surface exactly who needs a nudge.",
    },
  ],
  pricing: [
    {
      name: "Team",
      price: "$6",
      per: "/ learner / month",
      blurb: "For small teams getting started with proven onboarding.",
      features: ["Up to 50 learners", "Unlimited documents", "Voice teaching sessions", "Understanding scoring", "Email support"],
      cta: "Start free trial",
      featured: false,
    },
    {
      name: "Business",
      price: "$10",
      per: "/ learner / month",
      blurb: "For companies onboarding at scale across departments.",
      features: ["Up to 1,000 learners", "Everything in Team", "Cohorts & teams", "Admin analytics", "SSO & SAML", "Priority support"],
      cta: "Start free trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      per: "",
      blurb: "For regulated orgs with advanced security needs.",
      features: ["Unlimited learners", "Everything in Business", "Role-based access (RBAC)", "Audit logs & data residency", "Dedicated success manager"],
      cta: "Talk to sales",
      featured: false,
    },
  ],
};

export const assignTargets = {
  People: people.filter((p) => p.role === "Learner").map((p) => ({ name: p.name, meta: p.cohort, badge: undefined as string | undefined })),
  Teams: teams.map((t) => ({ name: t.name, meta: `${t.members} members`, badge: t.name[0] })),
  Cohorts: cohorts.map((c) => ({ name: c.name, meta: `${c.members} members`, badge: c.name[0] })),
};
