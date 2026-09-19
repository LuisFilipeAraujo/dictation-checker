import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Vitest runs without global injection, so Testing Library's automatic cleanup
// never registers itself. Without this, rendered trees leak between tests and
// queries start matching more than one element.
afterEach(() => {
  cleanup();
});

// jsdom implements neither, and the checker calls both: scrollIntoView after
// marking, scrollTo after resetting.
Element.prototype.scrollIntoView = vi.fn() as unknown as Element["scrollIntoView"];
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
