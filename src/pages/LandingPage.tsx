import { Link } from "react-router-dom";
import { Orb } from "../components/Orb";
import { MODES } from "../data/modes";

const FEATURES = [
  ["Talk, don't just type", "Practise speaking out loud with a voice coach that listens and replies in real time (requires a Vapi key)."],
  ["Gentle, specific corrections", "Grammar fixes and more natural phrasing, explained in plain language, without shame."],
  ["Vocabulary from your own words", "Suggestions are based on what you actually said, with the nuance and an example sentence."],
  ["Built for real situations", "Impromptu speeches, group discussions and interviews, each with its own flow."],
  ["Feedback you can act on", "After each session: corrections, strengths, areas to improve and next exercises."],
  ["Private by default", "Sessions are saved on your device only if you say yes. You control deletion."],
];

const USE_CASES = [
  ["College students", "Get ready for presentations, viva exams, campus placements and group discussion rounds."],
  ["Job seekers", "Rehearse HR, behavioural and technical interview answers for the role you want."],
  ["Working professionals", "Sound clearer and more confident in meetings, updates and client calls."],
];

export function LandingPage() {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 pt-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-300">AI English speaking coach</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Speak English with confidence, in a space with no pressure.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            SpeakSmart AI helps students, job seekers and professionals practise real conversations, build vocabulary and prepare for interviews and
            group discussions, then turns each session into clear next steps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn btn-primary">
              Start Practising
            </Link>
            <a href="#features" className="btn btn-ghost">
              Explore Features
            </a>
          </div>
        </div>
        <div className="py-6">
          <Orb state="listening" level={0.35} decorative />
        </div>
      </section>

      <section id="features" aria-labelledby="feat-h" className="scroll-mt-24">
        <h2 id="feat-h" className="text-2xl font-bold text-white">
          What you can do
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([t, d]) => (
            <li key={t} className="card p-5">
              <h3 className="font-semibold text-white">{t}</h3>
              <p className="mt-2 text-sm text-slate-300">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="modes-h">
        <h2 id="modes-h" className="text-2xl font-bold text-white">
          Four ways to practise
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {MODES.map((m) => (
            <li key={m.mode}>
              <Link to={m.path} className="card block h-full p-5 hover:bg-white/[0.07]">
                <h3 className="font-semibold text-white">{m.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{m.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="use-h">
        <h2 id="use-h" className="text-2xl font-bold text-white">
          Who it&apos;s for
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {USE_CASES.map(([t, d]) => (
            <li key={t} className="card p-5">
              <h3 className="font-semibold text-white">{t}</h3>
              <p className="mt-2 text-sm text-slate-300">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6 text-sm text-slate-300" aria-labelledby="honest-h">
        <h2 id="honest-h" className="mb-2 text-base font-semibold text-white">
          What to expect
        </h2>
        <p>
          Live voice needs a Vapi key and AI feedback needs an OpenAI key on the server. Without them the app runs in a clearly labelled demo mode with
          scripted prompts and typed answers. AI feedback is an estimate from a text transcript; it does not judge pronunciation or delivery.
        </p>
      </section>
    </div>
  );
}
