# Optikk Frontend

Optikk Frontend is the React/Vite application for the Optikk product UI. It contains the authenticated observability app, the marketing site, frontend-owned hub pages, shared dashboard/rendering infrastructure, and browser telemetry wiring.

## Current stack

- React 19
- TypeScript
- Vite 8
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS
- Biome

See [package.json](package.json) for the current scripts and dependency versions.

## App shape

The application has two broad surfaces:

- marketing routes rendered under a dedicated marketing layout
- authenticated product routes rendered inside the main app shell

### Key app entrypoints

- [src/main.tsx](src/main.tsx): bootstrap
- [src/app/App.tsx](src/app/App.tsx): root app providers
- [src/app/routes/router.tsx](src/app/routes/router.tsx): route table
- [src/app/registry/domainRegistry.ts](src/app/registry/domainRegistry.ts): domain registration for product features
- [vite.config.ts](vite.config.ts): aliases, dev proxy, build chunking

## Current feature layout

```text
optikk-frontend/
├── src/app/           # Bootstrap, routing, providers, shell
├── src/features/      # Product and marketing features
├── src/shared/        # Shared api, ui, hooks, entities, telemetry, utils
└── src/config/        # App config constants
```

Current feature directories under `src/features`:

- `overview`
- `saturation`
- `metrics`
- `log`
- `traces`
- `infrastructure`
- `settings`
- `marketing`
- `explorer` (shared explorer infrastructure)

## Product routing

The route table in [src/app/routes/router.tsx](src/app/routes/router.tsx) shows the current product direction:

- `/overview`: frontend-owned overview hub
- `/infrastructure`: frontend-owned infrastructure hub
- `/service`: service hub
- `/service/:serviceName`: service detail page
- explorer-style routes contributed by the domain registry for metrics, logs, traces, saturation, and settings
- marketing pages under their own layout

The frontend now owns much more of the page composition than earlier versions of the project. Backend APIs provide data; page structure and interaction logic largely live here.

## Shared layers

- `src/shared/api/`: HTTP client, auth integration, decode boundary
- `src/shared/components/`: reusable UI and dashboard building blocks
- `src/shared/entities/`: shared domain models
- `src/shared/observability/`: deep links and share/export helpers
- `src/shared/telemetry/`: browser OpenTelemetry bootstrap

## Local development

### Prerequisites

- Node 18+
- Corepack enabled
- running local Optikk backend on `http://localhost:19090` unless overridden

### Install and run

```bash
corepack enable
yarn install
yarn dev
```

The Vite dev server runs on `http://localhost:3000` by default and proxies `/api` to the backend. WebSocket proxying is enabled for live features.

If the backend is on a different origin, set `VITE_DEV_BACKEND_URL`.

## Quality commands

```bash
yarn type-check
yarn lint
yarn build
yarn ci
```

## Related docs

- Codebase map: [CODEBASE_INDEX.md](CODEBASE_INDEX.md)
- Backend sibling repo: [../optikk-backend/README.md](../optikk-backend/README.md)
