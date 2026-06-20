import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/ui/page";
import { Card } from "@/ui/Card";
import { Avatar, ProgressBar } from "@/ui/data";
import { Button } from "@/ui/Button";
import { EmptyState } from "@/ui/EmptyState";
import { useData } from "@/lib/data";

export default function Understanding() {
  const { admin } = useData();
  const { understandingTrend, cohortHealth, needsAttention, people } = admin;
  const measured = people.filter((p) => p.role === "Learner").length;
  const empty = understandingTrend.length === 0 && cohortHealth.length === 0;

  if (empty) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title="Understanding"
          subtitle="How well your team grasps the material, over time and by group."
        />
        <EmptyState
          icon={TrendingUp}
          title="No understanding data yet"
          body="Once your team completes a few sessions, you'll see trends, cohort breakdowns and who's falling behind here."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        title="Understanding"
        subtitle="How well your team grasps the material, over time and by group."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-4">
        {[
          { label: "Average understanding", value: "74", hint: "↗ +18 over 90 days" },
          { label: "Learners measured", value: String(measured || 128), hint: "across all cohorts" },
          { label: "Topics tracked", value: "18", hint: "from 6 documents" },
          { label: "Mastery rate", value: "61%", hint: "demonstrated, not guessed" },
        ].map((k) => (
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
          74 average <span className="text-faint">· measured only when a learner explains it in their own words</span>
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
              <YAxis domain={[40, 100]} tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                cursor={{ stroke: "#e0dde9" }}
                contentStyle={{ background: "#ffffff", border: "1px solid #e0dde9", borderRadius: 10, fontSize: 12, color: "#3c315b" }}
              />
              <Area type="monotone" dataKey="v" stroke="#3c315b" strokeWidth={2} fill="url(#u2)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By cohort */}
        <Card className="p-6">
          <h3 className="text-title text-ink">Understanding by cohort</h3>
          <ul className="mt-5 space-y-5">
            {cohortHealth.map((c) => (
              <li key={c.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-label text-ink">{c.name}</span>
                  <span className="nums text-caption text-soft">{c.value}</span>
                </div>
                <ProgressBar value={c.value} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Falling behind */}
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
                  <Button variant="secondary" size="sm">Nudge</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
