import { Link } from "react-router-dom";
import { PageTitle } from "../components/PageBits";
import { useApp } from "../hooks/AppContext";
import { formatDate } from "../utils/format";

/** Collects vocabulary suggestions from saved sessions that have AI feedback. Nothing is pre-filled. */
export function VocabularyPage() {
  const { sessions } = useApp();
  const items = sessions.flatMap((s) =>
    s.feedback?.source === "ai" ? s.feedback.report.vocabulary.map((v) => ({ ...v, date: s.startedAt, id: s.id })) : [],
  );

  return (
    <>
      <PageTitle title="Vocabulary">
        Word and phrase suggestions based on what you actually said in saved sessions. Similar words rarely mean exactly the same thing, so read each
        explanation.
      </PageTitle>
      {items.length === 0 ? (
        <div className="card p-6">
          <p className="font-medium text-white">Nothing here yet</p>
          <p className="mt-1 text-sm text-slate-300">
            Suggestions appear after you save a session and request AI feedback (this needs an OpenAI key on the server and history saving turned on).
          </p>
          <Link to="/practice/fluency" className="btn btn-primary mt-4">
            Practise now
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((v, i) => (
            <li key={i} className="card p-4">
              <p className="text-sm text-slate-400">You said</p>
              <p className="text-slate-100">“{v.original}”</p>
              <p className="mt-2 text-sm text-slate-400">Try</p>
              <p className="font-medium text-brand-300">“{v.improved}”</p>
              <p className="mt-2 text-sm text-slate-300">{v.explanation}</p>
              <p className="mt-2 text-sm italic text-slate-400">Example: {v.example}</p>
              <Link to={`/sessions/${v.id}`} className="mt-3 inline-block text-xs text-slate-400 underline underline-offset-2">
                From {formatDate(v.date)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
