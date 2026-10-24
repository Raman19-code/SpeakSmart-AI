import type Vapi from "@vapi-ai/web";
import { classifyVoiceError, type VoiceError } from "./voiceErrors";

/**
 * The only module that touches the Vapi SDK. UI code talks to VoiceSession and never imports the SDK.
 * The SDK is loaded lazily so it stays out of the initial bundle and load failures can be handled.
 */

export interface VoiceHandlers {
  onCallStart: () => void;
  onCallEnd: () => void;
  /** Assistant speaking state ("speech-start" / "speech-end" from the SDK). */
  onAssistantSpeaking: (speaking: boolean) => void;
  /** Output (assistant) and input (microphone) levels, 0..1. */
  onVolume: (source: "assistant" | "you", level: number) => void;
  onMessage: (message: unknown) => void;
  onError: (error: VoiceError) => void;
}

type StartArg = Parameters<Vapi["start"]>[0];

/**
 * @vapi-ai/web ships CommonJS with `__esModule`. Depending on the bundler or runtime, `import()` gives either
 * the class as `default`, or a module object whose own `default` is the class ("i is not a constructor").
 * Accept both shapes and fail loudly if neither contains a constructor.
 */
export function resolveVapiConstructor(mod: unknown): typeof Vapi {
  let candidate: unknown = mod;
  for (let depth = 0; depth < 3 && candidate; depth++) {
    if (typeof candidate === "function") return candidate as typeof Vapi;
    candidate = (candidate as { default?: unknown }).default;
  }
  throw new Error("Vapi SDK did not export a constructor.");
}

export class VoiceSession {
  private constructor(private vapi: Vapi) {}

  static async start(publicKey: string, assistant: Record<string, unknown>, h: VoiceHandlers): Promise<VoiceSession> {
    let VapiCtor: typeof Vapi;
    try {
      VapiCtor = resolveVapiConstructor(await import("@vapi-ai/web"));
    } catch {
      throw {
        kind: "network",
        title: "Could not load the voice library",
        message: "The voice component failed to download. Check your connection and reload the page.",
      } satisfies VoiceError;
    }

    const vapi = new VapiCtor(publicKey);
    const session = new VoiceSession(vapi);

    vapi.on("call-start", h.onCallStart);
    vapi.on("call-end", h.onCallEnd);
    vapi.on("speech-start", () => h.onAssistantSpeaking(true));
    vapi.on("speech-end", () => h.onAssistantSpeaking(false));
    vapi.on("volume-level", (v: number) => h.onVolume("assistant", v));
    vapi.on("local-volume-level", (v: number) => h.onVolume("you", v));
    vapi.on("message", h.onMessage);
    vapi.on("error", (err: unknown) => h.onError(classifyVoiceError(err)));

    try {
      const call = await vapi.start(assistant as StartArg);
      if (!call) {
        throw new Error("The voice service did not start a call.");
      }
    } catch (err) {
      await vapi.stop().catch(() => undefined);
      throw classifyVoiceError(err);
    }
    return session;
  }

  setMuted(muted: boolean) {
    this.vapi.setMuted(muted);
  }

  isMuted(): boolean {
    return this.vapi.isMuted();
  }

  async stop(): Promise<void> {
    try {
      await this.vapi.stop();
    } catch {
      /* already stopped */
    }
  }
}
