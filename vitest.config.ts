import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  optimizeDeps: {
    include: ["lit/decorators.js"],
  },
  resolve: {
    alias: {
      // Stub lit and its decorators so LitElement-based imports
      // don't require a real browser rendering engine in unit tests
      //lit: resolve(__dirname, "tests/__mocks__/lit.ts"),
      //"lit/decorators.js": resolve(__dirname, "tests/__mocks__/lit-decorators.ts"),
      "lit/decorators.js": resolve(__dirname, "node_modules/lit/decorators.js"),
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    deps: {
      optimizer: {
        web: {
          include: ["lit", "lit/decorators.js", "@lit/reactive-element"],
        },
      },
    },

    setupFiles: ["./tests/setup.ts"],
    include: ["tests/*.test.ts"],
    coverage: {
      // istanbul has no vulnerable transitive dependencies (unlike v8)
      provider: "istanbul",
      reporter: ["text", "html", "cobertura", "json-summary"],
      reportsDirectory: "./reports",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.styles.ts", "src/img/**", "src/index.ts"],
      ignoreEmptyLines: true,
    },
  },
});
