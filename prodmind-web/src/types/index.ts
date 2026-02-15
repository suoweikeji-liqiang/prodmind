export type DebatePhase =
  | "idle"
  | "architect"
  | "user_confirm"
  | "attacking"
  | "conflict_check"
  | "user_response"
  | "grounding"
  | "round_complete";

export type RoleName = "architect" | "assassin" | "user_ghost" | "grounder" | "user" | "system";

export type ConflictRuleType =
  | "alternative_hypothesis"
  | "consensus_alert"
  | "tech_escape"
  | "falsification_block"
  | "forced_opposition";

export interface RoleCallOptions {
  userInput: string;
  architectOutput?: string;
  assassinOutput?: string;
  userGhostOutput?: string;
  userResponse?: string;
  roundHistory?: string;
}

export interface AlternativeHypothesis {
  source: string;
  content: string;
}

export interface SSEEvent {
  type:
    | "role_start"
    | "token"
    | "role_complete"
    | "conflict_alert"
    | "phase_change"
    | "convergence_check"
    | "error"
    | "done";
  role?: RoleName;
  content?: string;
  phase?: DebatePhase;
  conflictType?: ConflictRuleType;
  detail?: string;
  round?: number;
  converged?: boolean;
}

export interface DebateAction {
  type: "start_round" | "user_confirm" | "conflict_choice" | "user_response" | "next_round" | "end_session";
  sessionId: string;
  content?: string;
  choice?: string;
}

export interface SessionInfo {
  id: string;
  title: string;
  idea: string;
  status: string;
  currentRound: number;
  debatePhase: DebatePhase;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageInfo {
  id: number;
  sessionId: string;
  round: number;
  role: RoleName;
  content: string;
  metadata: string | null;
  createdAt: string;
}

export interface ConflictEventInfo {
  id: number;
  sessionId: string;
  round: number;
  ruleType: ConflictRuleType;
  detail: string;
  userChoice: string | null;
  createdAt: string;
}
