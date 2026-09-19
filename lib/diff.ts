export type DiffOp =
  | { type: "ok"; ref: string; student: string }
  | { type: "replace"; ref: string; student: string }
  | { type: "delete"; ref: string }
  | { type: "insert"; student: string };

export interface ComparisonResult {
  ops: DiffOp[];
  /** Wrong words plus missing words. Extra words are shown but not penalised. */
  errors: number;
  /** Token count of the reference text. */
  total: number;
  /** Percentage of the reference reproduced correctly, 0–100. */
  scorePct: number;
}

/**
 * Splits text into comparable tokens: words (letters, digits, apostrophes) and
 * individual punctuation marks.
 *
 * Curly quotes are folded to straight ones first. Without that, a reference
 * written as `don’t` tokenises to ["don", "t"] while a student typing `don't`
 * on a normal keyboard produces ["don't"], and every contraction is reported
 * as an error.
 */
export function tokenise(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, " ")
      .match(/[a-z0-9']+|[.,;:!?'"()\-–—]/g) ?? []
  );
}

/**
 * Pairs up adjacent missing and extra words into single substitutions.
 *
 * A plain LCS walk can only delete and insert, so swapping one word for
 * another surfaces as a missing word next to an extra word. Pairing them is
 * what makes the "wrong word" category possible, and it never changes the
 * score: a replacement counts the same as the deletion it replaces.
 */
function mergeReplacements(ops: DiffOp[]): DiffOp[] {
  const merged: DiffOp[] = [];
  let i = 0;

  while (i < ops.length) {
    if (ops[i].type !== "delete" && ops[i].type !== "insert") {
      merged.push(ops[i]);
      i++;
      continue;
    }

    const missing: string[] = [];
    const extra: string[] = [];
    let j = i;

    while (j < ops.length) {
      const op = ops[j];
      if (op.type === "delete") {
        missing.push(op.ref);
      } else if (op.type === "insert") {
        extra.push(op.student);
      } else {
        break;
      }
      j++;
    }

    const pairs = Math.min(missing.length, extra.length);
    for (let k = 0; k < pairs; k++) {
      merged.push({ type: "replace", ref: missing[k], student: extra[k] });
    }
    for (let k = pairs; k < missing.length; k++) {
      merged.push({ type: "delete", ref: missing[k] });
    }
    for (let k = pairs; k < extra.length; k++) {
      merged.push({ type: "insert", student: extra[k] });
    }

    i = j;
  }

  return merged;
}

/**
 * Aligns two token sequences with a longest-common-subsequence table and walks
 * the table back into a flat list of edit operations.
 */
export function lcsAlign(ref: string[], student: string[]): DiffOp[] {
  const m = ref.length;
  const n = student.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (ref[i - 1] === student[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const ops: DiffOp[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ref[i - 1] === student[j - 1]) {
      ops.push({ type: "ok", ref: ref[i - 1], student: student[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: "insert", student: student[j - 1] });
      j--;
    } else {
      ops.push({ type: "delete", ref: ref[i - 1] });
      i--;
    }
  }

  ops.reverse();
  return mergeReplacements(ops);
}

/**
 * Compares a student's transcription against the reference text.
 *
 * Pure: it returns the edit operations and the score, and leaves rendering to
 * the caller.
 */
export function compareDictation(reference: string, student: string): ComparisonResult {
  const refTokens = tokenise(reference);
  const studentTokens = tokenise(student);
  const ops = lcsAlign(refTokens, studentTokens);

  const errors = ops.filter((op) => op.type === "replace" || op.type === "delete").length;
  const total = refTokens.length;
  const scorePct = total > 0 ? ((total - errors) / total) * 100 : 0;

  return { ops, errors, total, scorePct };
}
