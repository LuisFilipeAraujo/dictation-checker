export type Grade = "excellent" | "good" | "needs-practice";

export interface GradeResult {
  grade: Grade;
  /** Ready-to-display sentence, e.g. "Excellent — 92% correct". */
  label: string;
}

/** Score thresholds, in percent. */
export const GRADE_THRESHOLDS = {
  excellent: 85,
  good: 65,
} as const;

export function gradeFor(scorePct: number): GradeResult {
  const rounded = Math.round(scorePct);

  if (scorePct >= GRADE_THRESHOLDS.excellent) {
    return { grade: "excellent", label: `Excellent — ${rounded}% correct` };
  }
  if (scorePct >= GRADE_THRESHOLDS.good) {
    return { grade: "good", label: `Good effort — ${rounded}% correct` };
  }
  return { grade: "needs-practice", label: `Needs practice — ${rounded}% correct` };
}
