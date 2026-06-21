import { Link } from "react-router-dom";
import { Play, Check, Circle, ChevronRight, Lock, Flame, FileText, Sparkles } from "lucide-react";
import { Card } from "@/ui/Card";
import { Badge, ProgressBar, Orb } from "@/ui/data";
import { EmptyState } from "@/ui/EmptyState";
import { buttonVariants } from "@/ui/Button";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data";
import { type PathStatus } from "@/lib/mock";

const statusMeta: Record<PathStatus, { label: string; icon: typeof Check; cls: string }> = {
  mastered: { label: "Mastered", icon: Check, cls: "text-ink" },
  in_progress: { label: "In progress", icon: Circle, cls: "text-ink" },
  up_next: { label: "Up next", icon: ChevronRight, cls: "text-soft" },
  locked: { label: "Locked", icon: Lock, cls: "text-faint" },
};

export default function LearnerHome() {
  const { learner, continueLearning, learningPath } = useData();
  const masteredCount = learningPath.filter((p) => p.status === "mastered").length;
  const fresh = !continueLearning && learningPath.length === 0;

  return (
    <div className="animate-fade-up space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Good morning, {learner.firstName}</h1>
          <p className="mt-1.5 text-body text-soft">
            {continueLearning
              ? `You're ${continueLearning.understanding}% of the way through — pick up where you left off.`
              : "Welcome to Praxos. Add a document to start your first learning session."}
          </p>
        </div>
        {learner.streak > 0 && (
          <Badge tone="outline" className="mt-1">
            <Flame className="size-3.5" /> {learner.streak}-day streak
          </Badge>
        )}
      </header>

      {/* Continue learning hero, or onboarding for a fresh workspace */}
      {continueLearning ? (
        <Card className="relative overflow-hidden p-7">
          <div className="relative z-10 max-w-xl">
            <p className="eyebrow">Continue learning</p>
            <h2 className="mt-3 truncate text-h3 text-ink" title={continueLearning.doc}>{continueLearning.doc}</h2>
            <p className="mt-2 max-w-md text-body-s text-soft">
              {continueLearning.position}. {continueLearning.remaining}
            </p>
            <div className="mt-6 max-w-lg">
              <div className="mb-2 flex items-center justify-between text-caption text-faint">
                <span>Understanding</span>
                <span className="nums text-soft">{continueLearning.understanding} / 100</span>
              </div>
              <ProgressBar value={continueLearning.understanding} />
            </div>
            <Link
              to={
                continueLearning.docId
                  ? `/app/session?doc=${continueLearning.docId}&name=${encodeURIComponent(continueLearning.doc)}`
                  : "/app/session"
              }
              className={buttonVariants({ className: "mt-6" })}
            >
              <Play className="size-4" /> Resume session
            </Link>
          </div>
          {/* Decorative — only on wide screens where it won't sit under the text. */}
          <Orb size={260} className="absolute -right-6 top-1/2 hidden -translate-y-1/2 opacity-90 xl:block" />
        </Card>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="Start with your first document"
          body="Upload a policy or guide and Praxos turns it into a guided, spoken course you can complete in minutes."
          action={
            <Link to="/app/documents" className={buttonVariants()}>
              <FileText className="size-4" /> Add a document
            </Link>
          }
        />
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-hairline py-7 sm:grid-cols-4">
        {[
          { label: "Understanding", value: learner.understanding, hint: "across your work" },
          { label: "Path progress", value: learner.pathProgress, hint: "documents mastered" },
          { label: "Practised", value: learner.practisedThisWeek, hint: "this week" },
          { label: "Sessions", value: learner.sessions, hint: "all time" },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-caption text-faint">{s.label}</p>
            <p className="nums mt-1.5 text-[40px] font-semibold leading-none tracking-tight text-ink">
              {s.value}
            </p>
            <p className="mt-2 text-caption text-faint">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Learning path */}
      {!fresh && (
        <Card className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-title text-ink">Your learning path</h3>
            <span className="text-caption text-faint">
              {masteredCount} of {learningPath.length} mastered
            </span>
          </div>
          {learningPath.length === 0 ? (
            <p className="py-6 text-center text-body-s text-faint">
              Your path appears here once documents are assigned.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {learningPath.map((item) => {
                const m = statusMeta[item.status];
                const Icon = m.icon;
                return (
                  <li
                    key={item.title}
                    className={cn("flex items-center gap-4 py-4", item.status === "locked" && "opacity-50")}
                  >
                    <Icon className={cn("size-4 shrink-0", m.cls)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-label text-ink">{item.title}</p>
                      <p className="text-caption text-faint">{item.sections} sections</p>
                    </div>
                    {item.status === "in_progress" && item.progress != null && (
                      <div className="hidden w-40 sm:block">
                        <ProgressBar value={item.progress} />
                      </div>
                    )}
                    <span className="w-24 text-right text-caption text-soft">{m.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
