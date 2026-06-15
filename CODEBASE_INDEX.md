# Optikk Frontend — Codebase Index

Orientation for [optikk-frontend](.). This index is aligned to the current repo shape, route wiring, and development conventions.

---

## Core Stack & Key Files
- **Stack**: React 19, TypeScript, Vite 8, TanStack Router, TanStack Query, Zustand, Tailwind, Biome
- **Bootstrap**: [src/main.tsx](src/main.tsx)
- **Root App**: [src/app/App.tsx](src/app/App.tsx)
- **Router Setup**: [src/app/routes/router.tsx](src/app/routes/router.tsx)
- **Domain Registry**: [src/app/registry/domainRegistry.ts](src/app/registry/domainRegistry.ts)
- **Build/Proxy Settings**: [vite.config.ts](vite.config.ts)
- **Firebase Config**: [firebase.json](firebase.json)

---

## Architectural Conventions & Rules

### 1. Theme Color Contract (Datadog-aligned, light-first)
- CSS variables defined in [src/config/themeColors.css](src/config/themeColors.css) map to [tailwind.config.ts](tailwind.config.ts).
- Default theme is **light** (applied via `:root`). Overridden by `[data-theme="dark"]`.
- **Rule**: NEVER use raw hex/rgb/rgba or Tailwind named colors (e.g., `text-red-500`) in `className` within `src/` (except in marketing). Use semantic utilities (e.g., `text-error`, `bg-surface`) or `var(--token)`. Checked via `yarn check:colors`.
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

### 4. API & Routing Rules
- **GET APIs**: Must use `get*` prefix (e.g., `getREDSummary`). `fetch*` is reserved for the browser Fetch API.
- **No Cross-Feature Imports**: Move shared code to `@shared/`.
- **Router Casts**: Use `dynamicNavigateOptions` and `dynamicTo` from [src/shared/utils/navigation.ts](src/shared/utils/navigation.ts) instead of raw `as any` casts.
- **JWT Authorization**: Access tokens reside in memory ([src/app/auth/tokenStore.ts](src/app/auth/tokenStore.ts)). Attached as `Authorization: Bearer` by `authInterceptor.ts`. Single-flight token refresh runs on 401 using httpOnly cookies.

---

## Features & Routes Map

### Feature Folders (`src/features/`)

| Feature | Path | Key Routes | Description & Key Files |
| :--- | :--- | :--- | :--- |
| **Overview** | `overview/` | `/overview` | Datadog-style landing page. Renders Golden Signals KPIs (Requests, Error rate, Latency p99), `SystemPerformanceCard` (combined uPlot area chart), `ServiceHealthGrid` (status tiles), and Top Errors. Entry: [pages/OverviewHubPage/index.tsx](src/features/overview/pages/OverviewHubPage/index.tsx). API: `overviewHubApi.ts`. |
| **Saturation** | `saturation/` | `/saturation`, `/saturation/kafka`, `/saturation/database`, `/saturation/database/query/$queryId` | Single-scroll status pages (no tabs). Renders subsystem health, `FleetMap` hex grids, and `MostSaturatedHostsTable` (reads `/saturation/hosts`). Database query detail page identifies slow queries via fingerprinted query text. Entry: [pages/SaturationPage/index.tsx](src/features/saturation/pages/SaturationPage/index.tsx). |
| **Metrics** | `metrics/` | `/metrics` | Metric query builder supporting line, area, bar, stack, heatmap, and top-list. Offers delta indicators, spatial/temporal stats, and CSV export. Entry: [pages/MetricsExplorerPage/index.tsx](src/features/metrics/pages/MetricsExplorerPage/index.tsx). |
| **Logs** | `log/` | `/logs` | Log explorer featuring severity-stacked trend chart (`/logs/trend`), summary statistics, query DSL parser, JSON trees in expanded rows, and detail drawer. Server-side cursor pagination (no infinite scroll). Entry: [pages/LogsExplorerPage/index.tsx](src/features/log/pages/LogsExplorerPage/index.tsx). Store: `logsExplorerStore.ts`. |
| **Traces** | `traces/` | `/traces`, `/traces/$traceId`, `/traces/compare` | Trace list with facet rails + volume trend charts. Detail page displays KPIs, service chips, and tabbed panels (Waterfall, Service Map, Errors, JSON) with span drawer. Entry: [pages/TracesExplorerPage/index.tsx](src/features/traces/pages/TracesExplorerPage/index.tsx). Store: `tracesStore.ts`. |
| **Infrastructure** | `infrastructure/` | `/infrastructure`, `/infrastructure/hosts/$host`, `/infrastructure/containers/$container` | Infrastructure hub with hosts list, pods, network, and host-map tabs. Detail pages show metrics, container specs, and deep links to logs. Entry: [pages/InfrastructureHubPage.tsx](src/features/infrastructure/pages/InfrastructureHubPage.tsx). |
| **Errors** | `errors/` | `/errors`, `/errors/$groupId` | Error tracker listing issues by occurrence counts and affected services. Details include stack frames panel, context, and occurrences timeline. Entry: [pages/ErrorTrackingPage/index.tsx](src/features/errors/pages/ErrorTrackingPage/index.tsx). |
| **Services** | `services/` | `/services`, `/service-map`, `/deployments`, `/services/$serviceName` | Service catalog lists, map, deployments, and detail. Service details render golden signals KPIs (compares current vs historical), version traffic area charts, and deploy impact tables. Entry: [pages/ServiceCatalogPage/ServiceCatalogPage.tsx](src/features/services/pages/ServiceCatalogPage/ServiceCatalogPage.tsx). |
| **Monitors** | `monitors/` | `/monitors`, `/monitors/new`, `/monitors/$monitorId`, `/monitors/$monitorId/edit`, `/monitors/notifications` | Alerting system UI. Supports metric, APM, and log monitor types. 5-step monitor builder wizard. Detail page features hand-rolled SVG eval chart. Outbound integration supports Slack webhooks. Entry: [pages/MonitorsPage/MonitorsPage.tsx](src/features/monitors/pages/MonitorsPage/MonitorsPage.tsx). |
| **Settings** | `settings/` | `/settings` | Profiles, team members management, and user preference controls. |
| **Marketing** | `marketing/` | `/`, `/features`, `/pricing`, `/opentelemetry`, `/self-host`, `/architecture`, `/privacy`, `/terms`, `/security` | Public-facing site marketing pages. STAR count fetched via GitHub API wrapper. |
| **Explorer** | `explorer/` | — | Shared explorer utilities, DSL input parser (`ExplorerSearchBarDsl`), facets, visualizations, and trend chart primitives used by logs/traces/metrics. |

---

## Shared Layers (`src/shared/`)

| Area | Path | Key Files & Purpose |
| :--- | :--- | :--- |
| **API** | `api/` | JWT token management, standard refresh interceptors, and typed Axios client wrappers. |
| **Components** | `components/` | Reusable UI primitives (`primitives/`), table wrappers (`table/`), custom chart modules (`ui/charts/` including `uPlot` setups, micro charts, and uplot helpers), and dashboard layouts. |
| **Entities** | `entities/` | System-wide TS declarations for metrics, logs, traces, users, and deployments. |
| **Hooks** | `hooks/` | Standard React hooks: `useStandardQuery` for TanStack query defaults, `useVisibilityInterval` for tab-hidden updates, and `useSocketStream` for WebSockets. |
| **Constants** | `constants/` | Global routes mapping ([src/shared/constants/routes.ts](src/shared/constants/routes.ts)) and health alert thresholds. |
| **Utils** | `utils/` | Shared helper scripts: `formatters.ts` (number/duration formatters), `navigation.ts` (TanStack casts), and time range helpers. |

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
- `yarn ci`: Runs full suite validation (`yarn type-check && yarn lint && yarn check:colors && yarn check:dupes && yarn build`).
