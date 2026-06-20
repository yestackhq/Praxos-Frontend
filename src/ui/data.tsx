import { cn } from "@/lib/utils";

/* ── Metric block ─────────────────────────────────────────── */
export function Stat({
  label,
  value,
  hint,
  size = "lg",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  size?: "lg" | "md";
}) {
  return (
    <div>
      <p className="text-caption text-faint">{label}</p>
      <p
        className={cn(
          "nums mt-1.5 font-semibold tracking-tight text-ink",
          size === "lg" ? "text-[44px] leading-none" : "text-[30px] leading-none",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-caption text-faint">{hint}</p>}
    </div>
  );
}

/* ── Progress bar ─────────────────────────────────────────── */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#3c315b]/8", className)}>
      <div
        className="h-full rounded-full bg-ink transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ── Badge / status pill ──────────────────────────────────── */
const toneMap = {
  default: "border-border text-soft",
  ink: "border-transparent bg-ink text-bg",
  outline: "border-border text-ink",
  muted: "border-transparent bg-[#3c315b]/6 text-soft",
} as const;

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-caption font-medium",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Avatar (initials) ────────────────────────────────────── */
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-[#3c315b]/5 font-medium text-soft"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </span>
  );
}

/* ── Understanding score ring ─────────────────────────────── */
export function ScoreRing({
  value,
  size = 120,
  label = "understanding",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = size * 0.05;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e0dde9" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#3c315b"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="nums font-semibold leading-none text-ink" style={{ fontSize: size * 0.3 }}>
          {Math.round(pct)}
        </span>
        <span className="mt-1 text-faint" style={{ fontSize: size * 0.08 }}>
          {label}
        </span>
      </div>
    </div>
  );
}

/* ── The Praxos orb (cloth-like sphere) ───────────────────── */
export function Orb({ size = 220, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full animate-spinslow"
        style={{
          background:
            "radial-gradient(38% 38% at 32% 28%, #f3effe 0%, #cdc0ff 30%, #ab9ff2 56%, #7d6ce0 80%, #564aa8 100%)",
          boxShadow: "inset -16px -20px 50px rgba(60,49,91,0.45), inset 16px 14px 44px rgba(255,255,255,0.55)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full mix-blend-screen opacity-70"
        style={{
          background:
            "conic-gradient(from 210deg at 60% 40%, transparent, rgba(255,255,255,0.35), transparent 40%)",
        }}
      />
      <div
        className="absolute rounded-full blur-md"
        style={{
          width: size * 0.22,
          height: size * 0.16,
          left: size * 0.24,
          top: size * 0.2,
          background: "rgba(255,255,255,0.7)",
        }}
      />
    </div>
  );
}
