import pino from "pino";
import type { AppConfig } from "../config.js";

export function createLogger(config: AppConfig) {
  return pino({
    level: config.logLevel,
    base: { service: "agentic-sdlc-service" },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export type Logger = ReturnType<typeof createLogger>;
