import type { IncomingHttpHeaders } from "node:http";

/**
 * Placeholder for OpenTelemetry wiring.
 * Point `OTEL_EXPORTER_OTLP_ENDPOINT` at your collector and add `@opentelemetry/sdk-node`
 * when you want distributed traces; until then we propagate trace IDs in logs via `childLoggerFactory`.
 */
export type TraceContext = {
  traceId: string;
};

export function parseOrCreateTraceContext(
  headers: IncomingHttpHeaders,
): TraceContext {
  const traceparent = headers["traceparent"];
  const raw = Array.isArray(traceparent) ? traceparent[0] : traceparent;
  if (typeof raw === "string" && raw.length >= 18) {
    const traceId = raw.slice(3, 35);
    if (/^[0-9a-f]{32}$/i.test(traceId)) {
      return { traceId };
    }
  }
  return { traceId: crypto.randomUUID().replace(/-/g, "") };
}
