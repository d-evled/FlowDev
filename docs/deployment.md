# Deployment

This service ships as a **Linux container** built from the root [Dockerfile](../Dockerfile).

## CI

- **Pull requests and `main`**: [.github/workflows/ci.yml](../.github/workflows/ci.yml) runs lint, tests, TypeScript build, and a **non-publishing** Docker build for cache validation.

## Deploy workflow (human approval)

The [Deploy workflow](../.github/workflows/deploy.yml) uses `workflow_dispatch` and a GitHub **Environment** named `production`:

1. Configure secrets and variables (Cloud Run section below).
2. Run **Actions → Deploy → Run workflow**, passing an **image tag** (for example your latest commit SHA).
3. Approve the **production** environment when prompted.
4. The workflow pushes to **Artifact Registry**, deploys to **Cloud Run**, then curls `/health` and **`/version`** on the live URL.

### Runtime configuration

Cloud Run sets `LOG_LEVEL=info` and `READY=true` by default in the workflow. Adjust flags in `deploy.yml` or use `--set-env-vars` / secrets as needed.

**`/version`:** `GIT_SHA` and `BUILD_TIME` are injected at **`docker build`** time (`Dockerfile` `ARG`/`ENV`). They identify what revision is running; override via rebuild/redeploy, not ad hoc Cloud Run env edits alone.

### Rollback

Redeploy a previous image tag via the same workflow (use the known-good tag), or run `gcloud run deploy` with that image.

---

## Google Cloud Run (Artifact Registry)

### 1) GCP project (you already did this)

You should have:

- A **project ID**
- **Billing** enabled (required for Cloud Run + Artifact Registry)
- APIs enabled: Cloud Run, Artifact Registry (Cloud Build optional)

### 2) Artifact Registry repository

Create a **Docker** repository and note:

- **Location** (region), e.g. `us-central1`
- **Repository ID** (short name), e.g. `flowdev`

Images will be:

`REGION-docker.pkg.dev/PROJECT_ID/REPO_ID/flowdev:TAG`

### 3) Cloud Run service name

Pick a service name (e.g. `flowdev-service`). First deploy **creates** the service if it does not exist.

### 4) Service account for GitHub Actions (deploy bot)

Create a dedicated service account, for example `github-deployer@PROJECT_ID.iam.gserviceaccount.com`.

Grant it **project-level** roles (simplest first-time setup):

| Role | Why |
| --- | --- |
| `roles/run.admin` | Deploy and update Cloud Run services |
| `roles/artifactregistry.writer` | Push images to Artifact Registry |
| `roles/iam.serviceAccountUser` | Act as the runtime service account when deploying |

Create a **JSON key** for this service account (GitHub → secret `GCP_SA_KEY`). Rotate keys periodically; long-term prefer **Workload Identity Federation** (no key).

### 5) GitHub repository configuration

**Settings → Secrets and variables → Actions**

**Secret:**

| Name | Value |
| --- | --- |
| `GCP_SA_KEY` | Full contents of the service account JSON key file |

**Variables:**

| Name | Example |
| --- | --- |
| `GCP_PROJECT_ID` | `my-project-123` |
| `GCP_REGION` | `us-central1` |
| `GCP_ARTIFACT_REPOSITORY` | `flowdev` (the Artifact Registry **repository ID**) |
| `CLOUD_RUN_SERVICE` | `flowdev-service` |

### 6) First deploy

1. Push `main` so `.github/workflows/deploy.yml` includes the Cloud Run steps.
2. **Actions → Deploy → Run workflow**
3. **image tag**: paste current commit SHA from `git rev-parse HEAD`, or a tag like `v0.1.0`.
4. Approve the **production** environment.
5. Open the Cloud Run URL printed in the job log; hit `/health`, `/ready`, `/metrics`.

### 7) Lock down later (recommended)

- Replace `--allow-unauthenticated` with IAM-only access if the API should not be public.
- Move secrets (API keys) to **Secret Manager** and mount into Cloud Run.
- Switch GitHub auth from JSON key to **Workload Identity Federation**.
