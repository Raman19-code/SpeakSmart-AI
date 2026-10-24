import { Router } from "express";
import { capabilities, config } from "../config";
import { ApiError } from "../lib/errors";
import { completeJson } from "../lib/openai";
import {
  assistantRequestSchema,
  feedbackModelSchema,
  feedbackRequestSchema,
  topicsModelSchema,
  topicsRequestSchema,
} from "../lib/schemas";
import {
  buildFeedbackUserPrompt,
  buildSystemPrompt,
  buildTopicsPrompt,
  feedbackSystemPrompt,
  firstMessageFor,
} from "../prompts";

export const api = Router();

const ESTIMATE_NOTICE =
  "AI-generated estimate based only on the text transcript. It is not an objective measure of your speaking ability and does not assess pronunciation or delivery.";

/** What this server can really do right now. The client uses it to pick live vs demo mode. */
api.get("/status", (_req, res) => {
  res.json(capabilities());
});

/** Builds a transient Vapi assistant config for a session and returns the (public) Vapi key. */
api.post("/assistant", (req, res) => {
  const parsed = assistantRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "INVALID_INPUT", "Invalid session settings.");
  if (!config.vapiPublicKey) {
    throw new ApiError(503, "VAPI_NOT_CONFIGURED", "Voice is not configured. Set VAPI_PUBLIC_KEY in .env.");
  }
  const body = parsed.data;
  const assistant = {
    name: "SpeakSmart Coach",
    firstMessage: firstMessageFor(body),
    maxDurationSeconds: body.durationMinutes * 60 + 60,
    transcriber: { provider: "deepgram", model: "nova-2", language: "en" },
    model: {
      provider: "openai",
      model: config.vapiLlmModel,
      temperature: 0.6,
      messages: [{ role: "system", content: buildSystemPrompt(body) }],
    },
    voice: { provider: config.vapiVoiceProvider, voiceId: config.vapiVoiceId },
  };
  res.json({ publicKey: config.vapiPublicKey, assistant });
});

/** AI-generated impromptu topics. 503 when OpenAI is not configured (the client then uses its built-in bank). */
api.post("/topics", async (req, res) => {
  const parsed = topicsRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "INVALID_INPUT", "Invalid topic request.");
  const { category, difficulty, count } = parsed.data;
  const out = await completeJson(
    "You write concise speaking prompts for English learners. Reply with JSON only.",
    buildTopicsPrompt(category, difficulty, count),
    topicsModelSchema,
  );
  res.json({
    source: "ai",
    topics: out.topics.map((t, i) => ({
      id: `ai-${Date.now()}-${i}`,
      category,
      difficulty,
      title: t.title,
      prompt: t.prompt,
    })),
  });
});

/** Post-session evaluation of a text transcript. */
api.post("/feedback", async (req, res) => {
  const parsed = feedbackRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "INVALID_INPUT", "Invalid transcript.");
  const learnerWords = parsed.data.transcript
    .filter((t) => t.role === "learner")
    .map((t) => t.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  if (learnerWords < 15) {
    throw new ApiError(422, "TRANSCRIPT_TOO_SHORT", "Speak a little more before asking for feedback (at least a few sentences).");
  }
  const report = await completeJson(feedbackSystemPrompt, buildFeedbackUserPrompt(parsed.data), feedbackModelSchema);
  res.json({ source: "ai", notice: ESTIMATE_NOTICE, report });
});
