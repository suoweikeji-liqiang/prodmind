/**
 * Debate state machine — ported from CLI debate.ts
 * Processes one action at a time, streams output via SSE.
 * All DB calls are async (libsql driver).
 */

import { db } from "@/lib/db";
import { sessions, messages, conflictEvents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  streamArchitect,
  streamAssassin,
  streamUserGhost,
  streamGrounder,
  callGrounderSync,
  generateFallbackGrounder,
} from "./roles";
import {
  detectAlternativeHypothesis,
  detectConsensusAlert,
  detectTechEscape,
  validateFalsificationBlock,
} from "./consensus-check";
import { extractHypotheses, checkConvergence } from "./convergence";
import type { DebateAction, SSEEvent, RoleCallOptions } from "@/types";

const MAX_ROUNDS = 5;

type SSEWriter = (event: SSEEvent) => void;

async function buildRoundHistory(sessionId: string): Promise<string> {
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.round, messages.id);

  const rounds = new Map<number, string[]>();
  for (const m of msgs) {
    if (!rounds.has(m.round)) rounds.set(m.round, []);
    const roleLabel =
      m.role === "architect" ? "架构师" :
      m.role === "assassin" ? "刺客" :
      m.role === "user_ghost" ? "用户鬼" :
      m.role === "grounder" ? "落地者" :
      m.role === "user" ? "用户" : m.role;
    rounds.get(m.round)!.push(`${roleLabel}：${m.content}`);
  }

  return [...rounds.entries()]
    .map(([r, lines]) => `--- 第${r}轮 ---\n${lines.join("\n")}`)
    .join("\n\n");
}

async function saveMessage(sessionId: string, round: number, role: string, content: string, metadata?: string) {
  await db.insert(messages)
    .values({ sessionId, round, role, content, metadata: metadata || null, createdAt: new Date().toISOString() });
}

async function saveConflict(sessionId: string, round: number, ruleType: string, detail: string, userChoice?: string) {
  await db.insert(conflictEvents)
    .values({ sessionId, round, ruleType, detail, userChoice: userChoice || null, createdAt: new Date().toISOString() });
}

async function updateSession(sessionId: string, updates: Record<string, unknown>) {
  const setObj: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };
  await db.update(sessions).set(setObj as never).where(eq(sessions.id, sessionId));
}

async function getMessageContent(sessionId: string, round: number, role: string): Promise<string> {
  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.sessionId, sessionId), eq(messages.round, round), eq(messages.role, role)));
  return rows[0]?.content || "";
}

async function getPreviousRounds(sessionId: string, currentRound: number) {
  const assassinMsgs = await db
    .select()
    .from(messages)
    .where(and(eq(messages.sessionId, sessionId), eq(messages.role, "assassin")));
  return assassinMsgs.filter((m) => m.round < currentRound).map((m) => ({ assassin: m.content }));
}

async function streamRole(
  gen: AsyncGenerator<string, string, undefined>,
  write: SSEWriter,
  role: string
): Promise<string> {
  write({ type: "role_start", role: role as never });
  let full = "";
  while (true) {
    const { value, done } = await gen.next();
    if (done) {
      full = value || full;
      break;
    }
    full += value;
    write({ type: "token", role: role as never, content: value });
  }
  write({ type: "role_complete", role: role as never, content: full });
  return full;
}

export async function processDebateAction(action: DebateAction, write: SSEWriter): Promise<void> {
  const sessionRows = await db.select().from(sessions).where(eq(sessions.id, action.sessionId));
  const session = sessionRows[0];
  if (!session) {
    write({ type: "error", content: "Session not found" });
    return;
  }

  const idea = session.idea;

  try {
    switch (action.type) {
      case "start_round": {
        const newRound = session.currentRound + 1;
        if (newRound > MAX_ROUNDS) {
          write({ type: "error", content: "Maximum rounds reached" });
          return;
        }
        await updateSession(session.id, { currentRound: newRound, debatePhase: "architect" });
        write({ type: "phase_change", phase: "architect", round: newRound });

        const roundHistory = await buildRoundHistory(session.id);
        const opts: RoleCallOptions = { userInput: idea, roundHistory };
        const architectOutput = await streamRole(streamArchitect(opts), write, "architect");
        await saveMessage(session.id, newRound, "architect", architectOutput);

        await updateSession(session.id, { debatePhase: "user_confirm" });
        write({ type: "phase_change", phase: "user_confirm", round: newRound });
        write({ type: "done" });
        break;
      }

      case "user_confirm": {
        const round = session.currentRound;
        await saveMessage(session.id, round, "user", action.content || "", JSON.stringify({ subtype: "confirm" }));

        await updateSession(session.id, { debatePhase: "attacking" });
        write({ type: "phase_change", phase: "attacking", round });

        const roundHistory = await buildRoundHistory(session.id);
        const architectOutput = await getMessageContent(session.id, round, "architect");
        const baseOpts: RoleCallOptions = {
          userInput: idea,
          architectOutput,
          userResponse: action.content,
          roundHistory,
        };

        // Stream Assassin
        const assassinOutput = await streamRole(streamAssassin(baseOpts), write, "assassin");
        await saveMessage(session.id, round, "assassin", assassinOutput);

        // Stream UserGhost
        const userGhostOutput = await streamRole(streamUserGhost(baseOpts), write, "user_ghost");
        await saveMessage(session.id, round, "user_ghost", userGhostOutput);

        // Conflict detection
        await updateSession(session.id, { debatePhase: "conflict_check" });
        write({ type: "phase_change", phase: "conflict_check", round });

        const previousRounds = await getPreviousRounds(session.id, round);

        // Rule 1: Alternative Hypothesis
        const altFromAssassin = detectAlternativeHypothesis(assassinOutput, "刺客");
        const altFromGhost = detectAlternativeHypothesis(userGhostOutput, "用户鬼");
        const alt = altFromAssassin || altFromGhost;
        if (alt) {
          await saveConflict(session.id, round, "alternative_hypothesis", `${alt.source}: ${alt.content}`);
          write({
            type: "conflict_alert",
            conflictType: "alternative_hypothesis",
            detail: JSON.stringify(alt),
          });
        }

        // Rule 2: Consensus Alert
        if (detectConsensusAlert(assassinOutput, userGhostOutput, previousRounds)) {
          await saveConflict(session.id, round, "consensus_alert", "All roles converging");
          write({ type: "conflict_alert", conflictType: "consensus_alert" });
        }

        await updateSession(session.id, { debatePhase: "user_response" });
        write({ type: "phase_change", phase: "user_response", round });
        write({ type: "done" });
        break;
      }

      case "conflict_choice": {
        const round = session.currentRound;
        if (action.content) {
          await saveMessage(session.id, round, "user", action.content, JSON.stringify({ subtype: "conflict_choice", choice: action.choice }));
          const allConflicts = await db
            .select()
            .from(conflictEvents)
            .where(and(eq(conflictEvents.sessionId, session.id), eq(conflictEvents.round, round)));
          const latestConflict = allConflicts[allConflicts.length - 1];
          if (latestConflict) {
            await db.update(conflictEvents)
              .set({ userChoice: action.content })
              .where(eq(conflictEvents.id, latestConflict.id));
          }
        }

        if (action.choice === "force_opposition") {
          const architectOutput = await getMessageContent(session.id, round, "architect");
          const roundHistory = await buildRoundHistory(session.id);
          const opts: RoleCallOptions = {
            userInput: idea,
            architectOutput,
            userResponse: action.content,
            roundHistory,
          };
          const newAssassin = await streamRole(streamAssassin(opts, true), write, "assassin");
          await saveMessage(session.id, round, "assassin", newAssassin, JSON.stringify({ forced: true }));
        }

        await updateSession(session.id, { debatePhase: "user_response" });
        write({ type: "phase_change", phase: "user_response", round });
        write({ type: "done" });
        break;
      }

      case "user_response": {
        const round = session.currentRound;
        const userResponse = action.content || "";
        await saveMessage(session.id, round, "user", userResponse, JSON.stringify({ subtype: "response" }));

        // Rule 3: Tech Escape
        const techEscapeTriggered = detectTechEscape(userResponse);
        if (techEscapeTriggered) {
          await saveConflict(session.id, round, "tech_escape", "User response focuses on tech capability");
          write({ type: "conflict_alert", conflictType: "tech_escape" });
        }

        // Grounding phase
        await updateSession(session.id, { debatePhase: "grounding" });
        write({ type: "phase_change", phase: "grounding", round });

        const architectOutput = await getMessageContent(session.id, round, "architect");
        const assassinOutput = await getMessageContent(session.id, round, "assassin");
        const userGhostOutput = await getMessageContent(session.id, round, "user_ghost");
        const roundHistory = await buildRoundHistory(session.id);
        const userConfirmContent = await getMessageContent(session.id, round, "user");

        const grounderOpts: RoleCallOptions = {
          userInput: userResponse,
          architectOutput,
          assassinOutput,
          userGhostOutput,
          userResponse: userConfirmContent,
          roundHistory,
        };

        let grounderOutput: string;
        try {
          grounderOutput = await streamRole(streamGrounder(grounderOpts), write, "grounder");

          // Rule 5: Falsification block validation
          if (!validateFalsificationBlock(grounderOutput)) {
            write({ type: "conflict_alert", conflictType: "falsification_block", detail: "Missing falsification check, regenerating..." });
            grounderOutput = await callGrounderSync(
              grounderOpts,
              `【系统提示】你的上一次输出缺少\u201C本轮证伪检查\u201D部分。请务必在末尾包含：当前最重要假设、如果我是错的最可能因为什么、验证这个假设的最小动作。`
            );
            write({ type: "role_complete", role: "grounder", content: grounderOutput });
          }
        } catch {
          grounderOutput = generateFallbackGrounder(architectOutput, assassinOutput);
          write({ type: "role_complete", role: "grounder", content: grounderOutput });
        }

        await saveMessage(session.id, round, "grounder", grounderOutput);

        // Convergence check
        if (round >= 2) {
          const prevGrounder = await getMessageContent(session.id, round - 1, "grounder");
          const currHyp = extractHypotheses(grounderOutput);
          const prevHyp = extractHypotheses(prevGrounder);
          const { converged, score } = checkConvergence(currHyp, prevHyp);
          write({ type: "convergence_check", converged, detail: `score=${score.toFixed(2)}` });
        }

        await updateSession(session.id, { debatePhase: "round_complete" });
        write({ type: "phase_change", phase: "round_complete", round });

        if (round >= MAX_ROUNDS) {
          await updateSession(session.id, { status: "completed" });
        }

        write({ type: "done" });
        break;
      }

      case "next_round": {
        await processDebateAction({ ...action, type: "start_round" }, write);
        break;
      }

      case "end_session": {
        await updateSession(session.id, { status: "completed", debatePhase: "idle" });
        write({ type: "phase_change", phase: "idle" });
        write({ type: "done" });
        break;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    write({ type: "error", content: msg });
  }
}
