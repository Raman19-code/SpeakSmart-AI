import { useState } from "react";
import { CapabilityBanner } from "../components/CapabilityBanner";
import { PageTitle, useLevelAndDuration } from "../components/PageBits";
import { PracticeSession } from "../components/PracticeSession";
import { TopicChooser } from "../components/TopicChooser";

export function GroupPage() {
  const { level, durationMinutes, fields } = useLevelAndDuration();
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);

  if (started) {
    return <PracticeSession config={{ mode: "group", level, durationMinutes, topic }} onExit={() => setStarted(false)} />;
  }
  return (
    <>
      <PageTitle title="Group discussion">
        Choose a topic and discuss it with an AI moderator and two simulated AI participants. Expect follow-up questions and polite counterarguments.
      </PageTitle>
      <div className="space-y-6">
        <CapabilityBanner />
        <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          Every voice in this exercise is AI. The participants are simulated and hold no real opinions.
        </p>
        <div className="card p-6">
          <TopicChooser onChange={(t) => setTopic(t)} />
        </div>
        <div className="card space-y-6 p-6">{fields}</div>
        <button type="button" className="btn btn-primary" disabled={!topic} onClick={() => setStarted(true)}>
          {topic ? "Continue" : "Choose or write a topic to continue"}
        </button>
      </div>
    </>
  );
}
