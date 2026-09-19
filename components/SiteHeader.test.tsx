import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("carries the British English crest", () => {
    render(<SiteHeader />);

    expect(screen.getByText("British English")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Union Flag" })).toBeInTheDocument();
  });

  it("names the application as the page heading", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dictation Checker");
  });

  it("keeps the Union Flag at its 2:1 proportion", () => {
    render(<SiteHeader />);

    // A squashed flag is the most likely way the crest breaks unnoticed.
    expect(screen.getByRole("img", { name: "Union Flag" })).toHaveAttribute("viewBox", "0 0 60 30");
  });
});
