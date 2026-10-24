import type {
  Capabilities,
  Category,
  Difficulty,
  FeedbackReport,
  SessionConfig,
  Topic,
  TranscriptEntry,
} from "../types";

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === "TimeoutError";
    throw new ApiClientError(
      timedOut ? "TIMEOUT" : "NETWORK",
      timedOut
        ? "The server took too long to respond. Please try again."
        : "Could not reach the SpeakSmart server. Make sure it is running and that you are online.",
    );
  }
  const data = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  if (!res.ok) {
    throw new ApiClientError(
      data?.error?.code ?? `HTTP_${res.status}`,
      data?.error?.message ?? `The server returned an error (${res.status}).`,
      res.status,
    );
  }
  return data as T;
}

export const getStatus = () => request<Capabilities>("/api/status");

export interface AssistantResponse {
  publicKey: string;
  assistant: Record<string, unknown>;
}
export const createAssistant = (config: SessionConfig) => request<AssistantResponse>("/api/assistant", config);

export const generateTopics = (category: Category, difficulty: Difficulty, count = 3) =>
  request<{ source: "ai"; topics: Topic[] }>("/api/topics", { category, difficulty, count });

export interface FeedbackResponse {
  source: "ai";
  notice: string;
  report: FeedbackReport;
}
export const requestFeedback = (config: SessionConfig, transcript: TranscriptEntry[]) =>
  request<FeedbackResponse>("/api/feedback", {
    mode: config.mode,
    level: config.level,
    topic: config.topic,
    role: config.role,
    transcript: transcript.map(({ role, text }) => ({ role, text: text.slice(0, 2000) })).slice(-200),
  });
