import { Logo } from "@/ui/Logo";
import { Ghost } from "@/app/marketing/Ghost";

/** Split-screen auth layout: form on the left, aubergine ghost panel on the right. */
export function AuthShell({
  children,
  headline,
  blurb,
}: {
  children: React.ReactNode;
  headline: string;
  blurb: string;
}) {
  return (
    <div className="grid min-h-screen bg-bg text-ink lg:grid-cols-2">
      <div className="flex flex-col px-8 py-8 sm:px-16">
        <Logo to="/" className="text-ink" />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden lg:flex" style={{ background: "#3c315b" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 45% at 50% 38%, rgba(171,159,242,0.35), transparent 70%)" }}
        />
        <div className="relative flex flex-col items-center px-12 text-center">
          <Ghost interactive className="size-28 drop-shadow-[0_12px_40px_rgba(171,159,242,0.4)]" eye="#3c315b" fill="#cabfff" />
          <h2 className="mt-12 max-w-sm text-[clamp(1.8rem,2.6vw,2.4rem)] font-light leading-[1.1] tracking-[-0.03em] text-white">
            {headline}
          </h2>
          <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-[#cabfe0]">{blurb}</p>
        </div>
      </div>
    </div>
  );
}

export const authInput =
  "h-11 w-full rounded-md border border-border bg-[#3c315b]/[0.02] px-3.5 text-label text-ink outline-none transition-colors focus:border-soft placeholder:text-faint";

export function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption text-faint">{label}</span>
      {children}
    </label>
  );
}
