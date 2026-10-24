import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { SessionConfig, TranscriptEntry } from "../types";
import { createAssistant, ApiClientError } from "../services/api";
import { requestMicrophone } from "../services/microphone";
import { VoiceSession } from "../services/vapiService";
import type { VoiceError } from "../services/voiceErrors";
import { applyTranscript, emptyTranscript, isTranscriptMessage, type TranscriptState } from "../utils/transcript";
import { useStopwatch } from "./useTimers";

/**
 * idle        nothing started
 * requesting  asking the browser for the microphone
 * connecting  microphone granted, joining the call
 * live        the call is really connected (only now does the UI claim a session is active)
 * ended       the call finished (by the user, the assistant, or a dropped connection)
 * error       could not start, or failed mid-call
 */
export type VoiceStatus = "idle" | "requesting" | "connecting" | "live" | "ended" | "error";
export type OrbState = "idle" | "connecting" | "listening" | "speaking" | "ended";

interface State {
  status: VoiceStatus;
  transcript: TranscriptState;
  error: VoiceError | null;
  assistantSpeaking: boolean;
  muted: boolean;
}

type Action =
  | { type: "status"; status: VoiceStatus }
  | { type: "message"; message: unknown }
  | { type: "error"; error: VoiceError }
  | { type: "speaking"; speaking: boolean }
  | { type: "muted"; muted: boolean }
  | { type: "reset" };

const initial: State = { status: "idle", transcript: emptyTranscript(), error: null, assistantSpeaking: false, muted: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "status":
      return { ...state, status: action.status, error: action.status === "error" ? state.error : null };
    case "message":
      return isTranscriptMessage(action.message)
        ? { ...state, transcript: applyTranscript(state.transcript, action.message) }
        : state;
    case "error":
      // An error after the call went live keeps the transcript so the learner can still get feedback.
      return { ...state, status: "error", error: action.error, assistantSpeaking: false };
    case "speaking":
      return { ...state, assistantSpeaking: action.speaking };
    case "muted":
      return { ...state, muted: action.muted };
    case "reset":
      return initial;
  }
}

export function useVoiceSession() {
  const [state, dispatch] = useReducer(reducer, initial);
  const sessionRef = useRef<VoiceSession | null>(null);
  const startingRef = useRef(false);
  const stoppedByUser = useRef(false);
  const [level, setLevel] = useState({ assistant: 0, you: 0 });
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const { elapsed, reset: resetClock } = useStopwatch(state.status === "live");

  const cleanup = useCallback(async () => {
    const s = sessionRef.current;
    sessionRef.current = null;
    await s?.stop();
  }, []);

  // Never leave a call open if the user navigates away.
  useEffect(() => () => void cleanup(), [cleanup]);

  const start = useCallback(
    async (config: SessionConfig) => {
      if (startingRef.current || sessionRef.current) return;
      startingRef.current = true;
      stoppedByUser.current = false;
      dispatch({ type: "reset" });
      resetClock();
      try {
        dispatch({ type: "status", status: "requesting" });
        const mic = await requestMicrophone();
        if (!mic.ok) {
          dispatch({
            type: "error",
            error: {
              kind: mic.kind === "denied" ? "permission" : mic.kind === "unsupported" || mic.kind === "insecure" ? "unsupported" : "unknown",
              title: mic.kind === "denied" ? "Microphone access was blocked" : "Microphone unavailable",
              message: mic.message,
            },
          });
          return;
        }

        dispatch({ type: "status", status: "connecting" });
        let creds;
        try {
          creds = await createAssistant(config);
        } catch (e) {
          const err = e as ApiClientError;
          dispatch({
            type: "error",
            error: {
              kind: err.code === "VAPI_NOT_CONFIGURED" ? "credentials" : "network",
              title: err.code === "VAPI_NOT_CONFIGURED" ? "Voice is not configured" : "Could not prepare the session",
              message: err.message,
            },
          });
          return;
        }

        try {
          sessionRef.current = await VoiceSession.start(creds.publicKey, creds.assistant, {
            onCallStart: () => {
              setStartedAt(new Date().toISOString());
              dispatch({ type: "status", status: "live" });
            },
            onCallEnd: () => {
              sessionRef.current = null;
              setLevel({ assistant: 0, you: 0 });
              dispatch({ type: "speaking", speaking: false });
              dispatch({ type: "status", status: "ended" });
            },
            onAssistantSpeaking: (speaking) => dispatch({ type: "speaking", speaking }),
            onVolume: (source, v) => setLevel((prev) => ({ ...prev, [source]: Math.min(1, Math.max(0, v)) })),
            onMessage: (message) => dispatch({ type: "message", message }),
            onError: (error) => {
              if (stoppedByUser.current) return; // errors emitted while hanging up are noise
              dispatch({ type: "error", error });
            },
          });
        } catch (e) {
          dispatch({ type: "error", error: e as VoiceError });
        }
      } finally {
        startingRef.current = false;
      }
    },
    [resetClock],
  );

  const stop = useCallback(async () => {
    stoppedByUser.current = true;
    await cleanup();
    setLevel({ assistant: 0, you: 0 });
    dispatch({ type: "speaking", speaking: false });
    dispatch({ type: "status", status: "ended" });
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    const next = !s.isMuted();
    s.setMuted(next);
    dispatch({ type: "muted", muted: next });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    setStartedAt(null);
    resetClock();
  }, [resetClock]);

  const orbState: OrbState =
    state.status === "requesting" || state.status === "connecting"
      ? "connecting"
      : state.status === "live"
        ? state.assistantSpeaking
          ? "speaking"
          : "listening"
        : state.status === "ended" || state.status === "error"
          ? "ended"
          : "idle";

  const orbLevel = state.status === "live" ? (state.assistantSpeaking ? level.assistant : state.muted ? 0 : level.you) : 0;

  const transcript: TranscriptEntry[] = state.transcript.entries;

  return {
    status: state.status,
    error: state.error,
    transcript,
    partial: state.transcript.partial,
    muted: state.muted,
    orbState,
    orbLevel,
    elapsedSeconds: elapsed,
    startedAt,
    start,
    stop,
    toggleMute,
    reset,
  };
}
