import path from "node:path";
import { fileURLToPath } from "node:url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { API_PROXY_BASE, DEV_BACKEND_URL, DEV_FRONTEND_PORT } from "./src/config/apiConfig";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

      sourcemap: false,
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          // Rolldown-native chunking. The legacy `manualChunks` emulation
          // captures each group's full dependency closure (it pulled React
          // itself into feature chunks); `advancedChunks` with
          // `includeDependenciesRecursively: false` assigns exactly the
          // matched modules. Earlier groups win for overlapping matches.
          advancedChunks: {
            includeDependenciesRecursively: false,
            groups: [
              {
                name: "vendor-react",
                test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              },
              // Table/virtualizer are used only by lazy feature chunks; keep
              // them out of the eager router+query chunk.
              {
                name: "vendor-table",
                test: /node_modules[\\/]@tanstack[\\/](react-table|table-core|react-virtual|virtual-core)[\\/]/,
              },
              { name: "vendor-tanstack", test: /node_modules[\\/]@tanstack[\\/]/ },
              // Service-map graph stack (lazy-only): xyflow + dagre and their
              // exclusive deps (graphlib/lodash/d3-*/classcat).
              {
                name: "vendor-graph",
                test: /node_modules[\\/](@xyflow|dagre|graphlib|lodash|d3-[a-z-]+|classcat)[\\/]/,
              },
              {
                name: "vendor-radix",
                test: /node_modules[\\/](@radix-ui|@floating-ui)[\\/]/,
              },
              { name: "vendor-zod", test: /node_modules[\\/]zod[\\/]/ },
              { name: "vendor-http", test: /node_modules[\\/]axios[\\/]/ },
              { name: "vendor-icons", test: /node_modules[\\/]lucide-react[\\/]/ },
              { name: "vendor-charts", test: /node_modules[\\/]uplot[\\/]/ },
            ],
          },
        },
      },
    },
  };
});
