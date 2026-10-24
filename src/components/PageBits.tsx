import { useState } from "react";
import type { Level, SessionConfig } from "../types";
import { useApp } from "../hooks/AppContext";
import { ChoiceGroup } from "./ChoiceGroup";

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-slate-300">{children}</p>}
    </div>
  );
}

export const LEVEL_OPTIONS: { value: Level; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "Short simple sentences, slow pace, one gentle correction at a time." },
  { value: "intermediate", label: "Intermediate", hint: "Natural everyday English, up to two corrections per turn." },
  { value: "advanced", label: "Advanced", hint: "Natural pace, nuance, precision and idiomatic phrasing." },
];

export const DURATION_OPTIONS = [3, 5, 10, 15].map((m) => ({ value: m, label: `${m} min` }));

/** Level + duration, initialised from the learner's saved settings. */
export function useLevelAndDuration(showDuration = true) {
  const { settings } = useApp();
  const [level, setLevel] = useState<Level>(settings.level);
  const [durationMinutes, setDuration] = useState<number>(settings.durationMinutes);
  const fields = (
    <>
      <ChoiceGroup label="Your level" options={LEVEL_OPTIONS} value={level} onChange={setLevel} />
      {showDuration && (
      <ChoiceGroup
        label="Session length"
        options={DURATION_OPTIONS.some((o) => o.value === durationMinutes) ? DURATION_OPTIONS : [...DURATION_OPTIONS, { value: durationMinutes, label: `${durationMinutes} min` }]}
        value={durationMinutes}
        onChange={setDuration}
      />
      )}
    </>
  );
  return { level, durationMinutes, fields };
}

export type BaseConfig = Pick<SessionConfig, "level" | "durationMinutes">;
