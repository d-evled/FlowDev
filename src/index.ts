import { loadConfig } from "./config.js";
import { buildApp } from "./app.js";
import { createLogger } from "./observability/logger.js";
import { createMetricsRegistry } from "./observability/metrics.js";

const config = loadConfig();
const logger = createLogger(config);
const metrics = createMetricsRegistry();
const app = buildApp(config, logger, metrics);

try {
  await app.listen({ port: config.port, host: config.host });
  logger.info({ port: config.port, host: config.host }, "server listening");
} catch (err) {
  logger.error({ err }, "failed to start server");
  process.exit(1);
}

const shutdown = async (signal: string) => {
  logger.info({ signal }, "shutdown requested");
  await app.close();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
