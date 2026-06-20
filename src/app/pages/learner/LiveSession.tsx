import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mic, Sparkles } from "lucide-react";
import { Logo } from "@/ui/Logo";
import { Orb } from "@/ui/data";
import { Button, buttonVariants } from "@/ui/Button";
import { clerkEnabled } from "@/app/auth/clerkEnabled";
import { useVoiceSession, type SessionPhase, type Turn } from "@/lib/useVoiceSession";

/** Presentational session screen — no auth/WebRTC, so it's safe to render
 * whether or not Clerk is configured. */
function SessionShell({
  phase,
  docName,
  transcript,
  liveCaption,
  error,
  onStart,
  onEnd,
  onClose,
}: {
  phase: SessionPhase;
  docName: string;
  transcript: Turn[];
  liveCaption: string;
  error: string | null;
  onStart: () => void;
  onEnd: () => void;
  onClose: () => void;
}) {
  const demonstrated = transcript.filter((t) => t.role === "learner").length;
  return (
    <div className="flex h-screen flex-col bg-bg text-ink">
      <header className="flex items-center gap-4 border-b border-hairline px-5 py-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-caption text-soft">
          <span className={`size-1.5 rounded-full ${phase === "live" ? "animate-pulse bg-ink" : "bg-faint"}`} />
          {phase === "live" ? "Live" : phase === "connecting" ? "Connecting" : phase === "scoring" ? "Scoring" : "Ready"}
        </span>
        <span className="flex items-center gap-2 text-label text-soft">
          <Logo showWord={false} size={18} /> {docName}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {phase === "live" && (
            <span className="flex items-center gap-2 text-caption text-soft">
              <Mic className="size-3.5" /> Mic on
            </span>
          )}
          {phase === "live" || phase === "scoring" ? (
            <Button size="sm" onClick={onEnd} disabled={phase === "scoring"}>
              {phase === "scoring" ? <Loader2 className="size-3.5 animate-spin" /> : null} End session
            </Button>
          ) : (
            <button onClick={onClose} className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Close
            </button>
          )}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px]">
        <section className="flex flex-col items-center justify-center px-10 text-center">
          {phase === "idle" && (
            <>
              <Orb size={220} className="mb-10" />
              <p className="text-h3 text-ink">Ready to learn {docName}?</p>
              <p className="mt-2 max-w-md text-body-s text-faint">
                Praxos will teach it out loud and ask you questions. Talk back naturally - it scores how well you
                understand as you go.
              </p>
              <Button className="mt-7" onClick={onStart}>
                <Sparkles className="size-4" /> Start session
              </Button>
            </>
          )}

          {phase === "connecting" && (
            <>
              <Orb size={220} className="mb-10 opacity-70" />
              <p className="flex items-center gap-2 text-title text-soft">
                <Loader2 className="size-4 animate-spin" /> Connecting your tutor…
              </p>
              <p className="mt-2 text-caption text-faint">Allow microphone access when prompted.</p>
            </>
          )}

          {(phase === "live" || phase === "scoring") && (
            <>
              <p className="text-caption text-faint">Now teaching · {docName}</p>
              <Orb size={260} className="my-10" />
              <p className="min-h-[3em] max-w-xl text-h3 leading-snug text-ink">
                {liveCaption || (phase === "scoring" ? "Scoring your understanding…" : "Listening…")}
              </p>
            </>
          )}

          {phase === "error" && (
            <div className="max-w-md">
              <p className="text-title text-ink">Could not start the session</p>
              <p className="mt-2 text-body-s text-soft">{error}</p>
              <Button className="mt-6" variant="secondary" onClick={onStart}>
                Try again
              </Button>
            </div>
          )}
        </section>

        <aside className="overflow-y-auto border-l border-hairline px-5 py-5">
          <div className="flex items-end gap-2">
            <span className="nums text-[44px] font-semibold leading-none text-ink">{demonstrated}</span>
            <span className="pb-1 text-label text-soft">answers given</span>
          </div>
          <p className="mt-3 text-caption text-faint">
            Your spoken answers are transcribed live and scored when you end the session.
          </p>
          <p className="eyebrow mt-6">Transcript</p>
          {transcript.length === 0 ? (
            <p className="mt-3 text-body-s text-faint">The conversation will appear here as you talk.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {transcript.map((line, i) => (
                <li key={i}>
                  <p className="text-caption text-faint">{line.role === "tutor" ? "Praxos" : "You"}</p>
                  <p className="text-body-s text-soft">{line.text}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

/** Live variant — uses Clerk auth + WebRTC. Only mounted when Clerk is enabled. */
function LiveSessionInner({ docId, docName }: { docId: number | null; docName: string }) {
  const navigate = useNavigate();
  const { phase, transcript, liveCaption, error, start, end } = useVoiceSession(docId);
  const onEnd = async () => {
    const result = await end();
    navigate("/app/summary", { state: { result, docName } });
  };
  return (
    <SessionShell
      phase={phase}
      docName={docName}
      transcript={transcript}
      liveCaption={liveCaption}
      error={error}
      onStart={start}
      onEnd={onEnd}
      onClose={() => navigate(-1)}
    />
  );
}

export default function LiveSession() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const docName = params.get("name") || "your document";
  const docId = params.get("doc") ? Number(params.get("doc")) : null;
  const [demoError, setDemoError] = useState<string | null>(null);

  if (clerkEnabled) return <LiveSessionInner docId={docId} docName={docName} />;

  // Signed-out preview: no auth/WebRTC — show the idle screen; starting prompts sign-in.
  return (
    <SessionShell
      phase={demoError ? "error" : "idle"}
      docName={docName}
      transcript={[]}
      liveCaption=""
      error={demoError}
      onStart={() => setDemoError("Sign in to start a live teaching session.")}
      onEnd={() => {}}
      onClose={() => navigate(-1)}
    />
  );
}
