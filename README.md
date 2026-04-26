# agentic-sdlc-service

Greenfield HTTP service scaffold for a **hybrid Agentic SDLC**: Cursor for implementation, CI/CD for gates and deploy, observability for iteration.

## Run locally

```bash
npm install
npm run dev
```

- `GET /health` — liveness
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

## Workflow docs

- [docs/agentic-sdlc-playbook.md](docs/agentic-sdlc-playbook.md) — Quick refine, auto-fix, triage-to-intent
- [docs/intent/feature-intent-template.md](docs/intent/feature-intent-template.md) — express intent before implementation
- [docs/deployment.md](docs/deployment.md) — container and CI/CD overview

