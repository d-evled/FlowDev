---
name: agentic-feature-cycle
description: Run one Agentic SDLC cycle for a feature or fix in this repo—from intent through tests, docs, and PR notes.
---

# Agentic feature cycle

Use this skill when implementing a **feature**, **bugfix**, or **operational improvement** in `agentic-sdlc-service`.

## 1. Express intent

- Read or create an intent doc from `docs/intent/feature-intent-template.md`.
- If the user only gave a vague idea, restate **problem**, **users**, **acceptance criteria**, and **non-goals** in your plan and ask for confirmation when criteria are missing.

## 2. Agent understands

- Outline: approach, files to change, tests to add/update, doc updates (README, runbooks, deployment).
- Call out **risks** (breaking API, migrations, new secrets).

## 3–4. Implement, test, document

- Implement with small, reviewable diffs.
- Run `npm test` and `npm run lint` before finishing.
- Update docs touched by behavior: env vars, endpoints, alerts, rollout.

## 5. Human review prep

- PR description must include: **intent link**, **summary**, **how to verify**, **rollback** (e.g. revert PR, image tag).
- Flag anything that should block merge: auth, data loss, SLO impact.

## 6–8. Deploy, observe, iterate (human-led)

- Merge follows team process; deploy uses `.github/workflows/deploy.yml` (manual approval).
- After ship: note which **dashboards/alerts** validate the change; if monitors fire, open a **new intent** for the fix loop—do not silently patch production.
