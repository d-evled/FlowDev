# Alerts (stubs)

Define alerts in your monitoring stack (Prometheus + Alertmanager, Datadog, etc.) using metrics from `GET /metrics`.

## Suggested starter rules

| Alert | Query / condition (conceptual) | Severity | Runbook |
| --- | --- | --- | --- |
| High5xxRate | Rate of HTTP 5xx responses high for route | critical | [common-failures.md](common-failures.md) |
| ReadyCheckFailing | `/ready` returns 503 for sustained period | warning | Drain / dependency section |
| HighLatency | `http_request_duration_seconds` p99 over SLO | warning | Scale or profile app |

## Metrics emitted

- `http_requests_total{method,route,status_code}` — request counts
- `http_request_duration_seconds_bucket` — latency histogram
- Default Node metrics from `prom-client` (CPU, memory, event loop)

## Tuning

- Set SLOs per route once you have baseline traffic.
- Pair each alert with an **owner** and link to the **triage intent** template in the main playbook.
