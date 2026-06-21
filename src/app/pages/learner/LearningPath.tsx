import { Link } from "react-router-dom";
import { Check, Circle, ChevronRight, Lock, Play, Route as RouteIcon, FileText } from "lucide-react";
import { PageHeader } from "@/ui/page";
import { Card } from "@/ui/Card";
import { ProgressBar, Badge } from "@/ui/data";
import { EmptyState } from "@/ui/EmptyState";
import { buttonVariants } from "@/ui/Button";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data";
import { type PathStatus } from "@/lib/mock";

const meta: Record<PathStatus, { label: string; icon: typeof Check; tone: "ink" | "outline" | "muted" }> = {
  mastered: { label: "Mastered", icon: Check, tone: "ink" },
  in_progress: { label: "In progress", icon: Circle, tone: "outline" },
  up_next: { label: "Up next", icon: ChevronRight, tone: "outline" },
  locked: { label: "Locked", icon: Lock, tone: "muted" },
};

export default function LearningPath() {
  const { learningPath } = useData();
  return (
    <div className="animate-fade-up">
      <PageHeader
        group="Learner"
        title="My learning path"
        subtitle="Your documents to master, in order. Each builds on the last."
      />
      {learningPath.length === 0 ? (
        <EmptyState
          icon={RouteIcon}
          title="No learning path yet"
          body="Add a document and Praxos orders it into a path of bite-sized modules to work through."
          action={
            <Link to="/app/documents" className={buttonVariants()}>
              <FileText className="size-4" /> Add a document
            </Link>
          }
        />
      ) : (
      <ol className="relative space-y-3 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-2rem)] before:w-px before:bg-hairline">
        {learningPath.map((item, i) => {
          const m = meta[item.status];
          const Icon = m.icon;
          const active = item.status === "in_progress";
          const startable = active || item.status === "up_next";
          return (
            <li key={item.title} className="relative">
              <Card
                className={cn(
                  "flex items-center gap-4 p-5",
                  item.status === "locked" && "opacity-55",
                  active && "border-border",
                )}
              >
                <span
                  className={cn(
                    "z-10 grid size-10 shrink-0 place-items-center rounded-full border",
                    item.status === "mastered"
                      ? "border-transparent bg-ink text-bg"
                      : "border-border bg-surface text-soft",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="min-w-0 flex-1 truncate text-title text-ink" title={item.title}>{item.title}</p>
                    <span className="shrink-0">
                      <Badge tone={m.tone}>{m.label}</Badge>
                    </span>
                  </div>
                  <p className="mt-0.5 text-caption text-faint">
                    {item.sections} sections · step {i + 1} of {learningPath.length}
                  </p>
                  {active && item.progress != null && (
                    <div className="mt-3 max-w-md">
                      <ProgressBar value={item.progress} />
                    </div>
                  )}
                </div>
                {startable && (
                  <Link
                    to={
                      item.docId
                        ? `/app/session?doc=${item.docId}&name=${encodeURIComponent(item.title)}`
                        : "/app/session"
                    }
                    className={buttonVariants({ size: "sm", className: "shrink-0" })}
                  >
                    <Play className="size-3.5" /> {active ? "Resume" : "Start"}
                  </Link>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
      )}
    </div>
  );
}
