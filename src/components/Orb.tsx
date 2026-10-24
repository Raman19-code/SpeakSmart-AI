import type { CSSProperties } from "react";
import type { OrbState } from "../hooks/useVoiceSession";

const LABELS: Record<OrbState, string> = {
  idle: "Voice session not started",
  connecting: "Connecting",
  listening: "Listening to you",
  speaking: "Coach is speaking",
  ended: "Voice session ended",
};

/** Visual only. The orb reflects real call state and audio levels; it never animates unless a call is live. */
export function Orb({ state, level = 0, decorative = false }: { state: OrbState; level?: number; decorative?: boolean }) {
  return (
    <div
      className="orb mx-auto"
      data-state={state}
      style={{ "--level": level } as CSSProperties}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": LABELS[state] })}
    />
  );
}
