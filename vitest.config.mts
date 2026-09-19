import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      // The `text` table renders empty on Windows paths; `text-summary`
      // prints the totals correctly and `html` carries the per-line detail.
      reporter: ["text-summary", "html"],
      include: ["lib/**/*.ts", "components/**/*.tsx"],
      // The reference texts are data, not logic — their integrity is checked
      // by lib/dictations.test.ts rather than by line counts.
      exclude: ["**/*.test.{ts,tsx}", "lib/dictations.ts"],
    },
  },
});
