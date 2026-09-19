import { describe, expect, it } from "vitest";

import { DICTATIONS, DICTATION_NUMBERS } from "./dictations";
import { compareDictation, tokenise } from "./diff";

/**
 * The reference texts are the source of truth, so a typo in one becomes a
 * "legitimate" mistake that the marking tests cannot possibly catch — that is
 * how the run-together words in dictation 126 survived. These tests cover the
 * mechanical classes of data-entry error instead.
 */

const entries = Object.entries(DICTATIONS).map(
  ([num, text]) => [Number(num), text] as [number, string],
);

/**
 * Real words this long are rare; run-together words are not. Add a word here
 * when a genuine long one turns up, rather than relaxing the rule.
 */
const KNOWN_LONG_WORDS: string[] = [];
const LONG_WORD_LIMIT = 14;

describe("dictation index", () => {
  it("lists exactly the dictations that exist", () => {
    expect(DICTATION_NUMBERS).toEqual(entries.map(([num]) => num).sort((a, b) => a - b));
  });

  it("is sorted ascending, which is the order the select renders", () => {
    expect(DICTATION_NUMBERS).toEqual([...DICTATION_NUMBERS].sort((a, b) => a - b));
  });

  it("has no duplicates", () => {
    expect(new Set(DICTATION_NUMBERS).size).toBe(DICTATION_NUMBERS.length);
  });
});

describe.each(entries)("dictation %i", (num, text) => {
  it("is long enough to be a whole dictation", () => {
    // The shortest real one runs to 105 words; well under that means a
    // truncated paste.
    expect(tokenise(text).length).toBeGreaterThan(80);
  });

  it("has no leading or trailing whitespace", () => {
    expect(text).toBe(text.trim());
  });

  it("has no run of spaces", () => {
    expect(text).not.toMatch(/ {2,}/);
  });

  it("never glues punctuation straight onto the next word", () => {
    // Catches "racket.Then" and "antique,feeble".
    const glued = text.match(/[.,;:!?][A-Za-z]/g) ?? [];
    expect(glued).toEqual([]);
  });

  it("has no suspiciously long word", () => {
    // Catches "Charlesdisguised", "correcttechnique", "queen'spresence".
    const words = text.match(/[A-Za-z'’]+/g) ?? [];
    const suspicious = words.filter(
      (word) => word.length > LONG_WORD_LIMIT && !KNOWN_LONG_WORDS.includes(word),
    );
    expect(suspicious).toEqual([]);
  });

  it("marks a flawless copy of itself at 100%", () => {
    const result = compareDictation(text, text);

    expect(result.total).toBeGreaterThan(0);
    expect(result.errors).toBe(0);
    expect(result.scorePct).toBe(100);
  });
});
