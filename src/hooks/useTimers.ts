import { useCallback, useEffect, useRef, useState } from "react";

/** Counts down from `seconds`; calls onDone once at zero. */
export function useCountdown(onDone?: () => void) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      setRemaining(null);
      doneRef.current?.();
      return;
    }
    const id = window.setTimeout(() => setRemaining((r) => (r === null ? r : r - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  const start = useCallback((seconds: number) => setRemaining(Math.max(1, Math.round(seconds))), []);
  const cancel = useCallback(() => setRemaining(null), []);
  return { remaining, running: remaining !== null, start, cancel };
}

/** Counts up while `running` is true. Uses wall-clock time so background-tab throttling does not skew it. */
export function useStopwatch(running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const base = useRef(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now();
    const id = window.setInterval(() => {
      setElapsed(base.current + Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000));
    }, 250);
    return () => {
      window.clearInterval(id);
      base.current += Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000);
      setElapsed(base.current);
    };
  }, [running]);

  const reset = useCallback(() => {
    base.current = 0;
    startedAt.current = running ? Date.now() : null;
    setElapsed(0);
  }, [running]);

  return { elapsed, reset };
}
