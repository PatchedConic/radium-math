import { defineConfig } from "vitest/config";

// Test layers from architecture Section 10. Editor and UI move to jsdom
// when the editor arrives; UI e2e tests use Playwright (tests/e2e).
export default defineConfig({
  test: {
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
