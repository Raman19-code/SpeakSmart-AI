import OpenAI from "openai";
import type { ZodType } from "zod";
import { config } from "../config";
import { ApiError } from "./errors";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!config.openaiKey) {
    throw new ApiError(503, "OPENAI_NOT_CONFIGURED", "OpenAI is not configured on the server. Set OPENAI_API_KEY in .env.");
  }
  client ??= new OpenAI({ apiKey: config.openaiKey, timeout: 30_000, maxRetries: 1 });
  return client;
}

/** Ask the model for a JSON object and validate it against a schema. */
export async function completeJson<T>(system: string, user: string, schema: ZodType<T>): Promise<T> {
  let text: string | null | undefined;
  try {
    const res = await getClient().chat.completions.create({
      model: config.openaiModel,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    text = res.choices[0]?.message?.content;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const status = (err as { status?: number }).status;
    if (status === 401) throw new ApiError(502, "OPENAI_AUTH", "OpenAI rejected the server's API key.");
    if (status === 429) throw new ApiError(429, "OPENAI_RATE_LIMIT", "The AI service is busy or over quota. Try again shortly.");
    throw new ApiError(502, "OPENAI_UNAVAILABLE", "Could not reach the AI service. Check your connection and try again.");
  }

  if (!text) throw new ApiError(502, "OPENAI_EMPTY", "The AI service returned an empty response.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(502, "OPENAI_BAD_JSON", "The AI service returned an unreadable response.");
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError(502, "OPENAI_BAD_SHAPE", "The AI service returned an unexpected response format.");
  }
  return result.data;
}
