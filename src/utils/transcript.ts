import type { TranscriptEntry } from "../types";

export interface VapiTranscriptMessage {
  type: "transcript";
  role: "assistant" | "user";
  transcriptType: "partial" | "final";
  transcript: string;
}

export interface TranscriptState {
  entries: TranscriptEntry[];
  partial: { role: TranscriptEntry["role"]; text: string } | null;
}

export const emptyTranscript = (): TranscriptState => ({ entries: [], partial: null });

export function isTranscriptMessage(msg: unknown): msg is VapiTranscriptMessage {
  if (!msg || typeof msg !== "object") return false;
  const m = msg as Record<string, unknown>;
  return (
    m.type === "transcript" &&
    (m.role === "assistant" || m.role === "user") &&
    (m.transcriptType === "partial" || m.transcriptType === "final") &&
    typeof m.transcript === "string"
  );
}

/**
 * Fold a Vapi transcript message into transcript state.
 * Partial messages only update the live "typing" line; final messages are committed,
 * and consecutive finals from the same speaker are merged into one turn.
 */
export function applyTranscript(state: TranscriptState, msg: VapiTranscriptMessage): TranscriptState {
  const role: TranscriptEntry["role"] = msg.role === "assistant" ? "coach" : "learner";
  const text = msg.transcript.trim();

  if (msg.transcriptType === "partial") {
    return { ...state, partial: text ? { role, text } : null };
  }
  if (!text) return { ...state, partial: null };

  const last = state.entries[state.entries.length - 1];
  if (last && last.role === role) {
    const merged = { ...last, text: `${last.text} ${text}` };
    return { entries: [...state.entries.slice(0, -1), merged], partial: null };
  }
  return {
    entries: [...state.entries, { id: `t${state.entries.length + 1}`, role, text }],
    partial: null,
  };
}
