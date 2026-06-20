import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Onboarding/empty placeholder for a fresh workspace with no data yet. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-xl border border-hairline text-soft">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-title text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body-s text-soft">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
