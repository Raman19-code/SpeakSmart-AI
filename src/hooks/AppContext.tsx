import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Capabilities, SessionRecord, Settings } from "../types";
import { getStatus } from "../services/api";
import * as storage from "../services/storage";

type CapabilityState =
  | { status: "loading" }
  | { status: "ready"; caps: Capabilities }
  | { status: "unreachable"; message: string };

interface AppContextValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  sessions: SessionRecord[];
  /** Persists only when the user has opted in. Returns whether it was stored. */
  recordSession: (record: SessionRecord) => boolean;
  removeSession: (id: string) => void;
  eraseHistory: () => void;
  eraseEverything: () => void;
  capabilities: CapabilityState;
  refreshCapabilities: () => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => storage.loadSettings());
  const [sessions, setSessions] = useState<SessionRecord[]>(() => storage.loadSessions());
  const [capabilities, setCapabilities] = useState<CapabilityState>({ status: "loading" });

  useEffect(() => {
    document.documentElement.dataset.textSize = settings.textSize;
  }, [settings.textSize]);

  const refreshCapabilities = useCallback(() => {
    setCapabilities({ status: "loading" });
    getStatus()
      .then((caps) => setCapabilities({ status: "ready", caps }))
      .catch((e: Error) => setCapabilities({ status: "unreachable", message: e.message }));
  }, []);
  useEffect(refreshCapabilities, [refreshCapabilities]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      storage.saveSettings(next);
      return next;
    });
  }, []);

  const recordSession = useCallback(
    (record: SessionRecord) => {
      if (settings.saveHistory !== true) return false;
      setSessions(storage.saveSession(record));
      return true;
    },
    [settings.saveHistory],
  );

  const removeSession = useCallback((id: string) => setSessions(storage.deleteSession(id)), []);

  const eraseHistory = useCallback(() => {
    storage.clearSessions();
    setSessions([]);
  }, []);

  const eraseEverything = useCallback(() => {
    storage.clearAllData();
    setSessions([]);
    setSettings(storage.DEFAULT_SETTINGS);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      settings,
      updateSettings,
      sessions,
      recordSession,
      removeSession,
      eraseHistory,
      eraseEverything,
      capabilities,
      refreshCapabilities,
    }),
    [settings, updateSettings, sessions, recordSession, removeSession, eraseHistory, eraseEverything, capabilities, refreshCapabilities],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
}
