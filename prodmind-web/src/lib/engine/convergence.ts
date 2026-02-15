/**
 * Hypothesis convergence detection.
 * Compares hypotheses across rounds to detect stability.
 */

export function extractHypotheses(grounderOutput: string): string[] {
  const section = grounderOutput.match(/##\s*当前最强假设[^\n]*\n([\s\S]*?)(?=\n##|$)/);
  if (!section) return [];
  return section[1]
    .split("\n")
    .map((l) => l.replace(/^[\s\-\d.]*/, "").trim())
    .filter((l) => l.length > 5);
}

function similarity(a: string, b: string): number {
  const setA = new Set(a.split(""));
  const setB = new Set(b.split(""));
  const intersection = [...setA].filter((c) => setB.has(c)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function checkConvergence(
  currentHypotheses: string[],
  previousHypotheses: string[],
  threshold = 0.7
): { converged: boolean; score: number } {
  if (currentHypotheses.length === 0 || previousHypotheses.length === 0) {
    return { converged: false, score: 0 };
  }

  let totalSim = 0;
  let pairs = 0;
  for (const curr of currentHypotheses) {
    for (const prev of previousHypotheses) {
      totalSim += similarity(curr, prev);
      pairs++;
    }
  }

  const avgScore = pairs > 0 ? totalSim / pairs : 0;
  return { converged: avgScore >= threshold, score: avgScore };
}
