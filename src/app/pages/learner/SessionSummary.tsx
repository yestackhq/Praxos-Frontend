import { Link, Navigate, useLocation } from "react-router-dom";
import { Check, Circle } from "lucide-react";
import { Card } from "@/ui/Card";
import { ScoreRing } from "@/ui/data";
import { buttonVariants } from "@/ui/Button";
import type { ScoreResult } from "@/lib/useVoiceSession";

function headlineFor(score: number): string {
  if (score >= 85) return "Strong understanding";
  if (score >= 70) return "Solid grasp";
  if (score >= 50) return "Getting there";
  return "Worth another pass";
}

export default function SessionSummary() {
  const { state } = useLocation() as { state?: { result?: ScoreResult | null; docName?: string } };
  const result = state?.result ?? null;

  // Only ever show a REAL session result. If there's none (navigated here
  // directly, browser-back after a session, or a failed score) send the learner
  // to their real path — never fall back to demo/mock data.
  if (!result) return <Navigate to="/app" replace />;

  const docName = state?.docName || "your document";
  return (
    <div className="animate-fade-up mx-auto max-w-2xl py-6 text-center">
      <div className="flex justify-center">
        <ScoreRing value={result.score} size={132} />
      </div>
      <p className="eyebrow mt-7">Session complete · {docName}</p>
      <h1 className="mt-3 text-h2 text-ink">{headlineFor(result.score)}</h1>
      <p className="mx-auto mt-3 max-w-md text-body text-soft">
        {result.summary || "Here is how your understanding is tracking."}
      </p>

      {result.topics.length > 0 && (
        <Card className="mt-9 p-6 text-left">
          <h3 className="mb-1 text-title text-ink">Topic breakdown</h3>
          <ul className="divide-y divide-hairline">
            {result.topics.map((t) => {
              const ok = t.score >= 60;
              return (
                <li key={t.name} className="flex items-center gap-3 py-3.5">
                  {ok ? <Check className="size-4 text-ink" /> : <Circle className="size-4 text-faint" />}
                  <span className="flex-1 text-label text-ink">{t.name}</span>
                  <span className="nums text-caption text-soft">{t.score}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {(result.strengths.length > 0 || result.gaps.length > 0) && (
        <div className="mt-5 grid gap-3 text-left sm:grid-cols-2">
          {result.strengths.length > 0 && (
            <Card className="p-5">
              <p className="eyebrow">Strengths</p>
              <ul className="mt-2 space-y-1.5">
                {result.strengths.map((x, i) => (
                  <li key={i} className="text-body-s text-soft">
                    {x}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {result.gaps.length > 0 && (
            <Card className="p-5">
              <p className="eyebrow">Worth revisiting</p>
              <ul className="mt-2 space-y-1.5">
                {result.gaps.map((x, i) => (
                  <li key={i} className="text-body-s text-soft">
                    {x}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <div className="mt-7 flex justify-center gap-3">
        <Link to="/app" className={buttonVariants()}>
          Back to my path
        </Link>
      </div>
    </div>
  );
}
