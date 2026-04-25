# Runbooks

Operator-focused notes for **agentic-sdlc-service**.

| Doc | Use when |
| --- | --- |
| [common-failures.md](common-failures.md) | Service unhealthy, deploy failed, local dev broken |
| [alerts.md](alerts.md) | Alert fired or you are defining new SLOs |

## Endpoints

| Path | Purpose |
| --- | --- |
| `/health` | Liveness — process up |
| `/ready` | Readiness — returns 503 when `READY=false` |
| `/metrics` | Prometheus exposition format |
