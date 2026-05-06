# agentic-sdlc-service

Greenfield HTTP service scaffold for a **hybrid Agentic SDLC**: Cursor for implementation, CI/CD for gates and deploy, observability for iteration.

## Run locally

```bash
npm install
npm run dev
```

- `GET /health` — liveness
- `GET /version` — app version, `GIT_SHA`, and `BUILD_TIME` (set in Docker builds)
- `GET /ready` — readiness (503 when `READY=false`)
- `GET /metrics` — Prometheus text

## Test and lint

```bash
npm test
npm run lint
npm run build && npm start
```

## Configuration

See [.env.example](.env.example). Process env vars apply in dev and in containers.

## Production (Cloud Run) — reference


| Item                                 | Value                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| **Region**                           | `us-central1`                                                                    |
| **Service**                          | `flowdev-service` (from deploy workflow)                                         |
| **Service URL (regional example)**   | `https://flowdev-service-210255342646.us-central1.run.app`                       |
| **Deploy log URL (example)**         | `https://flowdev-service-utkcmke5na-uc.a.run.app`                                |
| **Image tag (example first deploy)** | `db6ab88bee0c986e5385c534eff39bfa934e75a3` (`git rev-parse HEAD` at deploy time) |


Cloud Run may show more than one valid URL; use `gcloud run services describe --format='value(status.url)'` for the current canonical URL. For **uptime checks and alerts**, see [docs/runbooks/google-cloud-monitoring.md](docs/runbooks/google-cloud-monitoring.md). For **scraping `/metrics` into Cloud Monitoring (Managed Prometheus sidecar)** vs external Prometheus, see [docs/runbooks/prometheus-scrape-cloud-run.md](docs/runbooks/prometheus-scrape-cloud-run.md).

## Workflow docs

- [docs/agentic-sdlc-playbook.md](docs/agentic-sdlc-playbook.md) — Quick refine, auto-fix, triage-to-intent
- [docs/intent/feature-intent-template.md](docs/intent/feature-intent-template.md) — express intent before implementation
- [docs/deployment.md](docs/deployment.md) — container and CI/CD overview

