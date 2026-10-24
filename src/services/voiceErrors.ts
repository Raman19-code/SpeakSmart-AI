export type VoiceErrorKind = "permission" | "credentials" | "network" | "unsupported" | "unknown";

export interface VoiceError {
  kind: VoiceErrorKind;
  title: string;
  message: string;
}

function extractMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    for (const key of ["message", "errorMsg", "msg"]) {
      if (typeof e[key] === "string" && e[key]) return e[key] as string;
    }
    if (e.error) return extractMessage(e.error);
    try {
      return JSON.stringify(err).slice(0, 300);
    } catch {
      /* fall through */
    }
  }
  return "";
}

/** Turn whatever the voice SDK throws or emits into a friendly, actionable error. */
export function classifyVoiceError(err: unknown): VoiceError {
  const raw = extractMessage(err);
  const text = raw.toLowerCase();
  const name = err && typeof err === "object" ? String((err as { name?: unknown }).name ?? "") : "";

  if (name === "NotAllowedError" || /permission|notallowed|denied|microphone/.test(text)) {
    return {
      kind: "permission",
      title: "Microphone access was blocked",
      message:
        "Allow microphone access for this site in your browser's address bar or site settings, then try again.",
    };
  }
  if (/401|403|unauthor|forbidden|invalid key|invalid api|public key/.test(text)) {
    return {
      kind: "credentials",
      title: "Voice service rejected the credentials",
      message: "The Vapi public key looks invalid or not allowed for this site. Check VAPI_PUBLIC_KEY in your .env file.",
    };
  }
  if (/network|failed to fetch|offline|timeout|timed out|connection|ice|websocket/.test(text)) {
    return {
      kind: "network",
      title: "Connection problem",
      message: "The voice connection failed or dropped. Check your internet connection and try again.",
    };
  }
  return {
    kind: "unknown",
    title: "The voice session hit an error",
    message: raw ? `Details: ${raw}` : "Something went wrong. Please try again.",
  };
}
