import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "../types";

interface Props {
  entries: TranscriptEntry[];
  partial?: { role: TranscriptEntry["role"]; text: string } | null;
  live?: boolean;
  emptyText?: string;
}

const who = (role: TranscriptEntry["role"]) => (role === "coach" ? "Coach (AI)" : "You");

export function TranscriptView({ entries, partial = null, live = false, emptyText = "Nothing has been captured yet." }: Props) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (live) end.current?.scrollIntoView({ block: "nearest" });
  }, [entries, partial, live]);

  if (entries.length === 0 && !partial) {
    return <p className="text-sm text-slate-400">{emptyText}</p>;
  }
  const rows = partial ? [...entries, { id: "partial", ...partial }] : entries;
  return (
    <div role={live ? "log" : undefined} aria-live={live ? "polite" : undefined} className="max-h-96 space-y-3 overflow-y-auto pr-1">
      {rows.map((e) => (
        <div key={e.id} className={`flex ${e.role === "learner" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed ${
              e.role === "learner" ? "bg-brand-600/30 text-white" : "bg-white/[0.06] text-slate-100"
            } ${e.id === "partial" ? "opacity-70" : ""}`}
          >
            <div className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{who(e.role)}</div>
            {e.text}
          </div>
        </div>
      ))}
      <div ref={end} />
    </div>
  );
}
