# Optikk Frontend — Codebase Index

Orientation for [optikk-frontend](.). This index is aligned to the current repo shape, route wiring, and development conventions.

---

## Core Stack & Key Files
- **Stack**: React 19, TypeScript, Vite 8, TanStack Router, TanStack Query, Zustand, Tailwind, Biome
- **Bootstrap**: [src/main.tsx](src/main.tsx)
- **Root App**: [src/app/App.tsx](src/app/App.tsx) (creates the router from the generated route tree)
- **Routing**: file-based TanStack Router routes in [src/routes/](src/routes/) (generated [src/routeTree.gen.ts](src/routeTree.gen.ts))
- **Domain Registry**: [src/app/registry/domainRegistry.ts](src/app/registry/domainRegistry.ts) — feeds sidebar navigation and dashboard panel registration only; it does NOT wire routes
- **Build/Proxy Settings**: [vite.config.ts](vite.config.ts)

---

## Architectural Conventions & Rules

### 1. Theme Color Contract (Datadog-aligned, light-first)
- CSS variables defined in [src/config/themeColors.css](src/config/themeColors.css) map to [tailwind.config.ts](tailwind.config.ts).
- Default theme is **light** (applied via `:root`). Overridden by `[data-theme="dark"]`.
- **Rule**: NEVER use raw hex/rgb/rgba or Tailwind named colors (e.g., `text-red-500`) in `className` within `src/`. Use semantic utilities (e.g., `text-error`, `bg-surface`) or `var(--token)`. Checked via `yarn check:colors`.
- Global font-family variables `--font` (Inter) and `--font-mono` (JetBrains Mono) are declared in [src/index.css](src/index.css).

### 2. Formatting Guidelines
- Display formatting (`formatNumber`, `formatDuration`, `formatRelativeTime`) MUST be imported from [src/shared/utils/formatters.ts](src/shared/utils/formatters.ts).
- **Rule**: Never define local formatting helpers in components. Checked via `yarn check:dupes`.

### 3. State Management & Querying
- **Global Store**: [src/app/store/appStore.ts](src/app/store/appStore.ts) manages theme, timezone, timeRange, and `refreshKey`.
- **Standard Queries**: Prefer `useStandardQuery` over raw `useQuery` for default behaviors.
- **Query Keys**:
  - **Dashboard queries**: stable keys (no `refreshKey`), using `useInvalidateQueriesOnAppRefresh`.
  - **Explorer queries**: include `refreshKey` in `queryKey`.
- **Query Loading**: Checked via `isPending && data === undefined`. Always set `placeholderData: keepPreviousData`.

### 4. Import Aliases (exactly four)
- `@/*` → `src/*`, `@app/*` → `src/app/*`, `@shared/*` → `src/shared/*`, `@config/*` → `src/config/*`.
- **Source of truth**: the `paths` block in [tsconfig.json](tsconfig.json). [scripts/check-boundaries.mjs](scripts/check-boundaries.mjs) reads it directly (cannot drift). [vite.config.ts](vite.config.ts) mirrors it by hand — the only place to keep in sync. Do not add new aliases.

### 5. API & Routing Rules
- **GET APIs**: Must use `get*` prefix (e.g., `getREDSummary`). `fetch*` is reserved for the browser Fetch API.
- **No Cross-Feature Imports**: Move shared code to `@shared/`. Enforced by `yarn check:boundaries` ([scripts/check-boundaries.mjs](scripts/check-boundaries.mjs)): features may import only `@shared` and themselves; `@shared` must never import features.
- **Router Casts**: Use `dynamicNavigateOptions` and `dynamicTo` from [src/shared/utils/navigation.ts](src/shared/utils/navigation.ts) instead of raw `as any` casts.
- **JWT Authorization**: Access tokens reside in memory ([src/app/auth/tokenStore.ts](src/app/auth/tokenStore.ts)). Attached as `Authorization: Bearer` by `authInterceptor.ts`. Single-flight token refresh runs on 401 using httpOnly cookies.

### 6. Page Entry Convention (one shape)
- Every page lives in its own folder: `features/<x>/pages/<Name>Page/<Name>Page.tsx` holds the component (`export default`), and a one-line `index.tsx` re-exports it: `export { default } from "./<Name>Page";`.
- Import pages by directory (`@/features/<x>/pages/<Name>Page`), never the inner file. Flat `pages/<Name>.tsx` files and bare `pages/<Name>/index.tsx` components are not allowed.

### 7. How to Add a Page (three steps)
1. **Route**: add a file under [src/routes/](src/routes/) (`_app/` for authenticated app pages) that imports the page and sets it as the route `component`. The route tree regenerates automatically ([src/routeTree.gen.ts](src/routeTree.gen.ts)).
2. **Page**: create `features/<x>/pages/<Name>Page/<Name>Page.tsx` + the one-line `index.tsx` re-export (see §6).
3. **Nav**: add a `DomainNavigationItem` to `features/<x>/index.ts` so it appears in the sidebar. That is the registry's only role — it does not wire routes.

---

## Features & Routes Map

### Feature Folders (`src/features/`)

| Feature | Path | Key Routes | Description & Key Files |
| :--- | :--- | :--- | :--- |
| **Overview** | `overview/` | `/overview` | Datadog-style landing page. Renders Golden Signals KPIs (Requests, Error rate, Latency p99), `SystemPerformanceCard` (combined uPlot area chart), `ServiceHealthGrid` (status tiles), and Top Errors. Entry: [pages/OverviewHubPage/index.tsx](src/features/overview/pages/OverviewHubPage/index.tsx). API: `overviewHubApi.ts`. |
| **Saturation** | `saturation/` | `/saturation`, `/saturation/kafka`, `/saturation/database`, `/saturation/database/query/$queryId` | Single-scroll status pages (no tabs). Renders subsystem health, `FleetMap` hex grids, and `MostSaturatedHostsTable` (reads `/saturation/hosts`). Database query detail page identifies slow queries via fingerprinted query text. Entry: [pages/SaturationPage/index.tsx](src/features/saturation/pages/SaturationPage/index.tsx). |
| **Metrics** | `metrics/` | `/metrics` | Metric query builder supporting line, area, bar, stack, heatmap, and top-list. Offers delta indicators, spatial/temporal stats, and CSV export. Entry: [pages/MetricsExplorerPage/index.tsx](src/features/metrics/pages/MetricsExplorerPage/index.tsx). |
| **Logs** | `logs/` | `/logs` | Log explorer featuring severity-stacked trend chart (`/logs/trend`), summary statistics, query DSL parser, JSON trees in expanded rows, and detail drawer. Server-side cursor pagination (no infinite scroll). Entry: [pages/LogsExplorerPage/index.tsx](src/features/logs/pages/LogsExplorerPage/index.tsx). Data layer + table/detail viewer live in `@shared/logs` (store: `logsExplorerStore.ts`). |
| **Traces** | `traces/` | `/traces`, `/traces/$traceId`, `/traces/compare` | Trace list with facet rails + volume trend charts. Detail page displays KPIs, service chips, and tabbed panels (Waterfall, Service Map, Errors, JSON) with span drawer. Entry: [pages/TracesExplorerPage/index.tsx](src/features/traces/pages/TracesExplorerPage/index.tsx). Store: `tracesStore.ts`. |
| **Infrastructure** | `infrastructure/` | `/infrastructure`, `/infrastructure/hosts/$host`, `/infrastructure/containers/$container` | Infrastructure hub with hosts list, pods, network, and host-map tabs. Detail pages show metrics, container specs, and deep links to logs. Entry: [pages/InfrastructureHubPage/InfrastructureHubPage.tsx](src/features/infrastructure/pages/InfrastructureHubPage/InfrastructureHubPage.tsx). |
| **Errors** | `errors/` | `/errors`, `/errors/$groupId` | Error tracker listing issues by occurrence counts and affected services. Details include stack frames panel, context, and occurrences timeline. Entry: [pages/ErrorTrackingPage/index.tsx](src/features/errors/pages/ErrorTrackingPage/index.tsx). |
| **Services** | `services/` | `/services`, `/service-map`, `/deployments`, `/services/$serviceName` | Service catalog lists, map, deployments, and detail. Service details render golden signals KPIs (compares current vs historical), version traffic area charts, and deploy impact tables. Entry: [pages/ServiceCatalogPage/ServiceCatalogPage.tsx](src/features/services/pages/ServiceCatalogPage/ServiceCatalogPage.tsx). |
| **Monitors** | `monitors/` | `/monitors`, `/monitors/new`, `/monitors/$monitorId`, `/monitors/$monitorId/edit`, `/monitors/notifications` | Alerting system UI. Supports metric, APM, and log monitor types. 5-step monitor builder wizard. Detail page features hand-rolled SVG eval chart. Outbound integration supports Slack webhooks. Entry: [pages/MonitorsPage/MonitorsPage.tsx](src/features/monitors/pages/MonitorsPage/MonitorsPage.tsx). |
| **Settings** | `settings/` | `/settings` | Tenant info (API key reveal) + admin-only **Members** tab: list/invite users and promote/demote admin↔member (`components/tabs/SettingsMembersTab`, `api/membersApi`, `hooks/useMembers`). The Members tab renders only when `authStore.tenant.role === "admin"`; the server enforces tenant scoping and a last-admin guard. |
| **Onboarding** | `onboarding/` | `/welcome` | Post-signup page ([pages/WelcomePage/WelcomePage.tsx](src/features/onboarding/pages/WelcomePage/WelcomePage.tsx)) showing the tenant API key + OTLP endpoint + collector-config snippet tabs. Feature folder holds `TrialBanner` (days-left banner in `MainLayout`), `otlpEndpoint.ts`, and the transient signup-key handoff (`shared/api/auth/apiKeyHandoff.ts`). |

---

## Shared Layers (`src/shared/`)

| Area | Path | Key Files & Purpose |
| :--- | :--- | :--- |
| **API** | `api/` | HTTP transport in `http/` (Axios client, auth/error interceptors, baseUrl), JWT token management, and domain API modules consumed across features: `topology.ts`, `errors.ts`, `hosts.ts`, `suggestions.ts`, `red/` (redApi + buildREDFilters), `traces/` (tracesApi, buildTracesFilters, types, zod schemas), plus cross-feature types (`service-types.ts`: `RequestTime`, `PageInfo`, `PaginatedResponse`). |
| **Search** | `search/` | Explorer kit used by traces/logs/metrics/dashboards: filter/query types, DSL parser + search bar (`ExplorerSearchBarDsl`, `DslSearchBarWithChips`), suggestions, facets, explorer state/query/keyboard hooks, and trend primitives. |
| **Logs kit** | `logs/` | Log data layer + viewer used by the logs feature, services, and traces: `api/` (query/trend/facets/byId/traceLogs), `types/`, `utils/` (severity, transformers, trace correlation), `store/logsExplorerStore.ts`, and `components/table` + `components/detail`. |
| **Metrics kit** | `metrics/` | Metric query kit used by the metrics feature, dashboards, and overview: `types.ts`, `constants/`, `api/metricsExplorerApi.ts`, hooks (`useMetricsExplorerQuery`, `useMetricNames`, `useMetricTags`), utils (`chartSeries`, `formatStat`, `seriesStats`, `formulaEvaluator`), and components (`MetricQueryBuilder`, `DeltaBadge`, `MetricSegmentedControl`). |
| **Components** | `components/` | Reusable UI primitives (`primitives/`), table wrappers (`table/`), custom chart modules (`ui/charts/` including `uPlot` setups, micro charts, and uplot helpers), dashboard layouts, `ui/PanelCard.tsx`, and domain drawers (`ui/drawers/ServiceDetailDrawer`). Health indicators: `ui/data-display/status/` (`StatusDot`, `StatusPill`, and the canonical `HealthStatus` vocabulary) — features translate their local status vocab to `HealthStatus` at the call site. |
| **Hooks** | `hooks/` | Standard React hooks: `useStandardQuery` for TanStack query defaults, `useVisibilityInterval` for tab-hidden updates, and `useSocketStream` for WebSockets. |
| **Constants** | `constants/` | Global routes mapping ([src/shared/constants/routes.ts](src/shared/constants/routes.ts)) and health alert thresholds. |
| **Utils** | `utils/` | Shared helper scripts: `formatters.ts` (number/duration formatters), `metricFormatters.ts` (`fmtNum`/`fmtMs`/`fmtPct` display helpers), `timeBounds.ts` (resolve/shift/zoom time ranges), and `navigation.ts` (TanStack casts). |

---

## Validation & Build Scripts

These commands check code quality, formatting, and theme safety:

- `yarn dev`: Launch Vite local dev server (default port `3000`).
- `yarn build`: Compile and build production bundles.
- `yarn type-check`: Run TypeScript compiler validation without output emission.
- `yarn lint`: Check styles and imports with Biome.
- `yarn lint:fix` / `yarn format`: Automatically format and correct lints.
- `yarn check:colors`: Verify that no raw color codes or Tailwind named color classes are used in CSS/TSX files.
- `yarn check:dupes`: Ensure that display formatters are only declared in their sanctioned shared file.
- `yarn check:boundaries`: Enforce import boundaries (no cross-feature imports; no shared→feature imports). New violations fail; the allowlist in `scripts/boundaries-allowlist.json` is empty and must stay that way.
- `yarn ci`: Runs full suite validation (`yarn type-check && yarn lint && yarn check:colors && yarn check:dupes && yarn check:boundaries && yarn build`).
