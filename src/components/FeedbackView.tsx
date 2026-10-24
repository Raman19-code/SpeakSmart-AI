import type { FeedbackReport, LocalFeedback, SessionFeedback } from "../types";

const CRITERIA: { key: "clarity" | "grammar" | "organization" | "vocabulary" | "relevance"; label: string }[] = [
  { key: "clarity", label: "Clarity" },
  { key: "grammar", label: "Grammar" },
  { key: "organization", label: "Organization" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "relevance", label: "Relevance" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h3 className="mb-3 text-base font-semibold text-white">{title}</h3>
      {children}
    </section>
  );
}

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1.5 pl-5 text-slate-200">
    {items.map((t, i) => (
      <li key={i}>{t}</li>
    ))}
  </ul>
);

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">{children}</p>;
}

function Scores({ scores }: { scores: FeedbackReport["scores"] }) {
  const rows = CRITERIA.filter((c) => typeof scores[c.key] === "number");
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map(({ key, label }) => {
        const n = scores[key] as number;
        return (
          <li key={key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-200">{label}</span>
              <span className="text-slate-400">{n} / 5 (estimate)</span>
            </div>
            <div className="h-2 rounded-full bg-white/10" role="img" aria-label={`${label}: ${n} out of 5, an AI estimate`}>
              <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(n / 5) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AiReport({ report, notice }: { report: FeedbackReport; notice: string }) {
  return (
    <div className="space-y-4">
      <Notice>{notice}</Notice>
      <Section title="Summary">
        <p className="text-slate-200">{report.summary}</p>
      </Section>
      <Section title="Estimated scores">
        <Scores scores={report.scores} />
      </Section>

      <Section title="Corrections">
        {report.corrections.length === 0 ? (
          <p className="text-slate-300">No clear errors were flagged in this transcript.</p>
        ) : (
          <ul className="space-y-4">
            {report.corrections.map((c, i) => (
              <li key={i} className="rounded-xl bg-white/[0.04] p-4">
                <p className="text-rose-200 line-through decoration-rose-300/50">{c.original}</p>
                <p className="mt-1 font-medium text-emerald-200">{c.improved}</p>
                <p className="mt-2 text-sm text-slate-300">{c.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Vocabulary and phrasing">
        {report.vocabulary.length === 0 ? (
          <p className="text-slate-300">No vocabulary suggestions for this transcript.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {report.vocabulary.map((v, i) => (
              <li key={i} className="rounded-xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">You said</p>
                <p className="text-slate-100">“{v.original}”</p>
                <p className="mt-2 text-sm text-slate-400">Try</p>
                <p className="font-medium text-brand-300">“{v.improved}”</p>
                <p className="mt-2 text-sm text-slate-300">{v.explanation}</p>
                <p className="mt-2 text-sm italic text-slate-400">Example: {v.example}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Strengths">{report.strengths.length ? <List items={report.strengths} /> : <p className="text-slate-400">None listed.</p>}</Section>
        <Section title="Areas to improve">
          {report.improvements.length ? <List items={report.improvements} /> : <p className="text-slate-400">None listed.</p>}
        </Section>
      </div>
      <Section title="Recommended next exercises">
        {report.nextExercises.length ? <List items={report.nextExercises} /> : <p className="text-slate-400">None listed.</p>}
      </Section>
    </div>
  );
}

export function LocalStats({ stats, notice }: { stats: LocalFeedback; notice: string }) {
  const tiles = [
    ["Words you said", stats.wordCount],
    ["Answers", stats.turns],
    ["Avg words / answer", stats.avgWordsPerTurn],
    ["Longest answer (words)", stats.longestTurnWords],
  ] as const;
  return (
    <div className="space-y-4">
      <Notice>{notice}</Notice>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(([label, value]) => (
          <div key={label} className="card p-4">
            <dt className="text-xs text-slate-400">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <Section title="What the counts suggest">
        <List items={stats.tips} />
      </Section>
    </div>
  );
}

export function FeedbackView({ feedback }: { feedback: SessionFeedback }) {
  return feedback.source === "ai" ? (
    <AiReport report={feedback.report} notice={feedback.notice} />
  ) : (
    <LocalStats stats={feedback.stats} notice={feedback.notice} />
  );
}
