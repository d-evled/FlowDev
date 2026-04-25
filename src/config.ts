export type AppConfig = {
  port: number;
  host: string;
  logLevel: string;
  /** When false, /ready returns not ready (for drain / dependency checks). */
  ready: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = Number(env.PORT ?? "8080");
  const host = env.HOST ?? "0.0.0.0";
  const logLevel = env.LOG_LEVEL ?? "info";
  const ready = env.READY !== "false";

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("PORT must be a positive number");
  }

  return { port, host, logLevel, ready };
}
