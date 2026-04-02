# Optikk Lens Frontend (React/Vite)

Optikk Lens Frontend is a modern, high-performance single-page application (SPA) providing real-time visualization for the Optikk observability platform. Built on React 18 and Vite, it offers an industry-leading experience for monitoring traces, logs, and metrics with a focus on ease of use and AI/LLM integration.

## Core Architecture

The frontend is architected as a feature-based modular system designed for scalability, performance, and developer efficiency.

### Technology Stack & Tools

- **React 18 & TypeScript**: Core UI library and type-safe development.
- **Vite**: Next-generation frontend tooling and fast dev server.
- **Ant Design (antd)**: Enterprise-grade UI component library for consistent layouts.
- **Tailwind CSS**: Utility-first styling for bespoke and responsive UI design.
- **Zustand**: Lightweight, flexible state management for global app state (e.g., theme, time-range, session).
- **TanStack Query**: Powering the asynchronous data tier with intelligent caching and automated refetching.
- **Playwright**: Comprehensive E2E testing framework for UI reliability.

### Architectural Patterns

- **Feature-Based Organization**: Code is grouped by domain (e.g., `src/features/traces`, `src/features/log`) rather than by technical type. Each feature encapsulates its own components, hooks, types, and logic.
- **Centralized Design System**: Shared UI primitives and high-level components are maintained in `src/design-system` and `src/shared/components`.
- **API Integration Layer**: All network requests are abstracted into services within `src/shared/api`, providing a unified interface for data fetching and error handling.
- **Reactive State**: Using Zustand for ephemeral app state and TanStack Query for server-side state, ensuring the UI is always in sync with the backend.

## Project Structure

```text
optic-frontend/
├── src/
│   ├── app/                 # Routing, layout, and app-level providers
│   ├── features/            # Feature-specific modules (Traces, Logs, Metrics, etc.)
│   ├── shared/              # Reusable hooks, utilities, and API clients
│   ├── design-system/       # Shared UI primitives based on AntD and Tailwind
│   ├── config/              # App-level constants, colors, and icons
│   ├── store/               # Global Zustand stores
│   └── main.tsx             # Application mount point
├── public/                  # Static assets
├── playwright/              # E2E test suites
└── vite.config.ts           # Build and proxy configuration
```

## Local Development

### 1. Prerequisites

You'll need a running Optikk Backend and infrastructure (MariaDB, ClickHouse, etc.). Use the central deployment guide:
👉 [**Full Stack Local Deployment Guide**](../deploy/README.md)

### 2. Setup

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dev server usually runs at `http://localhost:3000` (or `5173`). It is configured to proxy `/api/*` requests to your local backend automatically.

**Socket.IO (live tail):** The app connects to the same origin with path `/socket.io` and namespace `/live`. The Vite dev server also proxies `/socket.io` to the backend (with WebSocket upgrade) so **Logs** and **Traces** live tail can reach the API server. If you change the backend URL, set `VITE_DEV_BACKEND_URL` in `.env` (same as for `/api`).

**Production / separate UI host:** If the static UI is served from a different origin than the API, your reverse proxy must forward both `/api` and `/socket.io` to the Optikk backend (and enable WebSocket upgrades for `/socket.io`). Example (nginx):

```nginx
location /api/ {
  proxy_pass http://optikk_backend;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
location /socket.io/ {
  proxy_pass http://optikk_backend;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}
```

### 3. Build & CI

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Preview build
npm run preview
```

## Key Features

- **Distributed Tracing Explorer**: Interactive waterfall charts with critical path analysis.
- **Advanced Log Management**: Full-text search with structured attribute filtering.
- **Multi-tenant Dashboarding**: Dynamic layouts and charts configured via the backend.
- **AI Monitoring**: Specialized views for tracking LLM tokens, costs, and token-level telemetry.
