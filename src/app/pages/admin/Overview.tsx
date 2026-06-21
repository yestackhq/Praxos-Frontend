import { useMemo, useState } from "react";
import { Search, Bell, Download } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Card } from "@/ui/Card";
import { Avatar, ProgressBar } from "@/ui/data";
import { Button } from "@/ui/Button";
import { useData } from "@/lib/data";

const RANGES = ["Weeks", "Months", "Quarters"] as const;
type Range = (typeof RANGES)[number];

/** Re-bucket raw session points (date + score) into the selected period, averaging. */
function bucketSeries(series: { date: string; score: number }[], mode: Range) {
  if (!series.length) return null;
  const keyOf = (d: string): string => {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const y = dt.getFullYear();
    if (mode === "Months") return `${y}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    if (mode === "Quarters") return `${y} Q${Math.floor(dt.getMonth() / 3) + 1}`;
    const offset = (dt.getDay() + 6) % 7; // Monday-anchored week
    const monday = new Date(dt);
    monday.setDate(dt.getDate() - offset);
    return `${monday.getMonth() + 1}/${monday.getDate()}`;
  };
  const groups = new Map<string, number[]>();
  for (const p of series) {
    const k = keyOf(p.date);
    const arr = groups.get(k) ?? [];
    arr.push(p.score);
    groups.set(k, arr);
  }
  return [...groups.entries()].map(([m, arr]) => ({ m, v: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) }));
}

export default function AdminOverview() {
  const { admin } = useData();
  const { kpis: adminKpis, understandingTrend, understandingSeries, cohortHealth, needsAttention, recentActivity } = admin;
  const [range, setRange] = useState(1); // default: Months
  const mode: Range = RANGES[range] ?? "Months";
  const chartData = useMemo(
    () => bucketSeries(understandingSeries, mode) ?? understandingTrend,
    [understandingSeries, mode, understandingTrend],
  );
  const avg = chartData.length ? Math.round(chartData.reduce((a, c) => a + c.v, 0) / chartData.length) : 0;
  return (
    <div className="animate-fade-up space-y-7">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Overview</h1>
          <p className="mt-1.5 text-body text-soft">
            Tuesday, 18 June. Here is how onboarding is tracking across the company.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-56 items-center gap-2 rounded-md border border-border px-3 text-soft">
            <Search className="size-4" />
            <input
              placeholder="Search"
              className="w-full bg-transparent text-label text-ink outline-none placeholder:text-faint"
            />
          </div>
          <Button variant="secondary" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <Button variant="secondary">
            <Download className="size-4" /> Export
          </Button>
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-5">
        {adminKpis.map((k) => (
          <div key={k.label} className="bg-surface px-5 py-5">
            <p className="text-caption text-faint">{k.label}</p>
            <p className="nums mt-2 text-[34px] font-semibold leading-none tracking-tight text-ink">
              {k.value}
            </p>
            <p className="mt-2 text-caption text-faint">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Trend chart */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-title text-ink">Understanding over time</h3>
              <p className="mt-1 text-label text-soft">
                {chartData.length ? (
                  <>
                    {avg} average{" "}
                    <span className="text-faint">· grouped by {mode.toLowerCase().slice(0, -1)}</span>
                  </>
                ) : (
                  <span className="text-faint">No sessions recorded yet</span>
                )}
              </p>
            </div>
            <div className="flex rounded-md border border-border p-0.5 text-caption">
              {RANGES.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setRange(i)}
                  className={
                    i === range ? "rounded bg-[#3c315b]/10 px-2.5 py-1 text-ink" : "px-2.5 py-1 text-faint"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-56">
            {chartData.length === 0 ? (
              <div className="grid h-full place-items-center text-body-s text-faint">
                Understanding trends appear as your team completes sessions.
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -28, right: 4, top: 4 }}>
                <defs>
                  <linearGradient id="u" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3c315b" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#3c315b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip
                  cursor={{ stroke: "#e0dde9" }}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e0dde9",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#3c315b",
                  }}
                />
                <Area type="monotone" dataKey="v" stroke="#3c315b" strokeWidth={2} fill="url(#u)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Cohort health */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-title text-ink">Cohort health</h3>
            <span className="text-caption text-faint">{cohortHealth.length} active</span>
          </div>
          {cohortHealth.length === 0 && (
            <p className="mt-5 text-body-s text-faint">No cohorts yet. Group learners to track them here.</p>
          )}
          <ul className="mt-5 space-y-5">
            {cohortHealth.map((c) => (
              <li key={c.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-label text-ink">{c.name}</span>
                  <span className="nums text-caption text-soft">
                    {c.value} · {c.pct}%
                  </span>
                </div>
                <ProgressBar value={c.pct} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Needs attention */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-title text-ink">Needs attention</h3>
            <button className="text-caption text-soft hover:text-ink">View all</button>
          </div>
          {needsAttention.length === 0 && (
            <p className="py-3 text-body-s text-faint">Everyone is on track. No one needs a nudge.</p>
          )}
          <ul className="divide-y divide-hairline">
            {needsAttention.map((p) => (
              <li key={p.name} className="flex items-center gap-3 py-3">
                <Avatar name={p.name} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-label text-ink">{p.name}</p>
                  <p className="truncate text-caption text-faint">{p.cohort}</p>
                </div>
                <span className="nums text-label text-soft">{p.score}</span>
                <Button variant="secondary" size="sm">
                  Nudge
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recent activity */}
        <Card className="p-6">
          <h3 className="mb-4 text-title text-ink">Recent activity</h3>
          {recentActivity.length === 0 && (
            <p className="text-body-s text-faint">Activity from your workspace will show up here.</p>
          )}
          <ul className="space-y-4">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-soft" />
                <p className="flex-1 text-body-s text-soft">
                  <span className="text-ink">{a.who}</span> {a.what}
                </p>
                <span className="text-caption text-faint">{a.when}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
