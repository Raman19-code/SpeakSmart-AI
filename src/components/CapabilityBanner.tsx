import { useApp } from "../hooks/AppContext";

/** Tells the truth about what this running server can and cannot do. */
export function CapabilityBanner() {
  const { capabilities, refreshCapabilities } = useApp();

  if (capabilities.status === "loading") {
    return (
      <div role="status" className="card px-4 py-3 text-sm text-slate-300">
        Checking what the server supports…
      </div>
    );
  }

  if (capabilities.status === "unreachable") {
    return (
      <div role="alert" className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
        <strong className="font-semibold">Server not reachable.</strong> Typed demo sessions still work, but live voice and AI feedback need the
        SpeakSmart server (run <code>npm run dev</code>).{" "}
        <button type="button" className="underline underline-offset-2" onClick={refreshCapabilities}>
          Check again
        </button>
      </div>
    );
  }

  const { voice, ai } = capabilities.caps;
  if (voice && ai) {
    return (
      <div role="status" className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
        Voice (Vapi) and AI feedback (OpenAI) keys are configured on the server. They are only proven to work once a session connects.
      </div>
    );
  }
  return (
    <div role="status" className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
      <strong className="font-semibold">Demo mode.</strong>{" "}
      {!voice && "Live voice is off (no VAPI_PUBLIC_KEY), so sessions use scripted prompts and typed answers. "}
      {!ai && "AI feedback and AI topics are off (no OPENAI_API_KEY); you still get simple word counts and the built-in topic bank. "}
      See Settings for details.
    </div>
  );
}
