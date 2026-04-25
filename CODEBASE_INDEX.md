# Optikk Frontend — Codebase Index

Orientation for [optikk-frontend](/Users/ramantayal/Desktop/pro/optikk-frontend). This index is aligned to the current repo shape and route wiring.

## Snapshot

- Stack: React 19, TypeScript, Vite 8, TanStack Router, TanStack Query, Zustand, Tailwind, Biome
- Bootstrap: [src/main.tsx](/Users/ramantayal/Desktop/pro/optikk-frontend/src/main.tsx)
- Root app: [src/app/App.tsx](/Users/ramantayal/Desktop/pro/optikk-frontend/src/app/App.tsx)
- Router: [src/app/routes/router.tsx](/Users/ramantayal/Desktop/pro/optikk-frontend/src/app/routes/router.tsx)
- Domain registry: [src/app/registry/domainRegistry.ts](/Users/ramantayal/Desktop/pro/optikk-frontend/src/app/registry/domainRegistry.ts)
- Build and proxy config: [vite.config.ts](/Users/ramantayal/Desktop/pro/optikk-frontend/vite.config.ts)

## Top-level architecture

### App shell

- `src/app/`: global providers, layout, auth gating, router, command palette, stores
- `src/main.tsx`: mounts the app
- `src/app/routes/router.tsx`: mixes marketing routes, login, protected routes, hub routes, and legacy redirects

### Feature ownership

The canonical feature registration lives in [src/app/registry/domainRegistry.ts](/Users/ramantayal/Desktop/pro/optikk-frontend/src/app/registry/domainRegistry.ts).

Current registered product domains:

- `overview`
- `saturation`
- `metrics`
- `logs`
- `traces`
- `infrastructure`
- `settings`

Unregistered but important feature areas:

- `marketing` — public-facing site, rendered via `MarketingShell`; not a domain
- `explorer` (`src/features/explorer/`) — shared DSL search, facets, analytics, and visualization primitives used by Logs, Traces, and Metrics explorers; not a domain, no routes of its own

## Current route model

### Marketing

Marketing pages are rendered through a dedicated layout and shell:

- `/`
- `/features`
- `/pricing`
- `/opentelemetry`
- `/self-host`
- `/architecture`

### Authenticated product routes

Direct protected routes in the router:

- `/overview` → [OverviewHubPage.tsx](/Users/ramantayal/Desktop/pro/optikk-frontend/src/features/overview/pages/OverviewHubPage/OverviewHubPage.tsx)
- `/infrastructure` → frontend-owned infrastructure hub
- `/service` → service hub
- `/service/$serviceName` → service detail page

Additional explorer/product routes come from the domain registry configs inside each feature package.

### Important implication

The current frontend owns significant page composition and interaction logic directly. The backend is primarily the data plane for these screens rather than the author of page layouts.

## Feature map

| Area | Path | Notes |
|------|------|-------|
| Overview | `src/features/overview/` | Overview hub, service hub, service detail, overview dashboard/renderers |
| Saturation | `src/features/saturation/` | Saturation hub and datastore drill-downs |
| Metrics | `src/features/metrics/` | Metrics explorer, charts, store, API hooks |
| Logs | `src/features/log/` | Logs hub, search state, histogram renderer, helpers |
| Traces | `src/features/traces/` | Trace explorer, detail, comparison, waterfall rendering |
| Infrastructure | `src/features/infrastructure/` | Frontend-owned infrastructure hub, APIs, fleet and tab content |
| Settings | `src/features/settings/` | Profile, team, and preferences pages |
| Marketing | `src/features/marketing/` | Public-facing site content and shell |
| Explorer | `src/features/explorer/` | Shared explorer primitives across logs/traces/metrics (DSL search, facets, analytics, trend) |

## Shared layer map

| Area | Path | Notes |
|------|------|-------|
| HTTP client | `src/shared/api/` | Axios client, auth integration, schemas, decode helpers |
| UI primitives | `src/shared/components/primitives/` | Reusable lower-level UI building blocks |
| Product UI | `src/shared/components/ui/` | Charts, dashboard runtime, feedback, tables, overlays |
| Entities | `src/shared/entities/` | Shared log/metric/trace/user models |
| Observability helpers | `src/shared/observability/` | Deep links and shareable view helpers |
| Telemetry | `src/shared/telemetry/` | Browser OTEL bootstrap |
| Hooks and utils | `src/shared/hooks/`, `src/shared/utils/` | Cross-feature helpers |

## Build, proxy, and aliases

[vite.config.ts](/Users/ramantayal/Desktop/pro/optikk-frontend/vite.config.ts) is the source of truth for:

- alias mappings such as `@`, `@app`, `@features`, `@shared`, `@store`
- local dev proxying of `/api` to `VITE_DEV_BACKEND_URL`
- WebSocket proxy support
- manual chunking for feature and runtime bundles

Default local frontend port is `3000`.

## Scripts

From [package.json](/Users/ramantayal/Desktop/pro/optikk-frontend/package.json):

- `yarn dev`
- `yarn type-check`
- `yarn lint`
- `yarn build`
- `yarn preview`
- `yarn ci`

## Deprecated / empty directories

- `src/platform/` — 8 subdirs (`api`, `auth`, `config`, `query`, `state`, `stream`, `url`, `utils`) are all empty. Treat as deprecated legacy scaffold; do not add new code here.

## Cross-repo docs

- Frontend overview: [README.md](/Users/ramantayal/Desktop/pro/optikk-frontend/README.md)
- Backend overview: [../optikk-backend/README.md](/Users/ramantayal/Desktop/pro/optikk-backend/README.md)
- Telemetry contracts: [docs/telemetry-contracts.md](/Users/ramantayal/Desktop/pro/optikk-frontend/docs/telemetry-contracts.md)
- Flow diagrams: [docs/flows/](/Users/ramantayal/Desktop/pro/optikk-frontend/docs/flows/) — frontend-data-flow
