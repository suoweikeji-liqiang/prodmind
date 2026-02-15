# ProdMind

A cognitive adversarial machine that stress-tests your product ideas before you build them.

## What It Does

ProdMind runs structured AI debates against your product thinking. Instead of asking "is this a good idea?", it forces systematic falsification — the same principle scientists use to test hypotheses.

You describe a product idea. Four AI roles then challenge it across multiple rounds:

- **Architect** — defines the core problem your idea claims to solve
- **Assassin** — attacks with counterarguments, edge cases, and alternative explanations
- **User Ghost** — questions from the end user's perspective
- **Grounder** — synthesizes everything into testable hypotheses, MVP boundaries, and next actions

## How It Works

Each debate round follows a strict protocol:

1. Architect frames the problem → you confirm or correct
2. Assassin + User Ghost attack in parallel → you must defend (minimum 50 words, no hand-waving)
3. Grounder synthesizes into structured output: hypothesis list, falsification checks, and minimum viable actions

Five conflict detection rules enforce intellectual honesty:

- **Alternative Hypothesis Block** — when a role proposes a competing explanation, you must address it directly (accept, counter with evidence, or mark for verification)
- **Consensus Alert** — if all roles start agreeing, something is wrong — you're forced to find the weak spot
- **Tech Escape Interception** — catches "we can just build it fast" deflections and redirects to demand validation
- **Falsification Block** — ensures every round ends with "how could this be wrong?"
- **Forced Opposition** — if the Assassin goes soft, it gets sent back with stricter instructions

The debate converges when hypotheses stabilize across rounds, or runs up to 5 rounds max.

## Two Interfaces

**CLI** (`prodmind-cli/`) — Terminal-based interactive debate. Good for quick solo sessions.

```bash
cd prodmind-cli
npm install && npm run build
npm start
```

**Web** (`prodmind-web/`) — Browser UI with streaming output, session management, and export. Supports Chinese and English.

```bash
cd prodmind-web
npm install
npm run dev
```

Open `http://localhost:3000`, configure your OpenAI-compatible API key in Settings, and start a session.

## Requirements

- Node.js 18+
- An OpenAI-compatible API key (OpenAI, DeepSeek, or any compatible provider)

## Export

Sessions can be exported as Markdown or JSON for documentation and team review.

## License

MIT
