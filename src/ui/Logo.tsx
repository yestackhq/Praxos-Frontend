import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showWord?: boolean;
  className?: string;
  /** When set, the mark becomes a link (e.g. "/" to return to the homepage). */
  to?: string;
}

/** Praxos mark: a ring with a sweeping arc (echoes the understanding ring) + wordmark. */
export function Logo({ size = 24, showWord = true, className, to }: LogoProps) {
  const inner = (
    <>
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="none" stroke="#d8d3e4" strokeWidth="2.5" />
        <path
          d="M16 3 a13 13 0 0 1 11.3 19.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="3.5" fill="currentColor" />
      </svg>
      {showWord && <span className="text-[17px] font-medium tracking-tight">Praxos</span>}
    </>
  );
  const classes = cn("flex items-center gap-2.5 text-ink", className);
  if (to) {
    return (
      <Link to={to} className={cn(classes, "transition-opacity hover:opacity-80")} aria-label="Praxos home">
        {inner}
      </Link>
    );
  }
  return <div className={classes}>{inner}</div>;
}
