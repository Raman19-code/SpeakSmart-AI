import { useCallback, useState } from "react";
import type { SessionConfig, SessionRecord, TranscriptEntry } from "../types";
import { useApp } from "../hooks/AppContext";
import { uid } from "../utils/format";
import { SessionResults } from "./SessionResults";
import { TextDemoRunner } from "./TextDemoRunner";
import { VoiceRunner } from "./VoiceRunner";

export interface RunResult {
  transcript: TranscriptEntry[];
  durationSeconds: number;
  startedAt: string;
}

/**
 * Chooses the real voice runner only when the server reports Vapi is configured;
 * otherwise falls back to the clearly-labelled typed demo. Then shows results.
 */
export function PracticeSession({ config, onExit }: { config: SessionConfig; onExit: () => void }) {
  const { capabilities } = useApp();
  const [record, setRecord] = useState<SessionRecord | null>(null);
  const [runKey, setRunKey] = useState(0);

  const voice = capabilities.status === "ready" && capabilities.caps.voice;
  const channel = voice ? "voice" : "text-demo";

  const onComplete = useCallback(
    (r: RunResult) =>
      setRecord({ id: uid(), config, startedAt: r.startedAt, durationSeconds: r.durationSeconds, channel, transcript: r.transcript }),
    [config, channel],
  );

  if (record) {
    return (
      <SessionResults
        key={record.id}
        initial={record}
        onAgain={() => {
          setRecord(null);
          setRunKey((k) => k + 1);
        }}
        onExit={onExit}
      />
    );
  }
  if (capabilities.status === "loading") {
    return (
      <p role="status" className="text-slate-300">
        Checking what this server supports…
      </p>
    );
  }
  return voice ? (
    <VoiceRunner key={runKey} config={config} onComplete={onComplete} onExit={onExit} />
  ) : (
    <TextDemoRunner key={runKey} config={config} onComplete={onComplete} onExit={onExit} />
  );
}
