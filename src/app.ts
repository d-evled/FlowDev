import Fastify from "fastify";
import type { AppConfig } from "./config.js";
import type { Logger } from "./observability/logger.js";
import type { Metrics } from "./observability/metrics.js";
import { parseOrCreateTraceContext } from "./observability/tracing.js";

export function buildApp(config: AppConfig, logger: Logger, metrics: Metrics) {
  const app = Fastify({
    loggerInstance: logger,
    disableRequestLogging: false,
    genReqId: () => crypto.randomUUID(),
    childLoggerFactory(inheritedLogger, bindings, _opts, rawReq) {
      const tc = parseOrCreateTraceContext(rawReq.headers);
      return inheritedLogger.child({ ...bindings, traceId: tc.traceId });
    },
  });

  app.addHook("onResponse", async (req, reply) => {
    const route = req.routeOptions?.url ?? req.url.split("?")[0] ?? "unknown";
    const labels = {
      method: req.method,
      route,
      status_code: String(reply.statusCode),
    };
    metrics.httpRequestsTotal.inc(labels);
    metrics.httpRequestDurationSeconds.observe(
      labels,
      reply.elapsedTime / 1000,
    );
  });

  app.get("/health", async () => ({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
  }));

  app.get("/version", async () => ({
    version: config.packageVersion,
    gitSha: config.gitSha,
    buildTime: config.buildTime,
  }));

  app.get("/ready", async (_req, reply) => {
    if (!config.ready) {
      return reply.code(503).send({ status: "not_ready" });
    }
    return { status: "ready" };
  });

  app.get("/metrics", async (_req, reply) => {
    reply.header("content-type", metrics.register.contentType);
    return reply.send(await metrics.register.metrics());
  });

  return app;
}
