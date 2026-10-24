import { Link, useNavigate, useParams } from "react-router-dom";
import { SessionResults } from "../components/SessionResults";
import { modeInfo } from "../data/modes";
import { useApp } from "../hooks/AppContext";

export function SessionPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { sessions, removeSession } = useApp();
  const session = sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <div className="card p-6">
        <p className="font-medium text-white">Session not found</p>
        <p className="mt-1 text-sm text-slate-300">It may have been deleted, or it was saved in a different browser.</p>
        <Link to="/dashboard" className="btn btn-primary mt-4">
          Back to dashboard
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <SessionResults initial={session} onAgain={() => nav(modeInfo(session.config.mode).path)} onExit={() => nav("/dashboard")} />
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => {
          if (window.confirm("Delete this saved session from this device?")) {
            removeSession(session.id);
            nav("/dashboard");
          }
        }}
      >
        Delete this session
      </button>
    </div>
  );
}
