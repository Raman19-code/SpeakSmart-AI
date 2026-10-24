import type { Settings, SessionRecord } from "../types";

/**
 * DEMO-GRADE storage: everything lives in this browser's localStorage, per device and per browser profile.
 * It is not synced, not encrypted and is lost if site data is cleared. A production app would use a
 * database behind authentication (see README).
 */

const SETTINGS_KEY = "speaksmart:settings:v1";
const SESSIONS_KEY = "speaksmart:sessions:v1";
const MAX_SESSIONS = 100;

export const DEFAULT_SETTINGS: Settings = {
  level: "intermediate",
  preferredMode: "fluency",
  durationMinutes: 5,
  textSize: "normal",
  saveHistory: null,
};

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // private mode, quota exceeded, or storage disabled
  }
}

const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  typeof v === "string" && (options as readonly string[]).includes(v) ? (v as T) : fallback;

export function loadSettings(): Settings {
  const s = read<Partial<Settings>>(SETTINGS_KEY) ?? {};
  const d = DEFAULT_SETTINGS;
  return {
    level: oneOf(s.level, ["beginner", "intermediate", "advanced"], d.level),
    preferredMode: oneOf(s.preferredMode, ["fluency", "impromptu", "group", "interview"], d.preferredMode),
    durationMinutes:
      typeof s.durationMinutes === "number" && s.durationMinutes >= 1 && s.durationMinutes <= 30
        ? Math.round(s.durationMinutes)
        : d.durationMinutes,
    textSize: oneOf(s.textSize, ["normal", "large", "xlarge"], d.textSize),
    saveHistory: typeof s.saveHistory === "boolean" ? s.saveHistory : null,
  };
}

export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);

export function loadSessions(): SessionRecord[] {
  const list = read<SessionRecord[]>(SESSIONS_KEY);
  if (!Array.isArray(list)) return [];
  return list.filter(
    (s) => s && typeof s.id === "string" && s.config && typeof s.startedAt === "string" && Array.isArray(s.transcript),
  );
}

/** Returns the updated list. Callers must only call this after the user has consented to saving history. */
export function saveSession(record: SessionRecord): SessionRecord[] {
  const next = [record, ...loadSessions().filter((s) => s.id !== record.id)].slice(0, MAX_SESSIONS);
  write(SESSIONS_KEY, next);
  return next;
}

export function deleteSession(id: string): SessionRecord[] {
  const next = loadSessions().filter((s) => s.id !== id);
  write(SESSIONS_KEY, next);
  return next;
}

export function clearAllData() {
  try {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    /* ignore */
  }
}

export function clearSessions() {
  try {
    localStorage.removeItem(SESSIONS_KEY);
  } catch {
    /* ignore */
  }
}
