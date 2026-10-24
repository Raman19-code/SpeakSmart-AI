import { beforeEach, describe, expect, it, vi } from "vitest";
import { classifyVoiceError } from "./voiceErrors";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem = (k: string) => this.data.get(k) ?? null;
  setItem = (k: string, v: string) => void this.data.set(k, v);
  removeItem = (k: string) => void this.data.delete(k);
}

describe("classifyVoiceError", () => {
  it("detects denied microphone permission", () => {
    expect(classifyVoiceError({ name: "NotAllowedError", message: "Permission denied" }).kind).toBe("permission");
  });
  it("detects bad credentials", () => {
    expect(classifyVoiceError({ error: { message: "401 Unauthorized" } }).kind).toBe("credentials");
  });
  it("detects network failures", () => {
    expect(classifyVoiceError(new Error("Failed to fetch")).kind).toBe("network");
  });
  it("falls back to a readable unknown error", () => {
    const e = classifyVoiceError("weird thing");
    expect(e.kind).toBe("unknown");
    expect(e.message).toContain("weird thing");
  });
});

describe("storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage());
    vi.resetModules();
  });

  it("returns defaults and never invents sessions for a new user", async () => {
    const s = await import("./storage");
    expect(s.loadSettings()).toEqual(s.DEFAULT_SETTINGS);
    expect(s.loadSettings().saveHistory).toBeNull();
    expect(s.loadSessions()).toEqual([]);
  });

  it("repairs corrupted settings", async () => {
    localStorage.setItem("speaksmart:settings:v1", JSON.stringify({ level: "godlike", durationMinutes: 9999, textSize: "large" }));
    const s = await import("./storage");
    const loaded = s.loadSettings();
    expect(loaded.level).toBe("intermediate");
    expect(loaded.durationMinutes).toBe(5);
    expect(loaded.textSize).toBe("large");
  });

  it("saves, replaces and deletes sessions", async () => {
    const s = await import("./storage");
    const rec = {
      id: "a",
      config: { mode: "fluency" as const, level: "beginner" as const, durationMinutes: 5 },
      startedAt: new Date().toISOString(),
      durationSeconds: 60,
      channel: "text-demo" as const,
      transcript: [],
    };
    expect(s.saveSession(rec)).toHaveLength(1);
    expect(s.saveSession({ ...rec, durationSeconds: 90 })).toHaveLength(1);
    expect(s.loadSessions()[0].durationSeconds).toBe(90);
    expect(s.deleteSession("a")).toHaveLength(0);
  });

  it("survives unreadable JSON", async () => {
    localStorage.setItem("speaksmart:sessions:v1", "{not json");
    const s = await import("./storage");
    expect(s.loadSessions()).toEqual([]);
  });
});
