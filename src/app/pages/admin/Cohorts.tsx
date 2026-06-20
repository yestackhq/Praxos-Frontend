import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { PageHeader, Table, Th, Td } from "@/ui/page";
import { Card } from "@/ui/Card";
import { ProgressBar } from "@/ui/data";
import { EmptyState } from "@/ui/EmptyState";
import { buttonVariants } from "@/ui/Button";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data";
import { cohortTabs, cohortDetail as d } from "@/lib/mock";

export default function Cohorts() {
  const { admin } = useData();
  const [active, setActive] = useState(0);
  const stands = [
    { name: "Mastered", value: d.stands.mastered, fill: "#3c315b" },
    { name: "In progress", value: d.stands.inProgress, fill: "#71717a" },
    { name: "Not started", value: d.stands.notStarted, fill: "#e0dde9" },
  ];

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        title="Cohorts"
        subtitle="Compare how each group is progressing and find the topics they share."
        action={
          <Link to="/admin/cohorts/new" className={buttonVariants({ variant: "secondary" })}>
            <Plus className="size-4" /> New cohort
          </Link>
        }
      />

      {admin.cohorts.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No cohorts yet"
          body="Group learners into cohorts (new hires, a team, a compliance round) to compare how each is progressing."
          action={
            <Link to="/admin/cohorts/new" className={buttonVariants({ variant: "secondary" })}>
              <Plus className="size-4" /> New cohort
            </Link>
          }
        />
      ) : (
      <>
      {/* Tabs */}
      <div className="-mt-2 flex flex-wrap gap-2">
        {cohortTabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-label transition-colors",
              i === active
                ? "border-transparent bg-ink text-bg"
                : "border-border text-soft hover:border-soft hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-5">
        {d.kpis.map((k) => (
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
        <Card className="p-6">
          <h3 className="text-title text-ink">Completion over time</h3>
          <p className="mt-1 text-label text-soft">
            58% complete <span className="text-faint">· +22 since kickoff</span>
          </p>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.completionTrend} margin={{ left: -28, right: 4, top: 4 }}>
                <defs>
                  <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3c315b" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#3c315b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis domain={[20, 70]} tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip
                  cursor={{ stroke: "#e0dde9" }}
                  contentStyle={{ background: "#ffffff", border: "1px solid #e0dde9", borderRadius: 10, fontSize: 12, color: "#3c315b" }}
                />
                <Area type="monotone" dataKey="v" stroke="#3c315b" strokeWidth={2} fill="url(#c)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-title text-ink">Where the cohort stands</h3>
          <div className="relative mx-auto mt-4 h-40 w-40">
            <PieChart width={160} height={160}>
              <Pie
                data={stands}
                dataKey="value"
                cx={76}
                cy={76}
                innerRadius={52}
                outerRadius={74}
                paddingAngle={3}
                stroke="none"
                isAnimationActive={false}
              >
                {stands.map((s) => (
                  <Cell key={s.name} fill={s.fill} />
                ))}
              </Pie>
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="nums text-[30px] font-semibold leading-none text-ink">{d.stands.total}</span>
              <span className="text-caption text-faint">assignments</span>
            </div>
          </div>
          <ul className="mt-5 space-y-2.5">
            {stands.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-label">
                <span className="size-2 rounded-full" style={{ background: s.fill }} />
                <span className="flex-1 text-soft">{s.name}</span>
                <span className="nums text-ink">{s.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-title text-ink">Documents in this path</h3>
          <span className="text-caption text-faint">How {cohortTabs[active]} is doing on each one</span>
        </div>
        <Table
          head={
            <>
              <Th>Document</Th>
              <Th className="w-2/5">Avg understanding</Th>
              <Th>Completion</Th>
              <Th className="text-right">Mastered</Th>
            </>
          }
        >
          {d.pathDocs.map((doc) => (
            <tr key={doc.name} className="transition-colors hover:bg-[#3c315b]/[0.02]">
              <Td className="text-ink">{doc.name}</Td>
              <Td>
                <span className="flex items-center gap-3">
                  <span className="w-40">
                    <ProgressBar value={doc.avg} />
                  </span>
                  <span className="nums text-label text-ink">{doc.avg}</span>
                </span>
              </Td>
              <Td className="nums">{doc.completion}%</Td>
              <Td className="nums text-right">{doc.mastered}</Td>
            </tr>
          ))}
        </Table>
      </Card>
      </>
      )}
    </div>
  );
}
