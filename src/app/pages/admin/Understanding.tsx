import { useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, Users, UserRound, Search } from "lucide-react";
import { PageHeader } from "@/ui/page";
import { Card } from "@/ui/Card";
import { Avatar, ProgressBar } from "@/ui/data";
import { Dropdown } from "@/ui/Dropdown";
import { EmptyState } from "@/ui/EmptyState";
import { cn } from "@/lib/utils";
import { useData, type Person } from "@/lib/data";
import { PersonDrawer } from "./PersonDrawer";

function GroupBars({ rows, emptyHint }: { rows: { name: string; value: number }[]; emptyHint: string }) {
  if (rows.length === 0) return <p className="mt-4 text-body-s text-faint">{emptyHint}</p>;
  return (
    <ul className="mt-5 space-y-5">
      {rows.map((c) => (
        <li key={c.name}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-label text-ink">{c.name}</span>
            <span className="nums text-caption text-soft">{c.value || "—"}</span>
          </div>
          <ProgressBar value={c.value} />
        </li>
      ))}
    </ul>
  );
}

const cleanCohort = (c?: string) => (c && !["—", "-", ""].includes(c) ? c : "");
const uniq = (vals: string[]) => [...new Set(vals.filter(Boolean))].sort();

export default function Understanding() {
  const { admin } = useData();
  const { understandingKpis, understandingTrend, cohortHealth, teamHealth, needsAttention, people } = admin;
  const [view, setView] = useState<"group" | "individual">("group");
  const [selected, setSelected] = useState<Person | null>(null);
  const [q, setQ] = useState("");
  const [teamF, setTeamF] = useState("");
  const [cohortF, setCohortF] = useState("");
  const [roleF, setRoleF] = useState("");

  const teams = useMemo(() => uniq(people.map((p) => p.team || "")), [people]);
  const cohorts = useMemo(() => uniq(people.map((p) => cleanCohort(p.cohort))), [people]);

  const filtered = useMemo(
    () =>
      people
        .filter((p) => {
          const s = q.trim().toLowerCase();
          return !s || p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s);
        })
        .filter((p) => !teamF || (p.team || "") === teamF)
        .filter((p) => !cohortF || cleanCohort(p.cohort) === cohortF)
        .filter((p) => !roleF || p.role === roleF)
        .sort((a, b) => b.understanding - a.understanding),
    [people, q, teamF, cohortF, roleF],
  );

  const avg = understandingKpis[0]?.value ?? "0";
  const measured = people.filter((p) => (p.understanding ?? 0) > 0).length;
  const empty = understandingTrend.length === 0 && measured === 0;

  if (empty) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title="Understanding"
          subtitle="How well your workspace grasps the material — over time, by group, and by person."
        />
        <EmptyState
          icon={TrendingUp}
          title="No understanding data yet"
          body="Once your team completes a few sessions, trends, group breakdowns and who's falling behind show up here."
        />
      </div>
    );
  }

  const teamOpts = [{ value: "", label: "All teams" }, ...teams.map((t) => ({ value: t, label: t }))];
  const cohortOpts = [{ value: "", label: "All cohorts" }, ...cohorts.map((c) => ({ value: c, label: c }))];
  const roleOpts = [
    { value: "", label: "All roles" },
    { value: "Learner", label: "Learner" },
    { value: "Manager", label: "Manager" },
    { value: "Admin", label: "Admin" },
  ];

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        title="Understanding"
        subtitle="How well your workspace grasps the material — over time, by group, and by person."
      />

      {/* KPIs — real, workspace-scoped */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-4">
        {understandingKpis.map((k) => (
          <div key={k.label} className="bg-surface px-5 py-5">
            <p className="text-caption text-faint">{k.label}</p>
            <p className="nums mt-2 text-[34px] font-semibold leading-none tracking-tight text-ink">{k.value}</p>
            <p className="mt-2 text-caption text-faint">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Trend */}
      <Card className="p-6">
        <h3 className="text-title text-ink">Understanding over time</h3>
        <p className="mt-1 text-label text-soft">
          {avg} average <span className="text-faint">· measured only when a learner explains it in their own words</span>
        </p>
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={understandingTrend} margin={{ left: -28, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="u2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3c315b" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#3c315b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                cursor={{ stroke: "#e0dde9" }}
                contentStyle={{ background: "#ffffff", border: "1px solid #e0dde9", borderRadius: 10, fontSize: 12, color: "#3c315b" }}
              />
              <Area type="monotone" dataKey="v" stroke="#3c315b" strokeWidth={2} fill="url(#u2)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* View toggle: by group vs individual */}
      <div className="flex gap-2">
        {([
          ["group", "By group", Users],
          ["individual", "Individual", UserRound],
        ] as const).map(([v, label, Icon]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-label transition-colors",
              view === v ? "border-transparent bg-ink text-bg" : "border-border text-soft hover:border-soft hover:text-ink",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {view === "group" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-title text-ink">Understanding by cohort</h3>
            <GroupBars rows={cohortHealth} emptyHint="No cohorts yet — create one to compare groups." />
          </Card>
          <Card className="p-6">
            <h3 className="text-title text-ink">Understanding by team</h3>
            <GroupBars rows={teamHealth} emptyHint="No teams yet — create one to compare groups." />
          </Card>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          {/* Notion-style filter toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-hairline p-4">
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search people…"
                className="h-9 w-full rounded-md border border-border bg-[#3c315b]/[0.02] pl-9 pr-3 text-label text-ink outline-none focus:border-soft"
              />
            </div>
            <div className="w-40"><Dropdown value={teamF} onChange={setTeamF} options={teamOpts} /></div>
            <div className="w-40"><Dropdown value={cohortF} onChange={setCohortF} options={cohortOpts} /></div>
            <div className="w-36"><Dropdown value={roleF} onChange={setRoleF} options={roleOpts} /></div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-body-s text-faint">No people match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] border-collapse text-left">
                <thead>
                  <tr className="bg-[#3c315b]/[0.03] text-caption text-faint">
                    <th className="border-b border-hairline px-4 py-2.5 text-left font-medium">Person</th>
                    <th className="border-b border-l border-hairline px-4 py-2.5 text-left font-medium">Team</th>
                    <th className="border-b border-l border-hairline px-4 py-2.5 text-left font-medium">Cohort</th>
                    <th className="border-b border-l border-hairline px-4 py-2.5 text-left font-medium">Understanding</th>
                    <th className="border-b border-l border-hairline px-4 py-2.5 text-right font-medium">Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.email}
                      onClick={() => setSelected(p)}
                      className="cursor-pointer transition-colors hover:bg-[#3c315b]/[0.035]"
                    >
                      <td className="border-b border-hairline px-4 py-3">
                        <span className="flex items-center gap-3">
                          <Avatar name={p.name} size={30} />
                          <span className="min-w-0">
                            <span className="block truncate text-label text-ink">{p.name}</span>
                            <span className="block truncate text-caption text-faint">{p.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap border-b border-l border-hairline px-4 py-3 text-label text-soft">
                        {p.team || "—"}
                      </td>
                      <td className="whitespace-nowrap border-b border-l border-hairline px-4 py-3 text-label text-soft">
                        {cleanCohort(p.cohort) || "—"}
                      </td>
                      <td className="border-b border-l border-hairline px-4 py-3">
                        <span className="flex items-center gap-3">
                          <span className="w-28">
                            <ProgressBar value={p.understanding} />
                          </span>
                          <span className="nums text-label text-ink">{p.understanding}</span>
                        </span>
                      </td>
                      <td className="nums border-b border-l border-hairline px-4 py-3 text-right text-soft">
                        {p.documents}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Falling behind — always visible */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-title text-ink">Falling behind</h3>
          <span className="text-caption text-faint">below 55</span>
        </div>
        {needsAttention.length === 0 ? (
          <p className="text-body-s text-faint">No one is falling behind.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {needsAttention.map((p) => (
              <li key={p.name} className="flex items-center gap-3 py-3">
                <Avatar name={p.name} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-label text-ink">{p.name}</p>
                  <p className="truncate text-caption text-faint">{p.cohort}</p>
                </div>
                <span className="nums text-label text-soft">{p.score}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <PersonDrawer person={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
