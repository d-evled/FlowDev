# Deployment

This service ships as a **Linux container** built from the root [Dockerfile](../Dockerfile).

## CI

- **Pull requests and `main`**: [.github/workflows/ci.yml](../.github/workflows/ci.yml) runs lint, tests, TypeScript build, and a **non-publishing** Docker build for cache validation.

## Deploy workflow (human approval)

The [Deploy workflow](../.github/workflows/deploy.yml) uses `workflow_dispatch` and a GitHub **Environment** named `production`:

1. In the GitHub repo, create an environment **production** with **required reviewers** (and optional protection rules on branches).
2. Run **Actions → Deploy → Run workflow**, passing an **image tag** (for example the commit SHA or a semver tag).
3. The workflow builds the image, runs a **container smoke test** (`GET /health`), and prints the next step to push to your registry.

### Wiring your registry

Replace the “Placeholder — push to registry” step with your provider’s login and `docker push` (GHCR, ECR, GCR, etc.). Keep tags immutable where possible.

### Runtime configuration

Set the same variables as [.env.example](../.env.example): `PORT`, `HOST`, `LOG_LEVEL`, `READY`.

### Rollback

Redeploy the previous known-good image tag via the same workflow, or revert the release commit and redeploy.
