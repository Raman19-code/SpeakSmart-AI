import { useState } from "react";
import type { InterviewType } from "../types";
import { CapabilityBanner } from "../components/CapabilityBanner";
import { ChoiceGroup } from "../components/ChoiceGroup";
import { PageTitle, useLevelAndDuration } from "../components/PageBits";
import { PracticeSession } from "../components/PracticeSession";

const TYPES: { value: InterviewType; label: string; hint: string }[] = [
  { value: "hr", label: "HR", hint: "Introduction, motivation, strengths, goals." },
  { value: "behavioural", label: "Behavioural", hint: "Real examples from your life. Practise the STAR structure." },
  { value: "technical", label: "Technical", hint: "Role-related questions where you explain your reasoning aloud." },
];

const ROLES = ["Software developer", "AI/ML engineer", "Data analyst", "Product manager", "Product analyst", "Other"];

export function InterviewPage() {
  const { level, durationMinutes, fields } = useLevelAndDuration();
  const [type, setType] = useState<InterviewType>("hr");
  const [roleChoice, setRoleChoice] = useState("Software developer");
  const [otherRole, setOtherRole] = useState("");
  const [started, setStarted] = useState(false);

  const role = (roleChoice === "Other" ? otherRole : roleChoice).trim();

  if (started) {
    return <PracticeSession config={{ mode: "interview", level, durationMinutes, interviewType: type, role }} onExit={() => setStarted(false)} />;
  }
  return (
    <>
      <PageTitle title="Interview preparation">
        Practise answering out loud. The interviewer is an AI that asks one question at a time and comments on relevance, clarity, structure,
        grammar and examples. It never invents experience for you; use your own real examples.
      </PageTitle>
      <div className="space-y-6">
        <CapabilityBanner />
        <div className="card space-y-6 p-6">
          <ChoiceGroup label="Interview type" options={TYPES} value={type} onChange={setType} />
          <ChoiceGroup label="Target role" options={ROLES.map((r) => ({ value: r, label: r }))} value={roleChoice} onChange={setRoleChoice} />
          {roleChoice === "Other" && (
            <div>
              <label htmlFor="other-role" className="mb-1 block text-sm font-medium text-slate-300">
                Role title
              </label>
              <input id="other-role" className="field" maxLength={80} value={otherRole} onChange={(e) => setOtherRole(e.target.value)} placeholder="e.g. Marketing associate" />
            </div>
          )}
        </div>
        <div className="card space-y-6 p-6">{fields}</div>
        <button type="button" className="btn btn-primary" disabled={!role} onClick={() => setStarted(true)}>
          {role ? "Continue" : "Enter a role to continue"}
        </button>
      </div>
    </>
  );
}
