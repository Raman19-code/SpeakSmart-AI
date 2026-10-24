import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CapabilityBanner } from "../components/CapabilityBanner";
import { PageTitle } from "../components/PageBits";
import { MODES, modeInfo } from "../data/modes";
import { useApp } from "../hooks/AppContext";
import { formatDate, formatMinutes } from "../utils/format";
import { analyseTranscript } from "../utils/localAnalysis";

const CRITERIA = ["clarity", "grammar", "organization", "vocabulary"] as const;

export function DashboardPage() {
  const { sessions, settings } = useApp();

  const metrics = useMemo(() => {
    const seconds = sessions.reduce((a, s) => a + s.durationSeconds, 0);
    const words = sessions.reduce((a, s) => a + analyseTranscript(s.transcript).wordCount, 0);
    const rated = sessions.flatMap((s) => (s.feedback?.source === "ai" ? [s.feedback.report.scores] : []));
    const avg = CRITERIA.map((k) => ({
      key: k,
      value: rated.length ? Math.round((rated.reduce((a, s) => a + s[k], 0) / rated.length) * 10) / 10 : null,
    }));
    return { seconds, words, ratedCount: rated.length, avg };
  }, [sessions]);

  return (
    <>
      <PageTitle title="Dashboard">Choose a practice mode. Your progress appears here only after you complete and save sessions.</PageTitle>
      <div className="space-y-8">
        <CapabilityBanner />

        <section aria-labelledby="modes-h">
          <h2 id="modes-h" className="mb-3 text-lg font-semibold text-white">
            Practice modes
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODES.map((m) => (
              <li key={m.mode}>
                <Link
                  to={m.path}
                  className={`card block h-full p-5 transition-colors hover:bg-white/[0.07] ${settings.preferredMode === m.mode ? "!border-brand-400/60" : ""}`}
                >
                  <span className="font-semibold text-white">{m.title}</span>
                  {settings.preferredMode === m.mode && <span className="ml-2 text-xs text-brand-300">your preferred mode</span>}
                  <span className="mt-2 block text-sm text-slate-300">{m.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="progress-h">
          <h2 id="progress-h" className="mb-3 text-lg font-semibold text-white">
            Your progress
          </h2>
          {sessions.length === 0 ? (
            <div className="card p-6">
              <p className="font-medium text-white">No sessions yet</p>
              <p className="mt-1 text-sm text-slate-300">
                {settings.saveHistory === false
                  ? "History saving is off, so sessions are not kept. You can turn it on in Settings."
                  : "Complete a practice session and choose to save it. Your sessions, practice time and feedback will show up here."}
              </p>
              <Link to="/practice/fluency" className="btn btn-primary mt-4">
                Start your first session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Sessions", String(sessions.length)],
                  ["Practice time", formatMinutes(metrics.seconds)],
                  ["Words you said", String(metrics.words)],
                  ["Sessions with AI feedback", String(metrics.ratedCount)],
                ].map(([label, value]) => (
                  <div key={label} className="card p-4">
                    <dt className="text-xs text-slate-400">{label}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
                  </div>
                ))}
              </dl>
              {metrics.ratedCount > 0 && (
                <div className="card p-5">
                  <h3 className="font-semibold text-white">Average AI estimates (1–5)</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Rough estimates from text transcripts across {metrics.ratedCount} session{metrics.ratedCount === 1 ? "" : "s"}. Not an objective measure.
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-4">
                    {metrics.avg.map((a) => (
                      <li key={a.key} className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm capitalize">
                        {a.key}: <span className="font-semibold text-white">{a.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {sessions.length > 0 && (
          <section aria-labelledby="recent-h">
            <h2 id="recent-h" className="mb-3 text-lg font-semibold text-white">
              Recent sessions
            </h2>
            <ul className="space-y-2">
              {sessions.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link to={`/sessions/${s.id}`} className="card flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-white/[0.07]">
                    <span>
                      <span className="font-medium text-white">{modeInfo(s.config.mode).title}</span>
                      <span className="ml-2 text-xs text-slate-400">{s.channel === "voice" ? "live voice" : "demo (typed)"}</span>
                    </span>
                    <span className="text-sm text-slate-400">
                      {formatDate(s.startedAt)} · {formatMinutes(s.durationSeconds)}
                      {s.feedback?.source === "ai" ? " · AI feedback" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
