# Agent instructions

This repository follows the **Agentic SDLC** described in [docs/agentic-sdlc-playbook.md](docs/agentic-sdlc-playbook.md).

## Quick norms

1. Start from **intent** (`docs/intent/` template) before large edits.
2. Keep changes **small and testable**; run `npm test` and `npm run lint`.
3. Update **docs** when behavior, configuration, or failure modes change.
4. Use the **agentic-feature-cycle** skill in `.cursor/skills/agentic-feature-cycle/SKILL.md` for end-to-end feature work.

## Commands

| Command        | Purpose        |
| -------------- | -------------- |
| `npm run dev`  | Local server   |
| `npm test`     | Unit tests     |
| `npm run lint` | ESLint         |
| `npm run build`| Production JS  |
