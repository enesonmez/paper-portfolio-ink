import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#db": fileURLToPath(new URL("./db", import.meta.url)),
      "#root": fileURLToPath(new URL("./", import.meta.url)),
      "#workers": fileURLToPath(new URL("./workers", import.meta.url)),
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["app/**/*.{ts,tsx}"],
    },
    environment: "jsdom",
    exclude: ["build/**", "coverage/**", "node_modules/**", "tests/e2e/**"],
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 20000,
  },
});
