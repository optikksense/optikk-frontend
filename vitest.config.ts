import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const rootDir = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/tests/**/*.test.ts"],
    exclude: ["src/tests/e2e/**"],
    setupFiles: ["./src/tests/setup.ts"],
  },
})
