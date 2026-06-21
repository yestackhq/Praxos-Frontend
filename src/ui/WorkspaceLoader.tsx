import { useEffect, useState } from "react";
import { Logo } from "@/ui/Logo";

/** Learning-flavoured loading lines, shown one at a time while the workspace
 * loads — so a slow (cold) backend feels intentional, not stuck. */
const QUOTES = [
  "Have you learnt your lesson?",
  "Measuring what actually stuck…",
  "Dusting off your last session…",
  "Counting the things you nodded at…",
  "Turning the pages so you don't have to…",
  "Asking your brain for a status update…",
  "Separating 'learnt' from 'seemed familiar'…",
  "Checking who actually did the reading…",
  "Warming up a few good questions…",
  "Loading wisdom — hold tight…",
];

export function WorkspaceLoader({ label = "Opening your workspace…" }: { label?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % QUOTES.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="animate-blur-in flex h-screen flex-col items-center justify-center gap-6 bg-bg text-ink">
      {/* Slow ring spinner around the mark. */}
      <div className="relative grid size-14 place-items-center">
        <span className="absolute inset-0 animate-spin-soft rounded-full border-2 border-hairline border-t-ink" />
        <Logo showWord={false} size={22} />
      </div>
      {/* Rotating quote — re-keyed so each line blur-fades in (no hard swap). */}
      <div className="flex h-6 items-center px-6 text-center">
        <p key={i} className="animate-blur-in text-label text-soft">
          {QUOTES[i]}
        </p>
      </div>
      <p className="text-caption text-faint">{label}</p>
    </div>
  );
}
