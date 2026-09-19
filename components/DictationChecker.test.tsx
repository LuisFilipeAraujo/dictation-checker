import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DICTATION_NUMBERS, DICTATIONS } from "@/lib/dictations";

import { DictationChecker } from "./DictationChecker";

/** Dictation 118 as a student would type it: straight apostrophes, no mistakes. */
const PERFECT = DICTATIONS[118].replace(/’/g, "'");

function fill({ name, number, text }: { name?: string; number?: string; text?: string }) {
  if (name !== undefined) {
    fireEvent.change(screen.getByLabelText("Student Name"), { target: { value: name } });
  }
  if (number !== undefined) {
    fireEvent.change(screen.getByLabelText("Dictation Number"), { target: { value: number } });
  }
  if (text !== undefined) {
    fireEvent.change(screen.getByLabelText("Type what you heard"), { target: { value: text } });
  }
}

function check() {
  fireEvent.click(screen.getByRole("button", { name: "Check Dictation" }));
}

/** The stat tile pairs the count with its "Errors" label. */
function errorCount() {
  const tile = screen.getByText("Errors").closest("div");
  return within(tile as HTMLElement).getByText(/^\d+$/).textContent;
}

describe("DictationChecker", () => {
  describe("validation", () => {
    it("asks for the student name when it is blank", () => {
      render(<DictationChecker />);
      fill({ number: "118", text: PERFECT });
      check();

      expect(screen.getByText("Please enter the student name.")).toBeInTheDocument();
    });

    it("asks for a dictation number when none is selected", () => {
      render(<DictationChecker />);
      fill({ name: "Maria Silva", text: PERFECT });
      check();

      expect(screen.getByText("Please select a dictation number.")).toBeInTheDocument();
    });

    it("asks for the text when it is blank", () => {
      render(<DictationChecker />);
      fill({ name: "Maria Silva", number: "118" });
      check();

      expect(screen.getByText("Please type the dictation text.")).toBeInTheDocument();
    });

    it("treats whitespace as blank", () => {
      render(<DictationChecker />);
      fill({ name: "   ", number: "118", text: "   " });
      check();

      expect(screen.getByText("Please enter the student name.")).toBeInTheDocument();
      expect(screen.getByText("Please type the dictation text.")).toBeInTheDocument();
    });

    it("shows no results while the form is invalid", () => {
      render(<DictationChecker />);
      check();

      expect(screen.queryByText("Results")).not.toBeInTheDocument();
    });

    it("marks the invalid controls for assistive technology", () => {
      render(<DictationChecker />);
      check();

      expect(screen.getByLabelText("Student Name")).toHaveAttribute("aria-invalid", "true");
    });

    it("clears the messages once the form is filled in", () => {
      render(<DictationChecker />);
      check();
      expect(screen.getByText("Please enter the student name.")).toBeInTheDocument();

      fill({ name: "Maria Silva", number: "118", text: PERFECT });
      check();

      expect(screen.queryByText("Please enter the student name.")).not.toBeInTheDocument();
    });
  });

  describe("marking", () => {
    function markWith(text: string) {
      render(<DictationChecker />);
      fill({ name: "Maria Silva", number: "118", text });
      check();
    }

    it("reports a flawless transcription", () => {
      markWith(PERFECT);

      expect(screen.getByText("Excellent — 100% correct")).toBeInTheDocument();
      expect(errorCount()).toBe("0");
    });

    it("marks a misspelt word and names the word expected", () => {
      markWith(PERFECT.replace("mattress", "matress"));

      expect(screen.getByTitle("Expected: mattress")).toHaveTextContent("matress");
      expect(errorCount()).toBe("1");
    });

    it("marks an omitted word", () => {
      markWith(PERFECT.replace(" vertically", ""));

      expect(screen.getByText("[vertically]")).toBeInTheDocument();
      expect(errorCount()).toBe("1");
    });

    it("marks an added word", () => {
      markWith(PERFECT.replace("the bedroom wall", "the very bedroom wall"));

      expect(screen.getByText("very")).toBeInTheDocument();
      expect(errorCount()).toBe("1");
    });

    it("counts each kind of mistake once", () => {
      markWith(
        PERFECT.replace(
          "mattress vertically against the bedroom",
          "matress against the very bedroom",
        ),
      );

      expect(errorCount()).toBe("3");
    });

    it("drops to the bottom band when little is right", () => {
      markWith("completely unrelated words that match nothing at all");

      expect(screen.getByText(/^Needs practice/)).toBeInTheDocument();
    });

    it("shows who was marked and on which dictation", () => {
      markWith(PERFECT);

      const results = screen.getByText("Results").closest("section");
      expect(within(results as HTMLElement).getByText("Maria Silva")).toBeInTheDocument();
      expect(within(results as HTMLElement).getByText("118")).toBeInTheDocument();
    });
  });

  describe("start over", () => {
    it("empties the fields and hides the results", () => {
      render(<DictationChecker />);
      fill({ name: "Maria Silva", number: "118", text: PERFECT });
      check();
      expect(screen.getByText("Results")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Start Over" }));

      expect(screen.getByLabelText("Student Name")).toHaveValue("");
      expect(screen.getByLabelText("Dictation Number")).toHaveValue("");
      expect(screen.getByLabelText("Type what you heard")).toHaveValue("");
      expect(screen.queryByText("Results")).not.toBeInTheDocument();
    });
  });

  describe("dictation list", () => {
    it("offers every dictation, plus the placeholder", () => {
      render(<DictationChecker />);

      const options = within(screen.getByLabelText("Dictation Number")).getAllByRole("option");
      expect(options).toHaveLength(DICTATION_NUMBERS.length + 1);
      expect(options[0]).toHaveValue("");
    });
  });
});
