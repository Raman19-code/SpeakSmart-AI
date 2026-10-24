export type MicCheck =
  | { ok: true }
  | { ok: false; kind: "unsupported" | "insecure" | "denied" | "not-found" | "busy" | "unknown"; message: string };

/** Can this browser do real-time voice at all? Checked before we ever ask for permission. */
export function checkVoiceSupport(): MicCheck {
  if (typeof window === "undefined") return { ok: false, kind: "unsupported", message: "Not running in a browser." };
  if (!window.isSecureContext) {
    return {
      ok: false,
      kind: "insecure",
      message: "Microphone access needs a secure page (HTTPS or localhost). Open the app from http://localhost or an https:// address.",
    };
  }
  if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === "undefined") {
    return {
      ok: false,
      kind: "unsupported",
      message: "This browser does not support real-time voice. Please use a recent version of Chrome, Edge, Firefox or Safari.",
    };
  }
  return { ok: true };
}

/** Ask for the microphone once, then release it immediately; the voice SDK opens its own stream. */
export async function requestMicrophone(): Promise<MicCheck> {
  const support = checkVoiceSupport();
  if (!support.ok) return support;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return { ok: true };
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return {
        ok: false,
        kind: "denied",
        message:
          "Microphone permission was denied. Click the lock or camera icon in your browser's address bar, allow the microphone, then try again.",
      };
    }
    if (name === "NotFoundError" || name === "OverconstrainedError") {
      return { ok: false, kind: "not-found", message: "No microphone was found. Plug one in or check your system sound settings." };
    }
    if (name === "NotReadableError" || name === "AbortError") {
      return { ok: false, kind: "busy", message: "Your microphone is in use by another app or could not be started. Close other apps using it and try again." };
    }
    return { ok: false, kind: "unknown", message: "Could not access the microphone. Please check your browser and system settings." };
  }
}
