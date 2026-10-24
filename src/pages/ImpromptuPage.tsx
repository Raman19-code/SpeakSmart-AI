import { useState } from "react";
import { CapabilityBanner } from "../components/CapabilityBanner";
import { ChoiceGroup } from "../components/ChoiceGroup";
import { PageTitle, useLevelAndDuration } from "../components/PageBits";
import { PracticeSession } from "../components/PracticeSession";
import { TopicChooser } from "../components/TopicChooser";
import { useCountdown } from "../hooks/useTimers";
import { formatClock } from "../utils/format";

type Phase = "setup" | "prep" | "speak";

const PREP_OPTIONS = [
  { value: 0, label: "No prep" },
  { value: 30, label: "30 s" },
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
];

export function ImpromptuPage() {
  const { level, fields } = useLevelAndDuration(false);
  const [topic, setTopic] = useState("");
  const [prep, setPrep] = useState(30);
  const [speechMinutes, setSpeechMinutes] = useState(2);
  const [phase, setPhase] = useState<Phase>("setup");
  const countdown = useCountdown(() => setPhase("speak"));

  const begin = () => {
    if (prep === 0) {
      setPhase("speak");
    } else {
      setPhase("prep");
      countdown.start(prep);
    }
  };
  const skip = () => {
    countdown.cancel();
    setPhase("speak");
  };
  const back = () => {
    countdown.cancel();
    setPhase("setup");
  };

  if (phase === "speak") {
    return <PracticeSession config={{ mode: "impromptu", level, durationMinutes: speechMinutes, topic }} onExit={back} />;
  }

  if (phase === "prep") {
    return (
      <>
        <PageTitle title="Prepare your speech" />
        <div className="card mx-auto max-w-xl space-y-5 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">Your topic</p>
          <p className="text-xl text-white">{topic}</p>
          <p role="timer" aria-label="Preparation time left" className="font-mono text-6xl font-semibold text-white">
            {formatClock(countdown.remaining ?? 0)}
          </p>
          <p className="text-sm text-slate-300">Think of an opening line, two points, an example and a closing sentence.</p>
          <div className="flex justify-center gap-3">
            <button type="button" className="btn btn-primary" onClick={skip}>
              I&apos;m ready, start speaking
            </button>
            <button type="button" className="btn btn-ghost" onClick={back}>
              Change topic
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Impromptu speech">
        Pick a topic, optionally prepare, then speak. Feedback covers clarity, grammar, organization and vocabulary from the transcript. It does not
        measure pronunciation or delivery.
      </PageTitle>
      <div className="space-y-6">
        <CapabilityBanner />
        <div className="card p-6">
          <TopicChooser onChange={(t) => setTopic(t)} />
        </div>
        <div className="card space-y-6 p-6">
          <ChoiceGroup label="Preparation time" options={PREP_OPTIONS} value={prep} onChange={setPrep} />
          <ChoiceGroup
            label="Speech length"
            options={[1, 2, 3, 5].map((m) => ({ value: m, label: `${m} min` }))}
            value={speechMinutes}
            onChange={setSpeechMinutes}
          />
          {fields}
        </div>
        <button type="button" className="btn btn-primary" disabled={!topic} onClick={begin}>
          {topic ? (prep ? "Start preparation" : "Start speaking") : "Choose or write a topic to continue"}
        </button>
      </div>
    </>
  );
}
