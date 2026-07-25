import path from "node:path";
import { fileURLToPath } from "node:url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { API_PROXY_BASE, DEV_BACKEND_URL, DEV_FRONTEND_PORT } from "./src/config/apiConfig";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devBackendUrl = env.VITE_DEV_BACKEND_URL || DEV_BACKEND_URL;
  const plugins = [TanStackRouterVite(), react()];
  if (env.ANALYZE_BUNDLE === "true") {
    plugins.push(visualizer({ filename: "stats.html" }));
  }

  return {
    plugins,
    resolve: {
      alias: [
        { find: "@app", replacement: path.resolve(__dirname, "./src/app") },
        { find: "@shared", replacement: path.resolve(__dirname, "./src/shared") },
        { find: "@config", replacement: path.resolve(__dirname, "./src/config") },
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
    server: {
      port: DEV_FRONTEND_PORT,
      proxy: {
        [API_PROXY_BASE]: {
          target: devBackendUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log(
                `[Vite Proxy] ${req.method} ${req.url} -> ${proxyReq.getHeader("host")}${proxyReq.path}`
              );
            });
          },
        },
      },
    },
    build: {
      outDir: "dist",
      // Browser devtools use the source directly during `vite dev`. Emitting
      // maps for a distributable bundle would expose the full source tree.
      sourcemap: false,
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")
            ) {
              return "vendor-react";
            }
            if (id.includes("node_modules/@tanstack/")) return "vendor-tanstack";
            if (
              id.includes("node_modules/react-aria") ||
              id.includes("node_modules/react-stately") ||
              id.includes("node_modules/@react-aria/") ||
              id.includes("node_modules/@react-stately/") ||
              id.includes("node_modules/@internationalized/")
            ) {
              return "vendor-react-aria";
            }
            if (
              id.includes("node_modules/@radix-ui/") ||
              id.includes("node_modules/@floating-ui/")
            ) {
              return "vendor-radix";
            }
            if (id.includes("node_modules/date-fns/")) return "vendor-date";
            if (id.includes("node_modules/zod/")) return "vendor-zod";
            if (id.includes("node_modules/axios/")) return "vendor-http";
            if (id.includes("node_modules/lucide-react/")) return "vendor-icons";
            if (id.includes("node_modules/uplot/")) return "vendor-charts";
            return undefined;
          },
        },
      },
    },
  };
});
