# Optikk Frontend — Codebase Index

Orientation for [optikk-frontend](.). This index is aligned to the current repo shape and route wiring.

## Snapshot

- Stack: React 19, TypeScript, Vite 8, TanStack Router, TanStack Query, Zustand, Tailwind, Biome
- Bootstrap: [src/main.tsx](src/main.tsx)
- Root app: [src/app/App.tsx](src/app/App.tsx)
- Router: [src/app/routes/router.tsx](src/app/routes/router.tsx)
- Domain registry: [src/app/registry/domainRegistry.ts](src/app/registry/domainRegistry.ts)
- Build and proxy config: [vite.config.ts](vite.config.ts)

## Top-level architecture

### App shell

- `src/app/`: global providers, layout, auth gating, router, command palette, stores
- `src/main.tsx`: mounts the app
- `src/app/routes/router.tsx`: mixes marketing routes, login, protected routes, hub routes, and legacy redirects

### Feature ownership

The canonical feature registration lives in [src/app/registry/domainRegistry.ts](src/app/registry/domainRegistry.ts).

Current registered product domains:

- `overview`
- `saturation`
- `metrics`
- `logs`
- `traces`
- `infrastructure`
- `settings`

Unregistered but important feature areas:

- `marketing` — public-facing site, rendered via bespoke React pages; not a domain
- `explorer` (`src/features/explorer/`) — shared DSL search, facets, analytics, and visualization primitives used by Logs, Traces, and Metrics explorers; not a domain, no routes of its own
- `errors` (`src/features/errors/`) — error-tracking pages (`/errors`, `/errors/$groupId`); routes wired directly in `router.tsx`
- `services` (`src/features/services/`) — service catalog, service map, deployments pages (`/services`, `/service-map`, `/deployments`); routes wired directly in `router.tsx`; also exports components consumed by the overview service page

## Current route model

### Marketing

Marketing pages are rendered through a dedicated layout and bespoke page components under `src/features/marketing/pages/`:

- `/` → [HomePage.tsx](src/features/marketing/pages/HomePage/HomePage.tsx)
- `/features` → [FeaturesPage.tsx](src/features/marketing/pages/FeaturesPage/FeaturesPage.tsx)
- `/pricing` → [PricingPage.tsx](src/features/marketing/pages/PricingPage/PricingPage.tsx)
- `/opentelemetry` → [OpenTelemetryPage.tsx](src/features/marketing/pages/OpenTelemetryPage/OpenTelemetryPage.tsx)
- `/self-host` → [SelfHostPage.tsx](src/features/marketing/pages/SelfHostPage/SelfHostPage.tsx)
- `/architecture` → [ArchitecturePage.tsx](src/features/marketing/pages/ArchitecturePage/ArchitecturePage.tsx)
- `/privacy` → [PrivacyPolicyPage.tsx](src/features/marketing/pages/PrivacyPolicyPage/PrivacyPolicyPage.tsx)
- `/terms` → [TermsOfServicePage.tsx](src/features/marketing/pages/TermsOfServicePage/TermsOfServicePage.tsx)
- `/security` → [SecurityPage.tsx](src/features/marketing/pages/SecurityPage/SecurityPage.tsx)

Marketing pages dynamically fetch genuine GitHub stars using the [useGitHubStars](src/features/marketing/hooks/useGitHubStars.ts) hook.

### Authenticated product routes

Direct protected routes in the router:

- `/overview` → [OverviewHubPage.tsx](src/features/overview/pages/OverviewHubPage/OverviewHubPage.tsx)
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
| Saturation | `src/features/saturation/` | Saturation hub (Overview surface ported from the Optikk design handoff) + per-datastore / Kafka drill-downs. `pages/SaturationPage/` is the `/saturation` landing page; composition root is `index.tsx`, data fans out from `hooks/useSaturationOverviewModel.ts`, view-model builders live in `view-models/`, presentation in `components/` (Tailwind utilities only — no CSS file; shared table classes in `components/tableClasses.ts`, uses `themeColors.css` tokens via arbitrary values). Renders: subsystem cards (Kafka / Database / Redis), worst-saturated-systems table, top-Kafka-topics table. Subnav links to existing Kafka & datastore detail pages. Cross-fleet hex map, queues/storage subsystems, alerts feed and refresh/export buttons from the design are intentionally omitted because the backend has no matching endpoints. |
| Metrics | `src/features/metrics/` | Metrics explorer, charts, store, API hooks |
| Logs | `src/features/log/` | Rebuilt logs explorer (clean-slate, Datadog-class). Components grouped: toolbar, kpi, facets, trend, table, detail. Feature-scoped Zustand store at `store/logsExplorerStore.ts`. JSON auto-detection in body cells. |
| Traces | `src/features/traces/` | Trace explorer, detail, comparison. Trace detail page uses Datadog-parity layout: full-width viz (Waterfall + Flame Graph; waterfall renders event dots on bars at event timestamps) with non-modal resizable right `SpanDrawer` for span detail (Info / Logs / Events / Links / Infra tabs, hide-when-empty). Info tab includes a "Where this happens" ancestor chain + "Timing" KV grid; drawer header shows a "critical path" pill when the selected span is on the critical path. Composition root at `pages/TraceDetailPage/components/TraceDetailLayout.tsx`. State in `store/tracesStore.ts` (persists `visualizationTab`, `spanDetailTab`, `drawerWidthPx`); URL holds `?span=<id>`. Hotkeys: `/` filter, `j`/`k` or ↑/↓ navigate spans, `c` copy trace id, `e` cycle errors, `1`/`2` switch viz, `[`/`]` resize drawer, `Esc` close. |
| Infrastructure | `src/features/infrastructure/` | Frontend-owned infrastructure hub, APIs, fleet and tab content |
| Settings | `src/features/settings/` | Profile, team, and preferences pages |
| Marketing | `src/features/marketing/` | Public-facing site content and shell |
| Explorer | `src/features/explorer/` | Shared explorer primitives across logs/traces/metrics (DSL search, facets, analytics, trend) |

## Explorer conventions

- Logs and traces use the shared `ExplorerSearchBarDsl` DSL search. Pass `scope="logs"` or `scope="traces"` so `parseDsl` validates against the correct field catalog.
- Logs value suggestions are fed from the logs facets response into `LogsToolbar.valueSuggestions`.
- Logs results use cursor-backed pages from `useLogsExplorer().list.pages` and render one page at a time with footer navigation. Do not reintroduce near-end infinite append.
- The logs explorer uses a feature-scoped Zustand store (`logsExplorerStore`) for UI-only state (expanded rows, density, wrap lines, facet collapsed, detail tab, column widths). Filters remain URL-synced via shared `useExplorerState`.
- Log rows feature severity-colored gutter bars, inline expand with JSON tree detection, and severity-based background tinting (error rows get subtle red tint).
- The log detail panel is rendered inside `DetailDrawer` (shared Radix Dialog slide-over) with 4 tabs: Message, Fields, JSON, Correlation.
- `ResultsArea` accepts an optional `rowHeight` for denser or more readable explorer rows while keeping the shared virtual list implementation.

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

[vite.config.ts](vite.config.ts) is the source of truth for:

- alias mappings such as `@`, `@app`, `@features`, `@shared`, `@store`
- local dev proxying of `/api` to `VITE_DEV_BACKEND_URL`
- WebSocket proxy support
- manual chunking for feature and runtime bundles

Default local frontend port is `3000`.

Firebase Hosting is configured via [firebase.json](firebase.json) with client-side SPA routing rewrites to `/index.html` and long-term asset caching headers.

## Scripts

From [package.json](package.json):

- `yarn dev`
- `yarn type-check`
- `yarn lint`
- `yarn build`
- `yarn deploy:firebase` — compiles with Vite and deploys to Firebase Hosting
- `yarn preview`
- `yarn ci`

## Cross-repo docs

- Frontend overview: [README.md](README.md)
- Backend overview: [../optikk-backend/README.md](../optikk-backend/README.md)
- Telemetry contracts: [docs/telemetry-contracts.md](docs/telemetry-contracts.md)
- Flow diagrams: [docs/flows/](docs/flows/) — frontend-data-flow
