import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loadConfig } from "../src/config.js";
import { buildApp } from "../src/app.js";
import { createLogger } from "../src/observability/logger.js";
import { createMetricsRegistry } from "../src/observability/metrics.js";

describe("HTTP API", () => {
  const config = loadConfig({ ...process.env, PORT: "8080", READY: "true" });
  const logger = createLogger(config);
  const metrics = createMetricsRegistry();
  const app = buildApp(config, logger, metrics);

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { status: string };
    expect(body.status).toBe("ok");
  });

  it("GET /ready returns ready when READY is true", async () => {
    const res = await app.inject({ method: "GET", url: "/ready" });
    expect(res.statusCode).toBe(200);
  });

  it("GET /metrics returns prometheus text", async () => {
    const res = await app.inject({ method: "GET", url: "/metrics" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.body).toContain("process_cpu_user_seconds_total");
  });
});
