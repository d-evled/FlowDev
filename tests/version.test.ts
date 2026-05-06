import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loadConfig } from "../src/config.js";
import { buildApp } from "../src/app.js";
import { createLogger } from "../src/observability/logger.js";
import { createMetricsRegistry } from "../src/observability/metrics.js";

describe("GET /version", () => {
  const config = loadConfig({
    ...process.env,
    PORT: "8080",
    READY: "true",
    GIT_SHA: "abc123",
    BUILD_TIME: "2026-05-05T12:00:00Z",
  });
  const logger = createLogger(config);
  const metrics = createMetricsRegistry();
  const app = buildApp(config, logger, metrics);

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns version metadata", async () => {
    const res = await app.inject({ method: "GET", url: "/version" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as {
      version: string;
      gitSha: string;
      buildTime: string;
    };
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(body.gitSha).toBe("abc123");
    expect(body.buildTime).toBe("2026-05-05T12:00:00Z");
  });
});
