# Scrape `/metrics` on Cloud Run (Prometheus)

Your app already exposes **`GET /metrics`** (Prometheus text). On GCP there are two realistic patterns:

| Approach | Best for | Notes |
| --- | --- | --- |
| **A. Managed Service for Prometheus sidecar** (GCP-native) | Production on Cloud Run | Collector runs **next to** your app and scrapes **`127.0.0.1:8080/metrics`**. No need to expose metrics on the public URL for collection. |
| **B. External Prometheus** | Quick test, self-hosted, homelab | Scrapes your **public** HTTPS URL. Works only if `/metrics` is reachable (e.g. `--allow-unauthenticated`). **Do not** rely on this if you later lock down the service. |

Official reference: [Use the Prometheus sidecar for Cloud Run](https://docs.cloud.google.com/stackdriver/docs/managed-prometheus/cloudrun-sidecar) and [Write Prometheus metrics using the sidecar](https://cloud.google.com/run/docs/monitoring-managed-prometheus-sidecar).

---

## A) Google Managed Service for Prometheus (recommended)

### What you get

- The sidecar scrapes your app container on **port `8080`**, path **`/metrics`**, on the **same Cloud Run instance** (default interval ~30s unless you customize `RunMonitoring`).
- Metrics flow into **Managed Service for Prometheus** and appear in **Cloud Monitoring** PromQL / Metrics Explorer.

### Prerequisites

1. **Multi-container (sidecar)** enabled on your Cloud Run service (second generation execution environment).
2. Name your **application** container **`app`** (the dependency annotation expects that name).
3. App listens on **`8080`** with **`/metrics`** (this repo already does).
4. Google recommends **CPU always allocated** for reliable scraping under low traffic; see Cloud Run **billing / CPU** settings.

### One-time: enable APIs (if prompted)

In Cloud Console or:

```bash
gcloud services enable monitoring.googleapis.com run.googleapis.com artifactregistry.googleapis.com
```

### Deploy pattern

Your current GitHub Action uses **`gcloud run deploy` with a single image**. The sidecar requires a **multi-container** service definition.

**Practical path:**

1. Build and push the app image the same way you do today (CI already does this).
2. Take the sample manifest [`cloud-run-with-gmp-sidecar.sample.yaml`](../deploy/cloud-run-with-gmp-sidecar.sample.yaml), substitute:
   - service name, region, image URI, env vars
   - sidecar image tag (pin to the version Google documents; update when they ship new releases)
3. Apply:

   ```bash
   gcloud run services replace path/to/service.yaml --region REGION
   ```

4. Verify in **Observability → Metrics explorer** (Prometheus / PromQL) or the **Managed Prometheus** UI if enabled for your project.

### Console alternative

Cloud Run → your service → **Edit & deploy new revision** → **Containers** → add the **Managed Prometheus** collector container per Google’s UI (wording changes over time). Ensure **container dependencies** match: collector starts after `app`.

### Security note

After the sidecar is in place, consider **removing public access to `/metrics`** (restrict with IAM / ingress) so only Google’s collection path and your approved monitors can see metrics.

---

## B) External Prometheus scraping the public URL

Use only if you intentionally expose `/metrics` without auth.

Example `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: flowdev
    scheme: https
    static_configs:
      - targets: ["flowdev-service-210255342646.us-central1.run.app"]
    metrics_path: /metrics
    scrape_interval: 30s
```

Point Prometheus at your real hostname. For auth-required Cloud Run, use a scraper that obtains an **identity token** (not covered here).

---

## Alerts on Prometheus metrics (after ingestion)

Once metrics show up in Cloud Monitoring (sidecar path):

1. **Observability → Alerting → Create policy**
2. Use **PromQL** or the metrics picker for Prometheus targets (wording: **Prometheus Query** / **Managed Prometheus** depending on UI).
3. Example ideas (tune to your metric names):
   - Rate of `http_requests_total` with `status_code=~"5.."`
   - High histogram quantile on `http_request_duration_seconds`

Pair alerts with [alerts.md](alerts.md) and [common-failures.md](common-failures.md).

---

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No custom metrics | Sidecar running? Container named **`app`**? Port **8080**? Dependency annotation present? |
| Missed scrapes on cold instances | Enable **CPU always allocated** or accept occasional gaps at very low QPS (Google documents this). |
| Still only seeing generic Cloud Run metrics | Sidecar / Managed Prometheus not fully deployed, or looking in wrong workspace. |

---

## CI/CD follow-up (optional)

To automate sidecar deploys, replace the single `gcloud run deploy` step with **`gcloud run services replace`** using a templated YAML (e.g. `envsubst` on deploy). Keep the image URI aligned with the Artifact Registry tag your workflow already pushes.
