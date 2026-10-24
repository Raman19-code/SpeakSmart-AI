import { capabilities, config } from "./config";
import { createApp } from "./app";

const app = createApp();
app.listen(config.port, () => {
  const c = capabilities();
  console.log(`SpeakSmart API listening on http://localhost:${config.port}`);
  console.log(`  OpenAI (feedback/topics): ${c.ai ? "configured" : "NOT configured, so demo/local fallbacks apply"}`);
  console.log(`  Vapi (live voice):        ${c.voice ? "configured" : "NOT configured, so text demo mode applies"}`);
});
