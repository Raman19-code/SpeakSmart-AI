import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CapabilityBanner } from "../components/CapabilityBanner";
import { PageTitle, useLevelAndDuration } from "../components/PageBits";
import { PracticeSession } from "../components/PracticeSession";

export function FluencyPage() {
  const nav = useNavigate();
  const { level, durationMinutes, fields } = useLevelAndDuration();
  const [started, setStarted] = useState(false);

  if (started) {
    return <PracticeSession config={{ mode: "fluency", level, durationMinutes }} onExit={() => setStarted(false)} />;
  }
  return (
    <>
      <PageTitle title="Fluency coach">
        Have a relaxed conversation. The coach asks one question at a time, gently corrects grammar, and suggests more natural phrasing.
      </PageTitle>
      <div className="space-y-6">
        <CapabilityBanner />
        <div className="card space-y-6 p-6">{fields}</div>
        <div className="flex gap-3">
          <button type="button" className="btn btn-primary" onClick={() => setStarted(true)}>
            Continue
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => nav("/dashboard")}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
