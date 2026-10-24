import { useEffect, useMemo, useState } from "react";
import type { SessionFeedback, SessionRecord } from "../types";
import { useApp } from "../hooks/AppContext";
import { ApiClientError, requestFeedback } from "../services/api";
import { analyseTranscript } from "../utils/localAnalysis";
import { formatClock, formatDate } from "../utils/format";
import { AiReport, LocalStats } from "./FeedbackView";
import { SessionHeader } from "./SessionHeader";
import { TranscriptView } from "./TranscriptView";

const MIN_WORDS_FOR_AI = 15;
const LOCAL_NOTICE =
  "Simple counts calculated in your browser. No AI was used, and this is not an evaluation of your grammar, vocabulary or fluency.";

interface Props {
  initial: SessionRecord;
  onAgain?: () => void;
  onExit?: () => void;
}

type AiState = { s: "idle" } | { s: "loading" } | { s: "error"; message: string };

export function SessionResults({ initial, onAgain, onExit }: Props) {
  const { settings, updateSettings, recordSession, capabilities } = useApp();
  const [feedback, setFeedback] = useState<SessionFeedback | undefined>(initial.feedback);
  const [ai, setAi] = useState<AiState>({ s: "idle" });
  const [saved, setSaved] = useState<boolean | null>(null);

  const record = useMemo<SessionRecord>(() => ({ ...initial, feedback }), [initial, feedback]);
  const stats = useMemo(() => analyseTranscript(initial.transcript), [initial.transcript]);
  const hasContent = initial.transcript.length > 0;

  // Persist only after explicit consent, and never an empty session.
  useEffect(() => {
    if (settings.saveHistory === true && hasContent) setSaved(recordSession(record));
  }, [settings.saveHistory, hasContent, record, recordSession]);

  const aiConfigured = capabilities.status === "ready" && capabilities.caps.ai;
  const tooShort = stats.wordCount < MIN_WORDS_FOR_AI;

  const getFeedback = async () => {
    setAi({ s: "loading" });
    try {
      const res = await requestFeedback(initial.config, initial.transcript);
      setFeedback({ source: "ai", notice: res.notice, report: res.report });
      setAi({ s: "idle" });
    } catch (e) {
      const err = e as ApiClientError;
      setAi({ s: "error", message: err.message || "Could not get AI feedback." });
    }
  };

  return (
    <section aria-label="Session results" className="space-y-6">
      <SessionHeader config={initial.config} channel={initial.channel} />
      <p className="text-sm text-slate-400">
        {formatDate(initial.startedAt)} · {formatClock(initial.durationSeconds)} · {stats.turns} answer{stats.turns === 1 ? "" : "s"}
      </p>

      {!hasContent && (
        <div role="status" className="card p-5 text-slate-200">
          No speech or text was captured in this session, so there is nothing to review. Try again and check your microphone.
        </div>
      )}

      {hasContent && settings.saveHistory === null && (
        <div className="card p-5">
          <h3 className="font-semibold text-white">Save this session on this device?</h3>
          <p className="mt-1 text-sm text-slate-300">
            If you agree, the transcript and any feedback are stored in this browser&apos;s local storage so you can see progress on the dashboard.
            Nothing is uploaded for storage. You can delete it any time in Settings.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => updateSettings({ saveHistory: true })}>
              Save sessions
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => updateSettings({ saveHistory: false })}>
              Don&apos;t save
            </button>
          </div>
        </div>
      )}
      {hasContent && settings.saveHistory === true && (
        <p role="status" className={`text-sm ${saved === false ? "text-amber-200" : "text-emerald-200"}`}>
          {saved === false ? "Could not save: browser storage is unavailable or full." : "Saved on this device."}
        </p>
      )}
      {hasContent && settings.saveHistory === false && (
        <p className="text-sm text-slate-400">Not saved. History saving is off (change this in Settings).</p>
      )}

      {hasContent && (
        <>
          <div className="card p-5">
            <h3 className="mb-3 text-base font-semibold text-white">AI feedback</h3>
            {feedback?.source === "ai" ? (
              <p className="text-sm text-slate-300">Generated for this session (shown below).</p>
            ) : (
              <>
                <p className="text-sm text-slate-300">
                  Requesting feedback sends this session&apos;s transcript text to the SpeakSmart server, which forwards it to OpenAI. The result is an
                  estimate, not a measure of your real speaking ability.
                </p>
                {!aiConfigured && (
                  <p className="mt-2 text-sm text-amber-200">AI feedback is unavailable: the server has no OPENAI_API_KEY configured (see README).</p>
                )}
                {aiConfigured && tooShort && (
                  <p className="mt-2 text-sm text-amber-200">Say a little more first: feedback needs at least {MIN_WORDS_FOR_AI} words from you.</p>
                )}
                <button
                  type="button"
                  className="btn btn-primary mt-4"
                  disabled={!aiConfigured || tooShort || ai.s === "loading"}
                  onClick={() => void getFeedback()}
                >
                  {ai.s === "loading" ? "Analysing…" : "Get AI feedback"}
                </button>
                {ai.s === "loading" && (
                  <p role="status" className="mt-2 text-sm text-slate-300">
                    Reviewing your transcript. This usually takes a few seconds.
                  </p>
                )}
                {ai.s === "error" && (
                  <p role="alert" className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    {ai.message}
                  </p>
                )}
              </>
            )}
          </div>

          {feedback?.source === "ai" && <AiReport report={feedback.report} notice={feedback.notice} />}
          <div>
            <h3 className="mb-3 text-base font-semibold text-white">Simple counts</h3>
            <LocalStats stats={stats} notice={LOCAL_NOTICE} />
          </div>

          <details open className="card p-5">
            <summary className="cursor-pointer text-base font-semibold text-white">Transcript</summary>
            <div className="mt-4">
              <TranscriptView entries={initial.transcript} />
            </div>
          </details>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        {onAgain && (
          <button type="button" className="btn btn-primary" onClick={onAgain}>
            Practise again
          </button>
        )}
        {onExit && (
          <button type="button" className="btn btn-ghost" onClick={onExit}>
            Back
          </button>
        )}
      </div>
    </section>
  );
}
