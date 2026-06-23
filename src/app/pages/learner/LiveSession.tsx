import { type RefObject, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mic, Sparkles } from "lucide-react";
import { Logo } from "@/ui/Logo";
import { VoiceOrb, type VoiceOrbState } from "@/ui/VoiceOrb";
import { Button, buttonVariants } from "@/ui/Button";
import { clerkEnabled } from "@/app/auth/clerkEnabled";
import { useVoiceSession, type SessionPhase, type AgentState, type Turn } from "@/lib/useVoiceSession";

/** Map the session phase + agent state onto the orb's visual state. */
function orbState(agentState: AgentState, phase: SessionPhase): VoiceOrbState {
  if (phase === "connecting") return "connecting";
  if (agentState === "talking") return "speaking";
  if (agentState === "thinking") return "connecting";
  if (agentState === "listening") return "listening";
  return "idle";
}

/** Karaoke caption: the whole tutor line stays on screen and the word currently
 * being SPOKEN (paced by the real audio, not the faster text stream) lights up —
 * already-spoken words dim, upcoming words faint. */
function KaraokeCaption({ text, spoken }: { text: string; spoken: number }) {
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-h3 leading-snug">
      {words.map((w, i) => (
        <span
          key={i}
          className={`transition-colors duration-150 ${
            i < spoken ? "text-soft" : i === spoken ? "text-ink" : "text-faint"
          }`}
        >
          {w}
        </span>
      ))}
    </p>
  );
}

/** Presentational session screen — no auth/WebRTC, so it's safe to render
 * whether or not Clerk is configured. */
function SessionShell({
  phase,
  agentState,
  docName,
  transcript,
  liveCaption,
  spokenWords,
  volumeRef,
  error,
  onStart,
  onEnd,
  onClose,
}: {
  phase: SessionPhase;
  agentState: AgentState;
  docName: string;
  transcript: Turn[];
  liveCaption: string;
  spokenWords: number;
  volumeRef?: RefObject<number>;
  error: string | null;
  onStart: () => void;
  onEnd: () => void;
  onClose: () => void;
}) {
  const demonstrated = transcript.filter((t) => t.role === "learner").length;
  return (
    <div className="flex h-screen flex-col bg-bg text-ink">
      <header className="flex items-center gap-3 border-b border-hairline px-4 py-3 sm:gap-4 sm:px-5">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-caption text-soft">
          <span className={`size-1.5 rounded-full ${phase === "live" ? "animate-pulse bg-ink" : "bg-faint"}`} />
          {phase === "live" ? "Live" : phase === "connecting" ? "Connecting" : phase === "scoring" ? "Scoring" : "Ready"}
        </span>
        <span className="flex min-w-0 items-center gap-2 text-label text-soft">
          <Logo showWord={false} size={18} /> <span className="truncate">{docName}</span>
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {phase === "live" && (
            <span className="hidden items-center gap-2 text-caption text-soft sm:flex">
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

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <section className="flex flex-col items-center justify-center px-5 py-8 text-center sm:px-8 lg:px-10 lg:py-0">
          {phase === "idle" && (
            <>
              <div className="mb-6 size-72 sm:size-96">
                <VoiceOrb state={orbState(agentState, phase)} variant="violet" className="size-full" />
              </div>
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
              <div className="mb-6 size-72 opacity-80 sm:size-96">
                <VoiceOrb state={orbState(agentState, phase)} variant="violet" className="size-full" />
              </div>
              <p className="flex items-center gap-2 text-title text-soft">
                <Loader2 className="size-4 animate-spin" /> Connecting your tutor…
              </p>
              <p className="mt-2 text-caption text-faint">Allow microphone access when prompted.</p>
            </>
          )}

          {(phase === "live" || phase === "scoring") && (
            <>
              <p className="text-caption text-faint">Now teaching · {docName}</p>
              <div className="my-6 size-[17rem] sm:size-[24rem] lg:size-[32rem]">
                <VoiceOrb
                  state={orbState(agentState, phase)}
                  variant="violet"
                  volumeRef={volumeRef}
                  className="size-full"
                />
              </div>
              <div className="flex min-h-[4.5em] max-w-2xl items-center justify-center">
                {liveCaption ? (
                  <KaraokeCaption text={liveCaption} spoken={spokenWords} />
                ) : (
                  <p className="text-h3 leading-snug text-faint">
                    {phase === "scoring" ? "Scoring your understanding…" : "Listening…"}
                  </p>
                )}
              </div>
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

        <aside className="hidden overflow-y-auto border-l border-hairline px-5 py-5 lg:block">
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
function LiveSessionInner({
  docId,
  docName,
  back,
  restart,
}: {
  docId: number | null;
  docName: string;
  back?: string;
  restart?: boolean;
}) {
  const navigate = useNavigate();
  const { phase, agentState, transcript, liveCaption, spokenWords, error, start, end, outputVolumeRef } =
    useVoiceSession(docId, restart);
  const onEnd = async () => {
    const result = await end();
    navigate("/app/summary", { state: { result, docName, back } });
  };
  return (
    <SessionShell
      phase={phase}
      agentState={agentState}
      docName={docName}
      transcript={transcript}
      liveCaption={liveCaption}
      spokenWords={spokenWords}
      volumeRef={outputVolumeRef}
      error={error}
      onStart={start}
      onEnd={onEnd}
      onClose={() => (back ? navigate(back) : navigate(-1))}
    />
  );
}

export default function LiveSession() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const rawName = params.get("name") || "your document";
  const docName = rawName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || rawName;
  const docId = params.get("doc") ? Number(params.get("doc")) : null;
  const back = params.get("back") || undefined;
  const restart = params.get("restart") === "1";
  const [demoError, setDemoError] = useState<string | null>(null);

  if (clerkEnabled) return <LiveSessionInner docId={docId} docName={docName} back={back} restart={restart} />;

  // Signed-out preview: no auth/WebRTC — show the idle screen; starting prompts sign-in.
  return (
    <SessionShell
      phase={demoError ? "error" : "idle"}
      agentState={null}
      docName={docName}
      transcript={[]}
      liveCaption=""
      spokenWords={0}
      error={demoError}
      onStart={() => setDemoError("Sign in to start a live teaching session.")}
      onEnd={() => {}}
      onClose={() => navigate(-1)}
    />
  );
}
