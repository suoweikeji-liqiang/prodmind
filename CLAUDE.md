# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProdMind is a cognitive adversarial machine — a TypeScript CLI that uses structured AI-driven debate to help product thinkers validate ideas through systematic falsification. Users go through multi-round debates where AI roles attack, question, and synthesize their product ideas.

## Build & Run Commands

All commands run from `prodmind-cli/`:

```bash
npm run build      # Compile TypeScript (tsc) → dist/
npm run dev        # Run in development via tsx
npm start          # Run compiled dist/index.js
```

No test or lint tooling is configured yet.

## Architecture

The CLI lives entirely in `prodmind-cli/`. ES modules throughout (`"type": "module"`).

### Debate Loop (`src/debate.ts`)

Orchestrates up to 5 rounds of structured debate. Each round follows this sequence:
1. **Architect** defines the core problem from the user's idea
2. User confirms/corrects the problem definition
3. **Assassin** attacks with counterarguments (higher temperature: 0.8)
4. **UserGhost** questions from the user's perspective
5. User defends against attacks (minimum 50 chars required)
6. **Grounder** synthesizes into hypothesis list and MVP boundary

### AI Roles (`src/roles/index.ts`)

Four roles call OpenAI's API, each with a system prompt loaded from `prompts/*.md`:
- `callArchitect()`, `callAssassin()`, `callUserGhost()`, `callGrounder()`
- Default temperature 0.4, Assassin uses 0.8
- 3 retries with 2s delay on network errors

### Conflict Detection Rules (`src/consensus-check.ts`)

Five rules enforce cognitive discipline:
1. **Alternative Hypothesis Block** — forces user to address competing hypotheses
2. **Consensus Alert** — triggers when all roles agree (violates falsification principle)
3. **Tech Escape Interception** — catches deflection to "technology solves this"
4. **Falsification Block Validation** — ensures Grounder output includes how hypothesis could be wrong
5. **Forced Opposition** — if Assassin agrees too much, forces 3+ substantive objections

### Storage (`src/storage.ts`)

- Config: `~/.prodmind/config.json` (API key, base URL, model)
- Sessions: `~/.prodmind/sessions/*.json` (full debate history per session)

### Export (`src/export.ts`)

Converts sessions to Markdown, saved to `~/.prodmind/sessions/YYYY-MM-DD-{name}.md`.

## Key Design Decisions

- System prompts are markdown files in `prompts/` — edit those to change role behavior, not the TypeScript code
- Grounder has a local fallback that generates minimal structure if the API call fails
- The project targets ES2022 with ESNext modules and `moduleResolution: "bundler"`
- The CLI binary is registered as `prodmind` via the `bin` field in package.json
