import { randomUUID } from 'crypto';
import type {
  DecisionSession, DecisionSnapshot, DecisionStateTree,
  Assumption, Risk, SimulationPath,
} from './storage.js';

// ── Snapshot ──

export function takeSnapshot(session: DecisionSession, trigger: string, humanJudgment = ''): void {
  const snap: DecisionSnapshot = {
    version: session.snapshots.length + 1,
    timestamp: new Date().toISOString(),
    stateTree: JSON.parse(JSON.stringify(session.stateTree)),
    humanJudgment,
    trigger,
  };
  session.snapshots.push(snap);
}

// ── Problem ──

export function updateProblem(session: DecisionSession, description: string, expected: string): void {
  const p = session.stateTree.problem;
  p.version += 1;
  p.description = description;
  p.expectedOutcome = expected;
}

// ── Assumptions ──

export function addAssumption(tree: DecisionStateTree, content: string, source: string): Assumption {
  const a: Assumption = { id: randomUUID().slice(0, 6), content, status: 'unvalidated', source };
  tree.assumptions.push(a);
  return a;
}

export function validateAssumption(tree: DecisionStateTree, id: string): void {
  const a = tree.assumptions.find(x => x.id === id);
  if (a) a.status = 'validated';
}

export function rejectAssumption(tree: DecisionStateTree, id: string): void {
  const a = tree.assumptions.find(x => x.id === id);
  if (a) a.status = 'rejected';
}

// ── Risks ──

export function addRisk(tree: DecisionStateTree, content: string, prob: Risk['probability'], sev: Risk['severity']): Risk {
  const r: Risk = { id: randomUUID().slice(0, 6), content, probability: prob, severity: sev };
  tree.risks.push(r);
  return r;
}

// ── Simulation Paths ──

export function addSimulationPath(tree: DecisionStateTree, label: string, steps: string[], outcome: string): SimulationPath {
  const sp: SimulationPath = { id: randomUUID().slice(0, 6), label, steps, outcome };
  tree.simulationPaths.push(sp);
  return sp;
}

// ── Confidence Index ──

export function recalcConfidence(tree: DecisionStateTree): number {
  const total = tree.assumptions.length || 1;
  const validated = tree.assumptions.filter(a => a.status === 'validated').length;
  const validationRatio = validated / total;

  const highRisks = tree.risks.filter(r => r.probability === 'high' && r.severity === 'high').length;
  const riskExposure = Math.max(0, 1 - highRisks * 0.2);

  tree.confidenceIndex = Math.round(validationRatio * riskExposure * 100);
  return tree.confidenceIndex;
}
