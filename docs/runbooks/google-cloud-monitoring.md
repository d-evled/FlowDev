# Google Cloud Monitoring (Cloud Run)

Use this for **uptime** and **SLO-style** alerts on the FlowDev service in **us-central1**.

## Your service URLs (reference)

Cloud Run can show more than one valid URL (regional vs default). Either form may work; **pick one** for checks and docs (the URL from `gcloud run services describe --format='value(status.url)'` is canonical for that moment).

| Kind | Example (yours) |
| --- | --- |
| Service URL (regional) | `https://flowdev-service-210255342646.us-central1.run.app` |
| Deploy log “Deployed to” | `https://flowdev-service-utkcmke5na-uc.a.run.app` |

**Uptime check:** use the **hostname** only, e.g. `flowdev-service-210255342646.us-central1.run.app`, path `/health`, **HTTPS** port **443**.

**Prometheus `/metrics`:** uptime checks are not a substitute for metric ingestion. Use **Managed Service for Prometheus** with the Cloud Run sidecar (recommended) or an external Prometheus scraper—see [prometheus-scrape-cloud-run.md](prometheus-scrape-cloud-run.md).

---

## 0) Prereqs

- APIs: **Cloud Monitoring** / **Cloud Logging** are on by default when using Cloud Run.
- Permissions: your Google account needs **Editor** or at least **Monitoring Admin** + **Uptime check config** (or use a custom role with `monitoring.*` and `monitoring.uptimeCheckConfigs.*`).

---

## 1) Uptime check on `/health` (start here)

1. Open [Google Cloud Console](https://console.cloud.google.com/) → select the **same GCP project** you use for Cloud Run.
2. **Observability** → **Uptime** (or **Monitoring** → **Uptime**).
3. **Create uptime check**:
   - **Protocol:** HTTPS
   - **Resource type:** URL
   - **Host:** `flowdev-service-210255342646.us-central1.run.app` (no `https://`)
   - **Path:** `/health`
   - **Check interval:** 1 min (or 5 min to reduce noise while learning)
   - **Timeout:** 10s
   - **Regions:** at least one outside your region (multi-region) if offered, so a local outage is still visible; for a first check, “Global”/default is fine.
4. **Save** and wait for the first green results (can take a few minutes).

**Why this first:** it catches “the service is down / DNS / routing / app not listening” with almost no tuning.

---

## 2) Alert when the uptime check fails

1. **Observability** → **Alerting** → **Create policy** (or **Edit** the check and add an alert).
2. **Create policy** with one condition:
   - **Condition type:** Uptime check health
   - **Uptime check:** the check you created
   - **Condition:** e.g. “Failure of **1** region for **1** minute” (tighten later to avoid flakiness: e.g. 2 of 3 regions, 5 minutes).
3. **Notification channels:** add **Email** (or PagerDuty/Slack if you use them) and **Save**.

You should get an email when `/health` is not returning success for the configured window.

---

## 3) Alert on high server-side errors (5xx)

Cloud Run exposes metrics under resource type **`Cloud Run Revision`** (`cloud_run_revision`).

### Option A — Console (metrics picker)

1. **Observability** → **Alerting** → **Create policy**.
2. **Select a metric** → filter resource type **Cloud Run Revision**.
3. Look for **`Request count`** (metric may appear as `run.googleapis.com/request_count` in API).
4. **Add filter** (if the UI offers it) to **response code class = 5xx** or HTTP status 5xx (wording varies by UI version).
5. Set **condition** to “rate > 0 for 5 minutes” or “rate > X/sec” once you know baseline traffic.

If the UI does not filter 5xx easily, use **Option B**.

### Option B — Log-based metric (reliable for 5xx)

1. **Logging** → **Logs Explorer** → query for your service, e.g.:

   ```
   resource.type="cloud_run_revision"
   resource.labels.service_name="flowdev-service"
   httpRequest.status>=500
   ```

2. **Create log-based metric** (counter) from that filter.
3. **Alerting** → create policy on that metric: “> 0 in 5m” (tune to your traffic).

---

## 4) Latency alert (optional, needs baseline)

1. **Metrics explorer** → resource **Cloud Run Revision** → metric **`Request latencies`** (or `run.googleapis.com/request_latencies`).
2. Filter to your **service name** = `flowdev-service`.
3. Use **p95** or **p99** over 5–15 minutes.
4. Set threshold after you observe normal traffic (e.g. p95 &lt; 500ms for a simple API).

---

## 5) Notification channels (do this once)

1. **Observability** → **Alerting** → **Notification channels** (or **Edit notification channels**).
2. Add **Email** (verify), add **Slack** / **PagerDuty** if needed.
3. Attach channels to each alert policy.

---

## 6) Runbook links

When an alert fires:

1. **Cloud Run** → service **flowdev-service** → **Logs** / **Revisions** (bad rollout?).
2. **Error Reporting** (if enabled) for stack traces.
3. App runbooks: [common-failures.md](common-failures.md), [alerts.md](alerts.md).

---

## Quick verify commands (optional)

```bash
gcloud run services describe flowdev-service --region us-central1 --format='value(status.url)'
curl -fsS "$(gcloud run services describe flowdev-service --region us-central1 --format='value(status.url)')/health"
```

Replace `flowdev-service` / region if yours differ.
