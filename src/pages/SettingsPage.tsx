import { ChoiceGroup } from "../components/ChoiceGroup";
import { DURATION_OPTIONS, LEVEL_OPTIONS, PageTitle } from "../components/PageBits";
import { MODES } from "../data/modes";
import { useApp } from "../hooks/AppContext";
import type { Mode, TextSize } from "../types";

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra large" },
];

export function SettingsPage() {
  const { settings, updateSettings, sessions, eraseHistory, eraseEverything, capabilities, refreshCapabilities } = useApp();

  return (
    <>
      <PageTitle title="Settings">Defaults for new sessions, text size, and control over what is stored.</PageTitle>
      <div className="space-y-6">
        <section className="card space-y-6 p-6" aria-labelledby="prefs-h">
          <h2 id="prefs-h" className="text-lg font-semibold text-white">
            Practice defaults
          </h2>
          <ChoiceGroup label="Proficiency level" options={LEVEL_OPTIONS} value={settings.level} onChange={(level) => updateSettings({ level })} />
          <ChoiceGroup
            label="Preferred practice mode"
            options={MODES.map((m) => ({ value: m.mode, label: m.title }))}
            value={settings.preferredMode}
            onChange={(preferredMode: Mode) => updateSettings({ preferredMode })}
          />
          <ChoiceGroup
            label="Session length"
            options={DURATION_OPTIONS}
            value={DURATION_OPTIONS.some((o) => o.value === settings.durationMinutes) ? settings.durationMinutes : 5}
            onChange={(durationMinutes) => updateSettings({ durationMinutes })}
          />
        </section>

        <section className="card space-y-4 p-6" aria-labelledby="a11y-h">
          <h2 id="a11y-h" className="text-lg font-semibold text-white">
            Accessibility
          </h2>
          <ChoiceGroup label="Text size" options={TEXT_SIZES} value={settings.textSize} onChange={(textSize) => updateSettings({ textSize })} />
          <p className="text-sm text-slate-400">
            All controls work with the keyboard. Animations are reduced automatically if your system is set to reduce motion.
          </p>
        </section>

        <section className="card space-y-4 p-6" aria-labelledby="data-h">
          <h2 id="data-h" className="text-lg font-semibold text-white">
            Privacy and data
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">
            <li>The microphone is used only after you press the start button and approve your browser&apos;s prompt.</li>
            <li>During a live session your voice is streamed to Vapi for transcription and the AI coach&apos;s spoken reply.</li>
            <li>AI feedback sends the transcript text to this app&apos;s server, which forwards it to OpenAI. It happens only when you ask for it.</li>
            <li>
              Saved sessions live in this browser&apos;s local storage only (demo-grade: not synced, not encrypted, lost if site data is cleared).
            </li>
          </ul>
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-violet-500"
              checked={settings.saveHistory === true}
              onChange={(e) => updateSettings({ saveHistory: e.target.checked })}
            />
            <span className="text-slate-200">
              Save my sessions on this device
              <span className="block text-sm text-slate-400">
                {settings.saveHistory === null ? "Not decided yet. You'll be asked after your first session." : settings.saveHistory ? "On." : "Off."}
              </span>
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={sessions.length === 0}
              onClick={() => window.confirm(`Delete all ${sessions.length} saved session(s) from this device?`) && eraseHistory()}
            >
              Delete saved sessions ({sessions.length})
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => window.confirm("Delete all saved sessions and reset settings?") && eraseEverything()}
            >
              Erase all data &amp; reset
            </button>
          </div>
        </section>

        <section className="card space-y-3 p-6" aria-labelledby="srv-h">
          <h2 id="srv-h" className="text-lg font-semibold text-white">
            Server capabilities
          </h2>
          {capabilities.status === "loading" && <p role="status">Checking…</p>}
          {capabilities.status === "unreachable" && <p role="alert" className="text-amber-200">{capabilities.message}</p>}
          {capabilities.status === "ready" && (
            <ul className="space-y-1 text-sm text-slate-300">
              <li>
                Live voice (Vapi): <strong>{capabilities.caps.voice ? "key configured" : "not configured, demo text mode"}</strong>
                {!capabilities.caps.voice && " · set VAPI_PUBLIC_KEY"}
              </li>
              <li>
                AI feedback and topics (OpenAI): <strong>{capabilities.caps.ai ? "key configured" : "not configured"}</strong>
                {!capabilities.caps.ai && " · set OPENAI_API_KEY"}
              </li>
            </ul>
          )}
          <button type="button" className="btn btn-ghost" onClick={refreshCapabilities}>
            Re-check
          </button>
        </section>
      </div>
    </>
  );
}
