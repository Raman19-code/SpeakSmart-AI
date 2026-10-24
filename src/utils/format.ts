export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function formatMinutes(totalSeconds: number): string {
  const mins = Math.round(totalSeconds / 60);
  return mins < 1 ? "<1 min" : `${mins} min`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const MODE_LABELS = {
  fluency: "Fluency coach",
  impromptu: "Impromptu speech",
  group: "Group discussion",
  interview: "Interview prep",
} as const;
