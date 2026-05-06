import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type AppConfig = {
  port: number;
  host: string;
  logLevel: string;
  /** When false, /ready returns not ready (for drain / dependency checks). */
  ready: boolean;
  /** From package.json at startup. */
  packageVersion: string;
  /** Git revision (set via GIT_SHA in Docker / CI). */
  gitSha: string;
  /** Build timestamp (set via BUILD_TIME in Docker / CI). */
  buildTime: string;
};

function readPackageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(here, "..", "package.json");
  const raw = readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(raw) as { version?: string };
  return pkg.version ?? "0.0.0";
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = Number(env.PORT ?? "8080");
  const host = env.HOST ?? "0.0.0.0";
  const logLevel = env.LOG_LEVEL ?? "info";
  const ready = env.READY !== "false";
  const packageVersion = readPackageVersion();
  const gitSha = env.GIT_SHA?.trim() || "unknown";
  const buildTime = env.BUILD_TIME?.trim() || "unknown";

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("PORT must be a positive number");
  }

  return {
    port,
    host,
    logLevel,
    ready,
    packageVersion,
    gitSha,
    buildTime,
  };
}
