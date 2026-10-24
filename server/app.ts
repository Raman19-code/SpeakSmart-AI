import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { config } from "./config";
import { ApiError } from "./lib/errors";
import { api } from "./routes/api";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: false, // Vapi/Daily load remote media and workers; tighten per deployment.
    }),
  );
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: "200kb" }));
  app.use("/api", rateLimit({ windowMs: 60_000, limit: 40, standardHeaders: true, legacyHeaders: false }));
  app.use("/api", api);
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Unknown API route." } });
  });

  // Serve the built client when it exists (single-process deployment).
  const dist = path.resolve(process.cwd(), "dist");
  if (fs.existsSync(path.join(dist, "index.html"))) {
    app.use(express.static(dist));
    app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));
  }

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message } });
      return;
    }
    if (err && typeof err === "object" && (err as { type?: string }).type === "entity.parse.failed") {
      res.status(400).json({ error: { code: "INVALID_JSON", message: "Request body is not valid JSON." } });
      return;
    }
    console.error("Unhandled error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong on the server." } });
  };
  app.use(onError);
  return app;
}
