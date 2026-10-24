import type { SessionConfig } from "../types";
import { modeInfo } from "../data/modes";

export function SessionHeader({ config, channel }: { config: SessionConfig; channel: "voice" | "text-demo" }) {
  const info = modeInfo(config.mode);
  const bits = [
    config.level,
    config.interviewType,
    config.role,
    `${config.durationMinutes}-minute`,
  ].filter(Boolean) as string[];
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-white">{info.title}</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            channel === "voice" ? "bg-emerald-400/15 text-emerald-200" : "bg-sky-400/15 text-sky-200"
          }`}
        >
          {channel === "voice" ? "Live voice" : "Demo mode: typed answers, scripted prompts"}
        </span>
      </div>
      <p className="mt-1 text-sm capitalize text-slate-400">{bits.join(" · ")}</p>
      {config.topic && (
        <p className="mt-3 rounded-xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 text-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-300">Topic</span>
          <br />
          {config.topic}
        </p>
      )}
    </div>
  );
}
