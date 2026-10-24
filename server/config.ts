import "dotenv/config";

/** Treat empty values and the placeholders from .env.example as "not configured". */
function real(value: string | undefined): string {
  const v = (value ?? "").trim();
  if (!v || v.startsWith("your_")) return "";
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  clientOrigin: process.env.CLIENT_ORIGIN?.trim() || "http://localhost:5173",
  openaiKey: real(process.env.OPENAI_API_KEY),
  openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  vapiPublicKey: real(process.env.VAPI_PUBLIC_KEY),
  vapiVoiceProvider: process.env.VAPI_VOICE_PROVIDER?.trim() || "vapi",
  vapiVoiceId: process.env.VAPI_VOICE_ID?.trim() || "Elliot",
  vapiLlmModel: process.env.VAPI_LLM_MODEL?.trim() || "gpt-4o-mini",
};

export const capabilities = () => ({
  voice: Boolean(config.vapiPublicKey),
  ai: Boolean(config.openaiKey),
});
