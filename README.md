# Optikk Lens Frontend (React/Vite)

Optikk Lens Frontend is a modern, high-performance single-page application (SPA) providing real-time visualization for the Optikk observability platform. Built on React 19 and Vite, it offers an industry-leading experience for monitoring traces, logs, and metrics with a focus on ease of use and AI/LLM integration.

## Core Architecture

The frontend is architected as a feature-based modular system designed for scalability, performance, and developer efficiency.

### Technology Stack & Tools

- **React 19 & TypeScript**: Core UI library and type-safe development using native ref prop and `use()`.
- **Vite 8**: Next-generation frontend tooling and fast dev server.
- **TanStack Router**: Type-safe routing for nested and dynamic route management.
- **Tailwind CSS**: Utility-first styling for bespoke and responsive UI design.
- **Zustand 5**: Atomic state management for global app state with optimized selectors.
- **TanStack Query 5**: Powering the asynchronous data tier with intelligent caching and automated refetching.
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

**Live tail (WebSocket):** The app opens a WebSocket to the same origin at **`/api/v1/ws/live`** (session cookies). The Vite dev server proxies **`/api`** to the backend with **`ws: true`**, so live tail works in dev without extra paths. If you change the backend URL, set `VITE_DEV_BACKEND_URL` in `.env`.

**Production / separate UI host:** Proxy **`/api`** to the Optikk backend with HTTP/1.1 and WebSocket upgrade support (live tail uses the same `/api` prefix). Example (nginx):

```nginx
location /api/ {
  proxy_pass http://optikk_backend;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
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
