import { useCallback, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { apiPost } from "@/lib/apiClient";
import { setSessionActive } from "@/lib/ClerkData";
import { clerkEnabled } from "@/app/auth/clerkEnabled";

export type SessionPhase = "idle" | "connecting" | "live" | "scoring" | "ended" | "error";
/** Drives the orb's animation: thinking (connecting), listening (learner's turn),
 * talking (tutor speaking), or null (idle). */
export type AgentState = null | "thinking" | "listening" | "talking";
export type Turn = { role: "tutor" | "learner"; text: string };

export interface ScoreResult {
  score: number;
  understanding: number;
  summary: string;
  topics: { name: string; score: number }[];
  strengths: string[];
  gaps: string[];
}

interface StartResponse {
  document: { id: number; name: string };
  clientSecret: string;
  expiresAt?: number;
}

// GA Realtime API: the browser POSTs its SDP offer here with the ephemeral token.
// Session config (model, voice, instructions) is baked into the token server-side.
const REALTIME_CALLS_URL = "https://api.openai.com/v1/realtime/calls";

/**
 * Drives a live voice teaching session over WebRTC straight to OpenAI Realtime.
 * The browser never sees the API key — the backend mints a short-lived ephemeral
 * token. Captures the running transcript, then scores it via the backend on end.
 */
export function useVoiceSession(documentId: number | null, restart = false) {
  const { getToken } = useAuth();
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [agentState, setAgentState] = useState<AgentState>(null);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [liveCaption, setLiveCaption] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tutorBuf = useRef("");
  const transcriptRef = useRef<Turn[]>([]);

  // Live audio analysis: the orb moves with the actual SPOKEN voice (not the
  // faster text stream), and the caption highlights words as they're heard.
  const outputVolumeRef = useRef(0);
  const [spokenWords, setSpokenWords] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const meterRafRef = useRef<number | null>(null);
  const spokenFloatRef = useRef(0);

  const push = useCallback((turn: Turn) => {
    transcriptRef.current = [...transcriptRef.current, turn];
    setTranscript(transcriptRef.current);
  }, []);

  // Per frame: read the tutor's voice level (→ orb) and, while the voice is
  // actually sounding, advance the karaoke highlight one word at a time.
  const tickMeter = useCallback(() => {
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
      if (vol > 0.06) {
        spokenFloatRef.current += 0.055; // ~3.3 words/sec at 60fps while speaking
        const w = Math.floor(spokenFloatRef.current);
        setSpokenWords((prev) => (w > prev ? w : prev));
      }
    }
    meterRafRef.current = requestAnimationFrame(tickMeter);
  }, []);

  const setupMeter = useCallback(
    (mediaStream: MediaStream) => {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = audioCtxRef.current ?? new Ctx();
        audioCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(mediaStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;
        src.connect(analyser);
        analyserRef.current = analyser;
        if (meterRafRef.current == null) tickMeter();
      } catch {
        /* audio metering is best-effort */
      }
    },
    [tickMeter],
  );

  const teardown = useCallback(() => {
    setSessionActive(false); // resume the workspace background-refetch
    streamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current = null;
    if (meterRafRef.current != null) {
      cancelAnimationFrame(meterRafRef.current);
      meterRafRef.current = null;
    }
    analyserRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    outputVolumeRef.current = 0;
  }, []);

  const start = useCallback(async () => {
    if (!documentId || !clerkEnabled) {
      setError("Sign in and open a document to start a session.");
      setPhase("error");
      return;
    }
    setPhase("connecting");
    setAgentState("thinking");
    setError(null);
    setSessionActive(true); // pause the workspace background-refetch for the session
    try {
      const token = await getToken();
      const data = await apiPost<StartResponse>("/api/sessions/start", { documentId, restart }, token);
      const ephemeral = data.clientSecret;
      if (!ephemeral) throw new Error("Could not start the voice session.");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Play the tutor's audio.
      const audio = audioRef.current ?? new Audio();
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (e) => {
        const remote = e.streams[0] ?? null;
        audio.srcObject = remote;
        if (remote) setupMeter(remote); // analyse the tutor's voice → orb + caption
      };

      // Send the mic.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      // Events channel — transcripts arrive here (config is baked into the token).
      const dc = pc.createDataChannel("oai-events");
      dc.onmessage = (e) => handleEvent(JSON.parse(e.data));
      // Make the tutor speak FIRST: trigger its opening turn as soon as the channel
      // opens, so it greets + starts teaching instead of waiting for the learner.
      dc.onopen = () => {
        try {
          dc.send(JSON.stringify({ type: "response.create" }));
        } catch {
          /* best-effort — the session still works if this drops */
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const resp = await fetch(REALTIME_CALLS_URL, {
        method: "POST",
        body: offer.sdp,
        headers: { Authorization: `Bearer ${ephemeral}`, "Content-Type": "application/sdp" },
      });
      if (!resp.ok) throw new Error("Voice connection was refused.");
      await pc.setRemoteDescription({ type: "answer", sdp: await resp.text() });
      setPhase("live");
      setAgentState("listening");
    } catch (err) {
      teardown();
      setError(err instanceof Error ? err.message : "Could not start the session.");
      setPhase("error");
      setAgentState(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, restart, getToken, teardown, setupMeter]);

  function handleEvent(evt: { type: string; transcript?: string; delta?: string }) {
    const t = evt.type;
    // Tutor speech transcript streams in (event name differs across API versions).
    if (t === "response.audio_transcript.delta" || t === "response.output_audio_transcript.delta") {
      if (tutorBuf.current === "") {
        // new tutor turn — restart the karaoke highlight at the first word
        spokenFloatRef.current = 0;
        setSpokenWords(0);
      }
      tutorBuf.current += evt.delta ?? "";
      setLiveCaption(tutorBuf.current);
      setAgentState("talking");
    } else if (t === "response.audio_transcript.done" || t === "response.output_audio_transcript.done") {
      if (tutorBuf.current.trim()) push({ role: "tutor", text: tutorBuf.current.trim() });
      tutorBuf.current = "";
      // Keep the caption on screen — the spoken audio lags the streamed
      // transcript, so clearing it here makes the text vanish while the tutor is
      // still talking. The next tutor turn's first delta replaces it.
      setAgentState("listening");
    } else if (t === "conversation.item.input_audio_transcription.completed") {
      // Learner's spoken answer, transcribed.
      if (evt.transcript?.trim()) push({ role: "learner", text: evt.transcript.trim() });
    }
  }

  const end = useCallback(async (): Promise<ScoreResult | null> => {
    teardown();
    setAgentState(null);
    const turns = transcriptRef.current;
    if (!documentId || turns.length === 0) {
      setPhase("ended");
      return null;
    }
    setPhase("scoring");
    try {
      const token = await getToken();
      const r = await apiPost<ScoreResult>("/api/sessions/score", { documentId, transcript: turns }, token);
      setResult(r);
      setPhase("ended");
      return r;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not score the session.");
      setPhase("error");
      return null;
    }
  }, [documentId, getToken, teardown]);

  return { phase, agentState, transcript, liveCaption, spokenWords, result, error, start, end, outputVolumeRef };
}
