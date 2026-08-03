import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  ConnectionState,
  RemoteAudioTrack,
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";
import { apiPost } from "@/lib/apiClient";
import { setSessionActive } from "@/lib/ClerkData";
import { clerkEnabled } from "@/app/auth/clerkEnabled";

export type SessionPhase = "idle" | "connecting" | "live" | "scoring" | "ended" | "error";
/** Drives the orb's animation: thinking (connecting), listening (learner's turn),
 * talking (tutor speaking), or null (idle). */
export type AgentState = null | "thinking" | "listening" | "talking";
export type Turn = { role: "tutor" | "learner"; text: string };

/** One spoken word with the timings Cartesia produced for it, relative to the
 * start of the tutor's current line. */
export type CaptionWord = { text: string; start?: number; end?: number };

export interface ScoreResult {
  score: number | null;
  scoreable: boolean;
  /** False when the assessor could not be reached — the sitting is stored with
   * its transcript and will be graded later. Distinct from `scoreable`, which
   * means the learner did not say enough to judge. */
  graded?: boolean;
  understanding: number | null;
  band: string;
  summary: string;
  topics: { name: string; score: number; evidence?: string }[];
  strengths: string[];
  gaps: string[];
  completion: number;
  courseComplete: boolean;
}

interface StartResponse {
  document: { id: number; name: string };
  livekitUrl: string;
  room: string;
  token: string;
  moduleIdx: number;
  moduleTitle: string | null;
  totalModules: number;
  isLast: boolean;
  resumed: boolean;
}

/** Messages the agent worker publishes on the "praxos" data topic. */
type AgentMessage =
  | { type: "caption"; seq: number; first: boolean; word: { t: string; s?: number; e?: number } }
  | { type: "section_ready"; moduleIdx: number; isLast: boolean }
  | { type: "section_changed"; moduleIdx: number; moduleTitle: string | null; isLast: boolean }
  | { type: "advance_failed"; moduleIdx: number }
  | { type: "course_complete"; moduleIdx: number }
  | { type: "agent_state"; state: string }
  | { type: "learner_partial"; text: string }
  | { type: "error"; message: string };

/**
 * Drives a live voice teaching session over LiveKit.
 *
 * The browser only ever holds a short-lived room token; Deepgram (speech-in),
 * the model, and Cartesia (speech-out) all run in the agent worker, so no
 * provider key reaches the client. Captions arrive with per-word timings from
 * Cartesia, which is what keeps the subtitle highlight on the word actually
 * being spoken.
 */
/** How long to wait for the agent to confirm a section change before handing
 * control back to the learner. */
const ADVANCE_TIMEOUT_MS = 10_000;

export function useVoiceSession(documentId: number | null, restart = false) {
  const { getToken } = useAuth();
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [agentState, setAgentState] = useState<AgentState>(null);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [caption, setCaption] = useState<CaptionWord[]>([]);
  const [spokenWords, setSpokenWords] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The tutor called `mark_section_understood` → the UI reveals Next section.
  const [ready, setReady] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [isLast, setIsLast] = useState(true);
  // Set when an advance did not land, so the UI can offer the button again
  // instead of sitting on the previous section forever.
  const [advanceError, setAdvanceError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const transcriptRef = useRef<Turn[]>([]);
  const sectionStartRef = useRef(0); // transcript index where the current section began
  const moduleIdxRef = useRef(0);
  const advanceTimerRef = useRef<number | null>(null);

  // Caption timing.
  const captionRef = useRef<CaptionWord[]>([]);
  const captionSeqRef = useRef(-1);
  const speechStartRef = useRef<number | null>(null); // audio-clock origin for this line

  // Live audio level, read by the orb every frame.
  const outputVolumeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const clearAdvanceWatchdog = useCallback(() => {
    if (advanceTimerRef.current != null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const push = useCallback((turn: Turn) => {
    transcriptRef.current = [...transcriptRef.current, turn];
    setTranscript(transcriptRef.current);
  }, []);

  /** Per frame: read the tutor's output level (→ orb) and move the caption
   * highlight to whichever word Cartesia says is sounding right now. */
  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (analyser) {
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = buf[i] ?? 0;
        sum += v * v;
      }
      const vol = Math.min(1, Math.sqrt(sum / buf.length) / 90);
      outputVolumeRef.current = vol;

      const words = captionRef.current;
      if (words.length) {
        // Start the clock on the first audible frame of the line, so the
        // highlight is anchored to the audio the learner is hearing rather than
        // to when the text arrived over the network.
        if (speechStartRef.current == null && vol > 0.06) {
          speechStartRef.current = performance.now();
        }
        if (speechStartRef.current != null) {
          const elapsed = (performance.now() - speechStartRef.current) / 1000;
          let idx = 0;
          for (let i = 0; i < words.length; i++) {
            const s = words[i]?.start;
            if (s == null || s <= elapsed) idx = i;
            else break;
          }
          setSpokenWords((prev) => (idx > prev ? idx : prev));
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const attachMeter = useCallback(
    (track: RemoteAudioTrack) => {
      try {
        const stream = new MediaStream([track.mediaStreamTrack]);
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = audioCtxRef.current ?? new Ctx();
        audioCtxRef.current = ctx;
        void ctx.resume();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;
        ctx.createMediaStreamSource(stream).connect(analyser);
        analyserRef.current = analyser;
        if (rafRef.current == null) tick();
      } catch {
        /* metering is best-effort — the session works without the orb reacting */
      }
    },
    [tick],
  );

  const teardown = useCallback(() => {
    setSessionActive(false);
    void roomRef.current?.disconnect();
    roomRef.current = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    outputVolumeRef.current = 0;
  }, []);

  useEffect(() => teardown, [teardown]);

  const handleMessage = useCallback(
    (msg: AgentMessage) => {
      switch (msg.type) {
        case "caption": {
          if (msg.seq !== captionSeqRef.current) {
            // A new tutor line — reset the highlight and the audio clock.
            captionSeqRef.current = msg.seq;
            captionRef.current = [];
            speechStartRef.current = null;
            setSpokenWords(0);
          }
          const word: CaptionWord = { text: msg.word.t, start: msg.word.s, end: msg.word.e };
          captionRef.current = [...captionRef.current, word];
          setCaption(captionRef.current);
          setAgentState("talking");
          break;
        }
        case "section_ready":
          setReady(true);
          setIsLast(msg.isLast);
          break;
        case "advance_failed":
          // The agent could not load the next section. Put the learner back in
          // control rather than leaving them on a section that looks finished.
          clearAdvanceWatchdog();
          setReady(true);
          setAgentState("listening");
          setAdvanceError("Could not load the next section. Tap to try again.");
          break;
        case "course_complete":
          clearAdvanceWatchdog();
          setIsLast(true);
          setReady(true);
          setAgentState("listening");
          break;
        case "section_changed":
          clearAdvanceWatchdog();
          setAdvanceError(null);
          moduleIdxRef.current = msg.moduleIdx;
          setSectionIdx(msg.moduleIdx);
          setIsLast(msg.isLast);
          setReady(false);
          sectionStartRef.current = transcriptRef.current.length;
          captionRef.current = [];
          setCaption([]);
          setSpokenWords(0);
          setAgentState("thinking");
          break;
        case "agent_state": {
          const s = msg.state;
          setAgentState(
            s === "speaking" ? "talking" : s === "thinking" ? "thinking" : "listening",
          );
          break;
        }
        case "error":
          setError(msg.message);
          setPhase("error");
          break;
        default:
          break;
      }
    },
    [clearAdvanceWatchdog],
  );

  const start = useCallback(async () => {
    if (!documentId || !clerkEnabled) {
      setError("Sign in and open a document to start a session.");
      setPhase("error");
      return;
    }
    setPhase("connecting");
    setAgentState("thinking");
    setError(null);
    setSessionActive(true);
    try {
      const token = await getToken();
      const data = await apiPost<StartResponse>(
        "/api/sessions/start",
        { documentId, restart },
        token,
      );
      moduleIdxRef.current = data.moduleIdx ?? 0;
      sectionStartRef.current = 0;
      transcriptRef.current = [];
      setTranscript([]);
      setSectionIdx(data.moduleIdx ?? 0);
      setTotalModules(data.totalModules ?? 0);
      setIsLast(data.isLast ?? true);
      setReady(false);

      const room = new Room({ adaptiveStream: false, dynacast: false });
      roomRef.current = room;

      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, _p: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            // attach() gives us the <audio> element that actually plays the tutor.
            track.attach();
            attachMeter(track as RemoteAudioTrack);
          }
        },
      );

      room.on(RoomEvent.DataReceived, (payload: Uint8Array, _p, _kind, topic?: string) => {
        if (topic && topic !== "praxos") return;
        try {
          handleMessage(JSON.parse(new TextDecoder().decode(payload)) as AgentMessage);
        } catch {
          /* ignore malformed frames */
        }
      });

      // Final transcripts for both sides come through LiveKit's transcription
      // stream, so the sidebar and the graded transcript are the same text the
      // agent saw.
      room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
        const fromLearner = participant?.identity === room.localParticipant.identity;
        for (const seg of segments) {
          if (!seg.final || !seg.text.trim()) continue;
          push({ role: fromLearner ? "learner" : "tutor", text: seg.text.trim() });
        }
      });

      room.on(RoomEvent.Disconnected, () => setAgentState(null));

      await room.connect(data.livekitUrl, data.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setPhase("live");
      setAgentState("thinking");
    } catch (err) {
      teardown();
      setError(err instanceof Error ? err.message : "Could not start the session.");
      setPhase("error");
      setAgentState(null);
    }
  }, [documentId, restart, getToken, teardown, attachMeter, handleMessage, push]);

  const publish = useCallback((msg: Record<string, unknown>) => {
    const room = roomRef.current;
    if (!room || room.state !== ConnectionState.Connected) return;
    void room.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(msg)),
      { reliable: true, topic: "praxos" },
    );
  }, []);

  /** "Next section" — score the section being left and tell the agent to move on
   * in place, so the tutor keeps its context instead of restarting. */
  const advanceSection = useCallback(async () => {
    if (!documentId) return;
    const done = transcriptRef.current.slice(sectionStartRef.current);
    if (done.length) {
      const token = await getToken();
      void apiPost(
        "/api/sessions/score",
        { documentId, moduleIdx: moduleIdxRef.current, transcript: done },
        token,
      ).catch(() => {});
    }
    publish({ type: "advance", moduleIdx: moduleIdxRef.current + 1 });
    setReady(false);
    setAdvanceError(null);
    setAgentState("thinking");

    // The agent confirms with `section_changed`. If that never arrives — a
    // dropped data message, a worker restart mid-swap — restore the button
    // rather than leaving the learner stuck on a section they have finished.
    clearAdvanceWatchdog();
    advanceTimerRef.current = window.setTimeout(() => {
      advanceTimerRef.current = null;
      setReady(true);
      setAgentState("listening");
      setAdvanceError("The next section did not load. Tap to try again.");
    }, ADVANCE_TIMEOUT_MS);
  }, [documentId, getToken, publish, clearAdvanceWatchdog]);

  const end = useCallback(async (): Promise<ScoreResult | null> => {
    clearAdvanceWatchdog();
    // Tell the worker the browser is grading this section, so its
    // disconnect safety net does not grade the same turns a second time.
    publish({ type: "ending" });
    teardown();
    setAgentState(null);
    setReady(false);
    const turns = transcriptRef.current.slice(sectionStartRef.current);
    if (!documentId || turns.length === 0) {
      setPhase("ended");
      return null;
    }
    setPhase("scoring");
    try {
      const token = await getToken();
      const r = await apiPost<ScoreResult>(
        "/api/sessions/score",
        { documentId, moduleIdx: moduleIdxRef.current, transcript: turns },
        token,
      );
      setResult(r);
      setPhase("ended");
      return r;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not score the session.");
      setPhase("error");
      return null;
    }
  }, [documentId, getToken, teardown, publish, clearAdvanceWatchdog]);

  return {
    phase,
    agentState,
    transcript,
    caption,
    spokenWords,
    result,
    error,
    start,
    end,
    advanceSection,
    ready,
    sectionIdx,
    totalModules,
    isLast,
    advanceError,
    outputVolumeRef,
  };
}
