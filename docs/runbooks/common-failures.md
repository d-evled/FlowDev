# Common failures

## `/ready` returns 503

**Symptom:** Orchestrator or load balancer marks instance not ready.

**Cause:** `READY` env var is `false` (draining, dependency check failed, or misconfiguration).

**Mitigation:**

1. Confirm intentional drain; if not, set `READY=true` and redeploy.
2. If you add real dependencies later, document them here and gate `/ready` on their health.

## High error rate after deploy

**Symptom:** Elevated 5xx or log errors.

**Mitigation:**

1. Roll back to previous image tag (see [deployment.md](../deployment.md)).
2. Open a **new intent** for the fix cycle (see [agentic-sdlc-playbook.md](../agentic-sdlc-playbook.md) — auto-fix path).

## `/metrics` scrape failures

**Symptom:** Prometheus or agent cannot scrape.

**Mitigation:**

1. Confirm port `8080` (or `PORT`) is exposed on the task/pod.
2. Check network policies allowing scrape from the monitoring tier.

## Docker build fails in CI

**Symptom:** `docker/build-push-action` errors.

**Mitigation:**

1. Reproduce locally: `docker build -t test:local .` after `npm ci && npm run build`.
2. Ensure `package-lock.json` is committed so `npm ci` is deterministic.
