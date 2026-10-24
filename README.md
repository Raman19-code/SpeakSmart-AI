# SpeakSmart AI

An AI English speaking coach for students, job seekers and professionals: fluency conversation, impromptu speeches, group discussion and interview practice, with feedback after each session.

## What is real, what is demo

| Capability | Needs | Without it |
| --- | --- | --- |
| Live voice conversation (Vapi) | `VAPI_PUBLIC_KEY` | **Demo mode**: scripted prompts, typed answers. Clearly labelled in the UI. |
| AI feedback, corrections, vocabulary (OpenAI) | `OPENAI_API_KEY` | Button disabled with an explanation. You still get simple word counts computed in the browser (no AI). |
| AI-generated impromptu topics | `OPENAI_API_KEY` | Built-in, hand-written topic bank (labelled). |
| Everything else (UI, timers, settings, history) | nothing | n/a |

The app never shows invented sessions, statistics or evaluations. A new user sees empty states. AI scores are labelled as estimates from a text transcript; **pronunciation, accent and delivery are not analysed**, and the UI says so.

### Testing status (honest)

- **Verified:** typecheck, production build, 31 unit/API tests, and a browser run (Chromium, desktop + 375px mobile) of navigation, empty states, demo sessions, consent-gated saving, topic selection, prep countdown, settings, text size, 404, mic-denied handling.
- **Verified against a mock only:** the AI feedback/topics UI (rendering of corrections, vocabulary, scores, quota error) was exercised against a local fake OpenAI endpoint, not the real API.
- **Not verified:** a real Vapi call and real OpenAI responses. No valid credentials were available. With a deliberately invalid Vapi key the app reached the SDK and showed a handled connection error. **Treat live voice as untested until you try it with your own keys.**

## Architecture

```
Browser (React + Vite + TypeScript + Tailwind v4)        Server (Node + Express + TypeScript)
  pages/        routes                                      routes/api.ts   /api/status /assistant /topics /feedback
  components/   UI (no SDK imports)                         lib/openai.ts   OpenAI calls, JSON validated with zod
  hooks/        useVoiceSession, timers, AppContext         lib/schemas.ts  request + model-output validation
  services/     vapiService (ONLY file touching Vapi),      prompts.ts      coach, interviewer, moderator prompts
                api, microphone, storage                    config.ts       reads .env, hides placeholders
  utils/        transcript folding, local word counts
```

**Why an Express backend:** the OpenAI key must never reach the browser, and the server builds the Vapi assistant (level-aware system prompt) so prompts are not editable client-side. The Vapi *public* key is designed for browsers; the server hands it to the client at session start, so it is not baked into the bundle. In production the Express process also serves the built client (single deploy).

**Storage:** saved sessions and settings use `localStorage` in the current browser. This is **demo-grade**: per device, unencrypted, not synced, lost if site data is cleared. A production multi-user app needs authentication and a database (e.g. Postgres) behind the same `services/storage.ts` interface. Sessions are saved only after the user opts in, and can be deleted in Settings.

## Setup (Windows PowerShell)

Requires Node.js 20 or newer.

```powershell
cd speaksmart-ai
npm install
Copy-Item .env.example .env
notepad .env        # add keys, or leave placeholders to run in demo mode
npm run dev
```

Open http://localhost:5173 (the API runs on port 8787 and is proxied under `/api`). Use a modern Chrome, Edge, Firefox or Safari; the microphone needs `localhost` or HTTPS.

### Environment variables (`.env`, never committed)

| Variable | Purpose |
| --- | --- |
| `PORT`, `CLIENT_ORIGIN` | Server port and allowed browser origin |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Server-side feedback and topics |
| `VAPI_PUBLIC_KEY` | Vapi public key (from the Vapi dashboard) |
| `VAPI_VOICE_PROVIDER`, `VAPI_VOICE_ID` | Voice used by the coach |
| `VAPI_LLM_MODEL` | Model Vapi uses during the live call |

Placeholder values (`your_...`) count as "not configured".

## Scripts

```powershell
npm run dev         # server + client with hot reload
npm run typecheck   # client and server
npm test            # vitest: utils, services, API
npm run build       # typecheck + production client build into dist/
npm start           # run the server (serves dist/ if built)
```

## Manual test checklist

1. No keys: dashboard shows the demo banner and an empty state; Fluency starts a **Demo mode** session; finishing asks for save consent; nothing is stored until you agree.
2. Impromptu: choose a topic, set prep time, watch the countdown, start speaking.
3. Group: topic required; page states all voices are AI. Interview: role required.
4. Settings: change text size, toggle history, delete data.
5. With keys: start a Fluency session, allow the microphone, confirm the orb reacts and the transcript fills, end the session, request AI feedback.
6. Deny the microphone: a clear message appears and no session is shown as active.

## Deployment

```powershell
npm run build
$env:NODE_ENV="production"; npm start
```

Deploy the single Node process (Render, Railway, Fly.io, a VPS) with the environment variables set in the host's dashboard. Serve over HTTPS (required for the microphone). Set `CLIENT_ORIGIN` to your public URL. Before going public: add authentication and a real database, tighten the Content-Security-Policy (currently relaxed for Vapi/Daily media), and restrict the Vapi public key to your domain in the Vapi dashboard. The API has basic rate limiting (40 requests/minute/IP) and input validation.

## Privacy summary

The microphone is used only after you press start and approve the browser prompt. During a live call, audio goes to Vapi for transcription and the AI reply. Transcript text goes to OpenAI (via this server) only when you request feedback. Nothing is stored unless you choose to save it in your own browser.
