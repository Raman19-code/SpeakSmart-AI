import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/practice/fluency", label: "Fluency" },
  { to: "/practice/impromptu", label: "Impromptu" },
  { to: "/practice/group", label: "Group" },
  { to: "/practice/interview", label: "Interview" },
  { to: "/vocabulary", label: "Vocabulary" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <span aria-hidden="true" className="inline-block h-6 w-6 rounded-full bg-gradient-to-br from-brand-300 to-brand-600" />
            SpeakSmart <span className="text-brand-300">AI</span>
          </Link>
          <div className="md:hidden">
            <button
              type="button"
              className="btn btn-ghost"
              aria-expanded={open}
              aria-controls="site-nav"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
          <nav
            id="site-nav"
            aria-label="Main"
            className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b border-white/10 bg-ink-900 p-3 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0`}
          >
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-slate-400">
        <p className="mx-auto max-w-3xl">
          SpeakSmart AI is a practice tool. AI feedback is an estimate based on a text transcript, not an objective measure of your speaking
          ability, and it does not assess pronunciation or delivery. Coaches and group participants are AI.
        </p>
      </footer>
    </div>
  );
}
