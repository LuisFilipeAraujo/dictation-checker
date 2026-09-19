import { describe, expect, it } from "vitest";

import { gradeFor } from "./grade";

describe("gradeFor", () => {
  it("returns the top band at and above 85%", () => {
    expect(gradeFor(100).grade).toBe("excellent");
    expect(gradeFor(85).grade).toBe("excellent");
  });

  it("drops to the middle band just below 85%", () => {
    expect(gradeFor(84.9).grade).toBe("good");
  });

  it("returns the middle band down to 65%", () => {
    expect(gradeFor(65).grade).toBe("good");
  });

  it("drops to the bottom band just below 65%", () => {
    expect(gradeFor(64.9).grade).toBe("needs-practice");
    expect(gradeFor(0).grade).toBe("needs-practice");
  });

  it("rounds the percentage shown in the label", () => {
    expect(gradeFor(91.6).label).toBe("Excellent — 92% correct");
    expect(gradeFor(70.2).label).toBe("Good effort — 70% correct");
    expect(gradeFor(12.5).label).toBe("Needs practice — 13% correct");
  });
});
