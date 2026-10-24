import { useEffect, useMemo, useRef } from "react";
import type { SessionConfig } from "../types";
import { useVoiceSession } from "../hooks/useVoiceSession";
import { checkVoiceSupport } from "../services/microphone";
import { formatClock } from "../utils/format";
import { Orb } from "./Orb";
import { SessionHeader } from "./SessionHeader";
import { TranscriptView } from "./TranscriptView";
import type { RunResult } from "./PracticeSession";

interface Props {
  config: SessionConfig;
  onComplete: (r: RunResult) => void;
  onExit: () => void;
}

const STATUS_TEXT = {
  idle: "Ready when you are.",
  requesting: "Waiting for microphone permission. Please choose Allow in your browser prompt.",
  connecting: "Connecting to your coach…",
  live: "",
  ended: "Session ended.",
  error: "",
} as const;

export function VoiceRunner({ config, onComplete, onExit }: Props) {
  const v = useVoiceSession();
  const support = useMemo(() => checkVoiceSupport(), []);
  const completed = useRef(false);

  useEffect(() => {
    if (v.status === "ended" && !completed.current) {
      completed.current = true;
      onComplete({ transcript: v.transcript, durationSeconds: v.elapsedSeconds, startedAt: v.startedAt ?? new Date().toISOString() });
    }
  }, [v.status, v.transcript, v.elapsedSeconds, v.startedAt, onComplete]);

  const busy = v.status === "requesting" || v.status === "connecting";
  const live = v.status === "live";
  const statusLine = live ? (v.orbState === "speaking" ? "Coach is speaking…" : v.muted ? "You are muted." : "Listening. Speak when you're ready.") : STATUS_TEXT[v.status];

  return (
    <section aria-label="Voice practice session">
      <SessionHeader config={config} channel="voice" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div className="card flex flex-col items-center gap-5 p-6">
          <Orb state={v.orbState} level={v.orbLevel} />
          <p role="status" aria-live="polite" className="min-h-[3rem] text-center text-sm text-slate-300">
            {statusLine}
          </p>
          {(live || busy) && (
            <p className="font-mono text-2xl text-white" aria-label="Elapsed time">
              {formatClock(v.elapsedSeconds)}
              <span className="text-sm text-slate-400"> / {config.durationMinutes}:00</span>
            </p>
          )}

          {v.status === "idle" && (
            <>
              <div className="rounded-xl bg-white/[0.04] p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Before you start</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Your browser will ask to use your microphone. You can say no.</li>
                  <li>Your voice is streamed to Vapi, which transcribes it and the AI coach replies by voice.</li>
                  <li>This app keeps the text transcript only in this tab, unless you choose to save it on this device afterwards.</li>
                  <li>The coach is an AI. It reads a transcript, so it cannot judge your pronunciation or accent.</li>
                </ul>
              </div>
              {!support.ok && (
                <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {support.message}
                </p>
              )}
              <button type="button" className="btn btn-primary w-full" disabled={!support.ok} onClick={() => void v.start(config)}>
                Allow microphone &amp; start
              </button>
            </>
          )}

          {busy && (
            <button type="button" className="btn btn-ghost w-full" onClick={() => void v.stop()}>
              Cancel
            </button>
          )}

          {live && (
            <div className="flex w-full gap-3">
              <button type="button" className="btn btn-ghost flex-1" aria-pressed={v.muted} onClick={v.toggleMute}>
                {v.muted ? "Unmute" : "Mute"}
              </button>
              <button type="button" className="btn btn-danger flex-1" onClick={() => void v.stop()}>
                End session
              </button>
            </div>
          )}

          {v.status === "error" && v.error && (
            <div role="alert" className="w-full rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              <p className="font-semibold">{v.error.title}</p>
              <p className="mt-1">{v.error.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={v.reset}>
                  Try again
                </button>
                {v.transcript.length > 0 && (
                  <button type="button" className="btn btn-ghost" onClick={() => void v.stop()}>
                    Review what was captured
                  </button>
                )}
              </div>
            </div>
          )}

          {v.status !== "live" && !busy && (
            <button type="button" className="text-sm text-slate-400 underline underline-offset-2" onClick={onExit}>
              Back to setup
            </button>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Live transcript</h3>
          <TranscriptView
            entries={v.transcript}
            partial={v.partial}
            live
            emptyText={live ? "Your words will appear here as you speak." : "The transcript appears here once a real session is connected."}
          />
        </div>
      </div>
    </section>
  );
}
