import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

let server: Server;
let base = "";

async function boot(env: Record<string, string>) {
  vi.resetModules();
  for (const k of ["OPENAI_API_KEY", "VAPI_PUBLIC_KEY"]) delete process.env[k];
  Object.assign(process.env, env);
  const { createApp } = await import("./app");
  server = createApp().listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

const post = (path: string, body: unknown) =>
  fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const body = async (res: Response) => (await res.json()) as any;

afterEach(() => new Promise<void>((resolve) => server.close(() => resolve())));

describe("without credentials", () => {
  beforeEach(() => boot({}));

  it("reports no capabilities", async () => {
    const res = await fetch(base + "/api/status");
    expect(await res.json()).toEqual({ voice: false, ai: false });
  });

  it("refuses to build an assistant and says why", async () => {
    const res = await post("/api/assistant", { mode: "fluency", level: "beginner" });
    expect(res.status).toBe(503);
    expect((await body(res)).error.code).toBe("VAPI_NOT_CONFIGURED");
  });

  it("returns 503 for feedback instead of inventing an evaluation", async () => {
    const res = await post("/api/feedback", {
      mode: "fluency",
      level: "beginner",
      transcript: [{ role: "learner", text: "I like to play cricket with my friends on every weekend morning at the park." }],
    });
    expect(res.status).toBe(503);
    expect((await body(res)).error.code).toBe("OPENAI_NOT_CONFIGURED");
  });

  it("rejects invalid input with 400", async () => {
    const res = await post("/api/topics", { category: "nope", difficulty: "easy" });
    expect(res.status).toBe(400);
  });

  it("rejects too-short transcripts with 422", async () => {
    const res = await post("/api/feedback", {
      mode: "fluency",
      level: "beginner",
      transcript: [{ role: "learner", text: "Hello" }],
    });
    expect(res.status).toBe(422);
  });

  it("returns a JSON 404 for unknown API routes", async () => {
    const res = await fetch(base + "/api/nothing");
    expect(res.status).toBe(404);
  });
});

describe("with a Vapi key", () => {
  beforeEach(() => boot({ VAPI_PUBLIC_KEY: "pk_test_123" }));

  it("builds a level-aware assistant config", async () => {
    const res = await post("/api/assistant", {
      mode: "interview",
      level: "advanced",
      interviewType: "behavioural",
      role: "AI/ML engineer",
      durationMinutes: 5,
    });
    expect(res.status).toBe(200);
    const json = await body(res);
    expect(json.publicKey).toBe("pk_test_123");
    expect(json.assistant.maxDurationSeconds).toBe(360);
    const prompt = json.assistant.model.messages[0].content as string;
    expect(prompt).toContain("AI/ML engineer");
    expect(prompt).toContain("advanced");
    expect(prompt).toContain("ONE question at a time");
    expect(JSON.stringify(json)).not.toContain("sk-");
  });

  it("labels simulated participants as AI in group mode", async () => {
    const res = await post("/api/assistant", { mode: "group", level: "intermediate", topic: "Remote work" });
    const prompt = (await body(res)).assistant.model.messages[0].content as string;
    expect(prompt).toContain("AI participant");
    expect(prompt).toContain("Remote work");
  });
});
