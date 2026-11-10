import { defineConfig } from "vitest/config";

// Test layers from architecture Section 10. Editor and UI move to jsdom
// when the editor arrives; UI e2e tests use Playwright (tests/e2e).
export default defineConfig({
  test: {
    // MNT-04: core line coverage must stay at or above 90%. `include` makes
    // core files that no test loads count as 0% rather than being skipped.
    // Run with `pnpm test:coverage`; the HTML report lands in coverage/.
    coverage: {
      provider: "v8",
      include: ["src/core/**/*.ts"],
      exclude: ["src/core/**/*.test.ts"],
      reporter: ["text", "html"],
      thresholds: { lines: 90 },
    },
    projects: [
      {
        test: {
          name: "core",
          environment: "node",
          include: [
            "src/core/**/*.test.ts",
            "tests/golden/**/*.test.ts",
            "tests/malicious/**/*.test.ts",
          ],
        },
      },
      {
        test: {
          name: "app",
          environment: "node",
          include: ["src/{worker,editor,ui,platform}/**/*.test.{ts,tsx}"],
        },
      },
    ],
  },
});
