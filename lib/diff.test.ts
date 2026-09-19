import { describe, expect, it } from "vitest";

import { DICTATIONS } from "./dictations";
import { compareDictation, tokenise } from "./diff";

describe("tokenise", () => {
  it("splits words and punctuation into separate tokens", () => {
    expect(tokenise("Hello, world!")).toEqual(["hello", ",", "world", "!"]);
  });

  it("lowercases so capitalisation is not penalised", () => {
    expect(tokenise("Ditch")).toEqual(tokenise("ditch"));
  });

  it("keeps apostrophes inside a contraction as one token", () => {
    expect(tokenise("don't")).toEqual(["don't"]);
  });

  it("treats a curly apostrophe as a straight one", () => {
    expect(tokenise("don’t")).toEqual(tokenise("don't"));
  });

  it("treats curly double quotes as straight ones", () => {
    expect(tokenise("“yes”")).toEqual(tokenise('"yes"'));
  });

  it("returns an empty array for empty input", () => {
    expect(tokenise("")).toEqual([]);
  });

  it("collapses newlines and runs of whitespace", () => {
    expect(tokenise("one\n\n  two")).toEqual(["one", "two"]);
  });
});

describe("compareDictation", () => {
  it("reports no errors for an exact transcription", () => {
    const text = "The cat sat on the mat.";
    const result = compareDictation(text, text);

    expect(result.errors).toBe(0);
    expect(result.scorePct).toBe(100);
    expect(result.ops.every((op) => op.type === "ok")).toBe(true);
  });

  it("marks a substituted word as a replacement", () => {
    const result = compareDictation("the cat sat", "the dog sat");

    expect(result.errors).toBe(1);
    expect(result.ops).toContainEqual({ type: "replace", ref: "cat", student: "dog" });
  });

  it("pairs a run of substitutions one by one", () => {
    const result = compareDictation("one two three", "four five three");

    expect(result.ops).toContainEqual({ type: "replace", ref: "one", student: "four" });
    expect(result.ops).toContainEqual({ type: "replace", ref: "two", student: "five" });
    expect(result.errors).toBe(2);
  });

  it("leaves the surplus as missing when more words are dropped than swapped", () => {
    const result = compareDictation("one two three four", "nine four");

    expect(result.ops).toContainEqual({ type: "replace", ref: "one", student: "nine" });
    expect(result.ops).toContainEqual({ type: "delete", ref: "two" });
    expect(result.ops).toContainEqual({ type: "delete", ref: "three" });
    expect(result.errors).toBe(3);
  });

  it("leaves the surplus as extra when more words are added than swapped", () => {
    const result = compareDictation("one four", "nine ten eleven four");

    expect(result.ops).toContainEqual({ type: "replace", ref: "one", student: "nine" });
    expect(result.ops).toContainEqual({ type: "insert", student: "ten" });
    expect(result.ops).toContainEqual({ type: "insert", student: "eleven" });
    expect(result.errors).toBe(1);
  });

  it("marks an omitted word as missing", () => {
    const result = compareDictation("the cat sat", "the sat");

    expect(result.errors).toBe(1);
    expect(result.ops).toContainEqual({ type: "delete", ref: "cat" });
  });

  it("flags an added word without counting it as an error", () => {
    const result = compareDictation("the cat sat", "the big cat sat");

    expect(result.ops).toContainEqual({ type: "insert", student: "big" });
    expect(result.errors).toBe(0);
    expect(result.scorePct).toBe(100);
  });

  it("scores an empty transcription at zero", () => {
    const result = compareDictation("the cat sat", "");

    expect(result.total).toBe(3);
    expect(result.errors).toBe(3);
    expect(result.scorePct).toBe(0);
  });

  it("does not divide by zero on an empty reference", () => {
    const result = compareDictation("", "anything");

    expect(result.total).toBe(0);
    expect(result.scorePct).toBe(0);
  });

  it("computes the score from the reference length", () => {
    // 4 reference tokens, 1 wrong -> 75%.
    const result = compareDictation("one two three four", "one two nine four");

    expect(result.total).toBe(4);
    expect(result.errors).toBe(1);
    expect(result.scorePct).toBe(75);
  });
});

describe("apostrophe regression", () => {
  // Nine of the thirteen reference texts (118-126) use the typographic
  // apostrophe. A student types the straight one, so before the normalisation
  // in `tokenise` every contraction in those dictations was reported wrong.
  const curlyDictations = Object.entries(DICTATIONS).filter(([, text]) => text.includes("’"));

  it("covers the dictations that actually contain curly apostrophes", () => {
    expect(curlyDictations.length).toBeGreaterThan(0);
  });

  it.each(curlyDictations.map(([num]) => Number(num)))(
    "dictation %i scores 100%% when typed with straight apostrophes",
    (num) => {
      const reference = DICTATIONS[num];
      const asTypedByStudent = reference.replace(/’/g, "'");

      const result = compareDictation(reference, asTypedByStudent);

      expect(result.errors).toBe(0);
      expect(result.scorePct).toBe(100);
    },
  );
});
