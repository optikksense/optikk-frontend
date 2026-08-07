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
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: "react-vendor", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
              {
                name: "router-vendor",
                test: /node_modules[\\/]@tanstack[\\/](react-router|router-core|history|store)[\\/]/,
              },
              {
                name: "ui-vendor",
                test: /node_modules[\\/](@radix-ui|@floating-ui|sonner)[\\/]/,
              },
            ],
          },
        },
      },
    },
  };
});
