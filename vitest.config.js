import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default defineConfig(({ mode }) =>
  mergeConfig(viteConfig({ mode }), {
    test: {
      environment: "jsdom",
      environmentOptions: {
        jsdom: {
          url: "http://localhost/",
        },
      },
      exclude: ["e2e/**", "node_modules/**", "dist/**"],
      setupFiles: ["./src/test/setupTests.ts"],
      clearMocks: true,
      restoreMocks: true,
      mockReset: true,
    },
  })
);
