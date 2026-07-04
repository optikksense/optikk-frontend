import path from "node:path";
import { fileURLToPath } from "node:url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { API_PROXY_BASE, DEV_BACKEND_URL, DEV_FRONTEND_PORT } from "./src/config/apiConfig";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devBackendUrl = env.VITE_DEV_BACKEND_URL || DEV_BACKEND_URL;

  return {
    plugins: [TanStackRouterVite(), react()],
    resolve: {
      alias: [
        {
          find: "@/components/ui",
          replacement: path.resolve(__dirname, "./src/shared/components/primitives/ui"),
        },
        {
          find: "@/components",
          replacement: path.resolve(__dirname, "./src/shared/components/primitives"),
        },
        { find: "@/lib", replacement: path.resolve(__dirname, "./src/shared/lib") },
        { find: "@/types", replacement: path.resolve(__dirname, "./src/shared/types") },
        { find: "@app", replacement: path.resolve(__dirname, "./src/app") },
        { find: "@entities", replacement: path.resolve(__dirname, "./src/shared/entities") },
        { find: "@shared", replacement: path.resolve(__dirname, "./src/shared") },
        { find: "@config", replacement: path.resolve(__dirname, "./src/config") },
        { find: "@store", replacement: path.resolve(__dirname, "./src/app/store") },
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
      sourcemap: true,
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("/src/features/")) {
              const parts = id.split("/src/features/");
              if (parts.length > 1) {
                const featureName = parts[1].split("/")[0];
                if (featureName) return `feature-${featureName}`;
              }
            }

            if (
              id.includes("/node_modules/@radix-ui/") ||
              id.includes("/node_modules/cmdk/") ||
              id.includes("/node_modules/lucide-react/") ||
              id.includes("/node_modules/react-remove-scroll") ||
              id.includes("/node_modules/@floating-ui/")
            ) {
              return "ui-runtime";
            }

            if (id.includes("/node_modules/uplot/")) {
              return "chart-runtime";
            }

            if (
              id.includes("/node_modules/axios/") ||
              id.includes("/node_modules/@tanstack/react-query/") ||
              id.includes("/node_modules/@tanstack/query-core/") ||
              id.includes("/node_modules/zod/")
            ) {
              return "data-runtime";
            }

            return undefined;
          },
        },
      },
    },
  };
});
