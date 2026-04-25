# Agentic SDLC playbook

This repository implements a **hybrid** loop: Cursor for implementation and review prep, **CI/CD** for automated gates and deploy, and **observability** for production learning.

## Main cycle (hours–days per full rotation)

1. **Express intent** — Capture problem, users, acceptance criteria, non-goals (`docs/intent/feature-intent-template.md`).
2. **Agent understands** — Plan: scope, files, tests, risks; align with a human when ambiguous.
3. **Agent implements** — Small PRs, conventional commits optional but encouraged.
4. **Agent tests + docs** — `npm test`, `npm run lint`; update runbooks and deployment docs when behavior changes.
5. **Human review** — Use [.cursor/rules/pr-review.mdc](../.cursor/rules/pr-review.mdc) checklist; focus on correctness, security, operability.
6. **Deploy and ship** — [Deploy workflow](../.github/workflows/deploy.yml) with **production** environment approval; extend with registry push to your cloud.
7. **Monitoring and observability** — Scrape `/metrics`; tune alerts in [runbooks/alerts.md](runbooks/alerts.md).
8. **Learn and iterate** — Incidents, SLO burn, and product feedback become the **next intent**; the cycle repeats.

## Quick refine (shortcut)

Use when **review** shows the work does not match what we should have built.

- Do **not** stack drive-by commits on a fuzzy goal.
- Update the **intent** (criteria, scope, non-goals), then re-run plan → implement → tests → review.

This maps the dotted line from **human review** back to **express intent** in the Agentic SDLC diagram.

## Auto-fix path (shortcut)

Use when **monitoring** shows a production defect or regression.

1. Write a **short new intent** (even a bullet list): symptom, impact, hypothesis, acceptance tests.
2. Agent implements in a branch; **same CI and review gates** as feature work.
3. Deploy via the same pipeline; prefer **rollback** first if user impact is severe.

True unattended auto-merge is **out of scope** until you explicitly add trusted bots, canaries, and policy—this repo keeps humans in the loop for production.

## Triage → intent (on-call)

When an alert fires:

1. Acknowledge and mitigate (scale, rollback, feature flag).
2. File a **triage note** (issue or doc) with timestamps, queries used, and customer impact.
3. Promote to a **feature intent** or **bugfix intent** for the next development cycle so the agent has crisp criteria.

## Roles

| Step | Primary owner |
| --- | --- |
| Intent, review, learn | Human |
| Plan, code, tests, local docs draft | Agent (with human checkpoints) |
| CI truth, image build, gated deploy | Automation |
