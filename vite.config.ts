import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { API_PROXY_BASE, DEV_BACKEND_URL, DEV_FRONTEND_PORT } from './src/config/apiConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devBackendUrl = env.VITE_DEV_BACKEND_URL || DEV_BACKEND_URL;

  return {
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: '@/components/ui',
          replacement: path.resolve(__dirname, './src/shared/components/primitives/ui'),
        },
        {
          find: '@/components',
          replacement: path.resolve(__dirname, './src/shared/components/primitives'),
        },
        { find: '@/lib', replacement: path.resolve(__dirname, './src/shared/lib') },
        { find: '@/types', replacement: path.resolve(__dirname, './src/shared/types') },
        { find: '@/hooks', replacement: path.resolve(__dirname, './src/shared/hooks') },
        { find: '@/services', replacement: path.resolve(__dirname, './src/shared/api') },
        { find: '@app', replacement: path.resolve(__dirname, './src/app') },
        { find: '@pages', replacement: path.resolve(__dirname, './src/pages') },
        { find: '@features', replacement: path.resolve(__dirname, './src/features') },
        { find: '@entities', replacement: path.resolve(__dirname, './src/shared/entities') },
        { find: '@shared', replacement: path.resolve(__dirname, './src/shared') },
        { find: '@config', replacement: path.resolve(__dirname, './src/config') },
        { find: '@components', replacement: path.resolve(__dirname, './src/shared/components') },
        { find: '@hooks', replacement: path.resolve(__dirname, './src/shared/hooks') },
        { find: '@utils', replacement: path.resolve(__dirname, './src/shared/utils') },
        { find: '@services', replacement: path.resolve(__dirname, './src/shared/api') },
        { find: '@store', replacement: path.resolve(__dirname, './src/app/store') },
        {
          find: '@optikk/design-system',
          replacement: path.resolve(__dirname, './src/design-system'),
        },
        { find: '@', replacement: path.resolve(__dirname, './src') },
      ],
    },
    server: {
      port: DEV_FRONTEND_PORT,
      proxy: {
        [API_PROXY_BASE]: {
          target: devBackendUrl,
          changeOrigin: true,
          secure: false,
        },
        // Socket.IO (live tail for logs/traces) uses path /socket.io/ on the API server; must be
        // proxied alongside /api so the browser (same origin as Vite) can reach the backend.
        '/socket.io': {
          target: devBackendUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/src/features/')) {
              const parts = id.split('/src/features/');
              if (parts.length > 1) {
                const featureName = parts[1].split('/')[0];
                if (featureName) return `feature-${featureName}`;
              }
            }

            if (
              id.includes('/src/app/auth/pages/Pricing/') ||
              id.includes('/node_modules/framer-motion/') ||
              id.includes('/node_modules/motion-dom/') ||
              id.includes('/node_modules/motion-utils/')
            ) {
              return 'marketing-runtime';
            }

            if (
              id.includes('/node_modules/@radix-ui/') ||
              id.includes('/node_modules/cmdk/') ||
              id.includes('/node_modules/lucide-react/') ||
              id.includes('/node_modules/react-remove-scroll') ||
              id.includes('/node_modules/@floating-ui/')
            ) {
              return 'ui-runtime';
            }

            if (id.includes('/node_modules/uplot/')) {
              return 'chart-runtime';
            }

            if (
              id.includes('/node_modules/axios/') ||
              id.includes('/node_modules/@tanstack/react-query/') ||
              id.includes('/node_modules/@tanstack/query-core/') ||
              id.includes('/node_modules/zod/')
            ) {
              return 'data-runtime';
            }

            return undefined;
          },
        },
      },
    },
  };
});
