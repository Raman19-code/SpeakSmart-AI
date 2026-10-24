import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import type { SessionConfig, TranscriptEntry } from "../types";
import { demoQuestionsFor } from "../data/demoQuestions";
import { useStopwatch } from "../hooks/useTimers";
import { formatClock } from "../utils/format";
import { SessionHeader } from "./SessionHeader";
import { TranscriptView } from "./TranscriptView";
import type { RunResult } from "./PracticeSession";

interface Props {
  config: SessionConfig;
  onComplete: (r: RunResult) => void;
  onExit: () => void;
}

/**
 * DEMO MODE. Fixed scripted prompts and typed answers. No AI is involved in the conversation.
 * Used when live voice is not configured, so the rest of the app (feedback, history) is still usable.
 */
export function TextDemoRunner({ config, onComplete, onExit }: Props) {
  const questions = useMemo(() => demoQuestionsFor(config), [config]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [input, setInput] = useState("");
  const { elapsed } = useStopwatch(startedAt !== null);

  const answered = entries.filter((e) => e.role === "learner").length;
  const exhausted = startedAt !== null && answered >= questions.length;

  const begin = () => {
    setStartedAt(new Date().toISOString());
    setEntries([{ id: "c1", role: "coach", text: questions[0] }]);
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || exhausted) return;
    const next: TranscriptEntry[] = [{ id: `l${entries.length + 1}`, role: "learner", text }];
    const following = questions[answered + 1];
    if (following) next.push({ id: `c${entries.length + 2}`, role: "coach", text: following });
    setEntries((prev) => [...prev, ...next]);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
  };

  const finish = () => onComplete({ transcript: entries, durationSeconds: elapsed, startedAt: startedAt ?? new Date().toISOString() });

  return (
    <section aria-label="Demo practice session">
      <SessionHeader config={config} channel="text-demo" />

      {startedAt === null ? (
        <div className="card p-6">
          <p className="text-slate-200">
            Live voice is not set up on this server, so this is a <strong>demo</strong>: you will see fixed practice prompts and type your answers.
            There is no AI in the conversation itself. You can still get a word-count summary, and AI feedback if an OpenAI key is configured.
          </p>
          <p className="mt-3 text-sm text-slate-400">To enable live voice, add VAPI_PUBLIC_KEY to your .env file (see README).</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={begin}>
              Start demo session
            </button>
            <button type="button" className="btn btn-ghost" onClick={onExit}>
              Back to setup
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,24rem)]">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Conversation</h3>
              <span className="font-mono text-sm text-slate-300" aria-label="Elapsed time">
                {formatClock(elapsed)}
              </span>
            </div>
            <TranscriptView entries={entries} live />
          </div>

          <form onSubmit={submit} className="card flex flex-col gap-3 p-5">
            <label htmlFor="demo-answer" className="text-sm font-medium text-slate-200">
              Your answer
            </label>
            <textarea
              id="demo-answer"
              className="field min-h-32"
              value={input}
              maxLength={1500}
              disabled={exhausted}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={exhausted ? "That was the last scripted prompt." : "Type your answer in English…"}
            />
            <p className="text-xs text-slate-400">Press Ctrl+Enter to send.</p>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary" disabled={!input.trim() || exhausted}>
                Send
              </button>
              <button type="button" className="btn btn-ghost" disabled={answered === 0} onClick={finish}>
                Finish &amp; review
              </button>
              <button type="button" className="btn btn-ghost" onClick={onExit}>
                Cancel
              </button>
            </div>
            {exhausted && <p className="text-sm text-emerald-200">That was the last prompt. Choose “Finish &amp; review”.</p>}
          </form>
        </div>
      )}
    </section>
  );
}
