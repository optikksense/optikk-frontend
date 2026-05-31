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
- `src/app/layout/Header.tsx` has a Sun/Moon **theme quick-toggle** (right cluster) → `appStore.setTheme` + `settingsService.updatePreferences`; `ThemeProvider` applies `data-theme`/`.dark`. Theme is also settable in Settings → Preferences.

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

### Login

- `/login` → [LoginPage](src/app/auth/pages/LoginPage/LoginPage.tsx) — two-column shell (`grid-cols-[1.05fr_1fr]`, single column under `lg`). Left side is `LoginBrandPanel` (Optikk logomark + name, "Observability" eyebrow, gradient headline, sub, year/Privacy/Terms/Security row; radial gradients + soft 32px grid mask). Right side stacks `LoginTopBar` (trial CTA), `LoginHeader` (form title), `LoginForm` (icon-prefixed `LoginField` inputs, password Show/Hide trailing slot, "Forgot?" hint, "Keep me signed in" checkbox, `Sign in` submit + arrow, "Request access" line, legal blurb) and `LoginFooter` (status pill + version link). Form state + submission live in [useLoginSubmit.ts](src/app/auth/pages/LoginPage/useLoginSubmit.ts). Tailwind utilities only — uses existing theme tokens (`--bg-canvas`, `--bg-card`, `--border-color`, `--text-*`, `--color-primary`, `--color-healthy`) plus new login tokens in [themeColors.css](src/config/themeColors.css) (`--login-link`, `--login-link-hover`, `--login-submit-fg`, `--login-focus-ring`, `--login-grid-line`, `--login-headline-from/to`, `--login-aside-bg`) that flip between dark and light themes so the page renders correctly in both.

### Authenticated product routes

Direct protected routes in the router:

- `/overview` → [OverviewHubPage](src/features/overview/pages/OverviewHubPage/index.tsx)
- `/infrastructure` → frontend-owned infrastructure hub
- `/services` → [ServiceCatalogPage](src/features/services/pages/ServiceCatalogPage/ServiceCatalogPage.tsx) (sidebar "Service" nav item)
- `/services/$serviceName` → service detail page

Additional explorer/product routes come from the domain registry configs inside each feature package.

### Important implication

The current frontend owns significant page composition and interaction logic directly. The backend is primarily the data plane for these screens rather than the author of page layouts.

## Feature map

| Area | Path | Notes |
|------|------|-------|
| Overview | `src/features/overview/` | Single-page `/overview` landing (Datadog-style). Composition root [pages/OverviewHubPage/index.tsx](src/features/overview/pages/OverviewHubPage/index.tsx); sections under `components/` (`OverviewHero` KPIs, `SystemPerformanceCard` request/error overlay, `ServiceHealthGrid` colored tiles, `TopErrorsCard`, `RecentDeploysCard`, `InfrastructureStrip` linking to Kafka/Database saturation). `OverviewHero` shows 4 KPIs matching the design — Requests · Error rate · Latency p99 · **Apdex** (`useOverviewApdexQuery` folds per-service `/spans/red/apdex` rows into one volume-weighted score). Data fans out from `hooks/useOverviewModel.ts` over `getRedSummary`, `getApdex`, `getRedRequestRateSeries`, `getRedErrorRateSeries`, `getErrorHotspot`, `deploymentsApi.getLatestByService`. Active-incidents, on-call, watchdog, and Redis/Queues/Storage tiles from the design are omitted because the backend has no matching endpoints. Sibling pages: service hub, service detail, deployment-compare drawer. |
| Saturation | `src/features/saturation/` | Saturation hub (Overview surface ported from the Optikk design handoff) + per-datastore / Kafka drill-downs. `pages/SaturationPage/` is the `/saturation` landing page; composition root is `index.tsx`, data fans out from `hooks/useSaturationOverviewModel.ts`, view-model builders live in `view-models/`, presentation in `components/` (Tailwind utilities only — no CSS file; shared table classes in `components/tableClasses.ts`, uses `themeColors.css` tokens via arbitrary values). Renders: subsystem cards (Kafka / Database / Redis), worst-saturated-systems table, top-Kafka-topics table. Subnav links to existing Kafka & datastore detail pages. Queues/storage subsystems, alerts feed and refresh/export buttons from the design are intentionally omitted because the backend has no matching endpoints. **Kafka hub** (`pages/SaturationKafkaPage/`) matches the Optikk-handoff `KafkaScreen` layout: composition root composes `KafkaPageHeader` (title + degraded `Pill` when total consumer lag ≥ 1000 msgs) + `SaturationSubnav` + `KafkaKpiStrip` (3 data-backed cards: Msgs in/s · Msgs out/s · Bytes/s — under-replicated/offline/disk omitted; total lag is shown as the overview chart) + `PageTabs` (Overview · Topics · Consumer groups · E2E latency) → lazy-loaded `tabs/{OverviewTab,TopicsTab,ConsumerGroupsTab,E2ELatencyTab}.tsx`. Overview shows `ThroughputChart` + `ConsumerLagChart` + publish/receive latency + publish-errors panels; a **Lag tab** wires `lag-per-partition`; the **Consumer-groups tab** adds process rate / process latency / process+consume errors / rebalance panels; E2E latency renders aggregated publish/receive/process p95 from `/saturation/kafka/e2e-latency`. `KafkaTopicDetailPage`/`KafkaGroupDetailPage` add per-partition panels (`getKafka{Topic,Group}Partitions`). Per-broker CPU saturation card, Bytes-in/Under-replicated KPIs, Rebalance/Export header buttons from the design are dropped (no backend); the unused `summary-stats`/`broker-connections`/`client-op-*` kafka client wrappers were removed. **Database hub** (`pages/SaturationDatabasePage/`) follows the same pattern: `DatabasePageHeader` (title + degraded `Pill` when `error_rate ≥ 1%` or `p95_latency_ms ≥ 1000`) + `SaturationSubnav` + `DatabaseKpiStrip` (5 data-backed cards: Queries/s · Active conn · p50 · p95 · p99 — cache-hit and "% of pool" omitted, no aggregate source) + `PageTabs` (Overview · Queries · Systems) → lazy-loaded `tabs/{OverviewTab,QueriesTab,SystemsTab}.tsx`. Overview = `QpsChart` + `LatencyPercentilesChart`; Queries = `SlowQueriesPreviewTable`; Systems = `SystemsTable`. `DatastoreDetailPage` adds latency/ops breakdown panels (by operation/collection/namespace/server), a read-vs-write panel, a latency-distribution panel, and a **connection-pool panel** (utilization/pending/limits + wait/create/use p95) via the new `api/databaseConnectionsApi.ts` wrappers over `/saturation/database/connections/*`. Topology SVG, Replication-lag KPI, Failover/Export buttons, Tables/Replication/Locks tabs from the design are dropped (no backend). All three pages (+ the datastore/queries drill-downs) are **token-only and render correctly in both light & dark** — the dark-only `--err-c/--warn-c/--info-c/--accent-2` tokens and white-alpha `rgba(255,255,255,…)` surfaces were replaced with theme-safe `--color-*`/`--bg-*` tokens (`color-mix` tints for status chips/banners). The synthetic `placeholderSeries` subsystem-card sparkline was removed (real-data-only) and `components/Sparkline.tsx` + `view-models/placeholderSeries.ts` deleted. |
| Metrics | `src/features/metrics/` | Metrics explorer brought up to the Optikk-handoff `MetricsScreen` design. Composition root [pages/MetricsExplorerPage/index.tsx](src/features/metrics/pages/MetricsExplorerPage/index.tsx) renders `PageHeader` (with `components/MetricsHeaderActions.tsx`: Open in Notebook / Create monitor / Export / Save graph — Create-monitor deep-links `/monitors/new?from=metrics&metric=<name>` like the traces `CreateMonitorButton`, Export downloads the group-by-breakdown CSV via `utils/breakdownCsv.ts`, Notebook/Save-graph are toast stubs) + the existing `MetricQueryBuilder` card + a chart+top-series grid + a fleet-heatmap+recent grid + the group-by table. Every panel is derived FE-side from the existing `useMetricsExplorerQuery` results (`Record<queryId,{timestamps,series[]}>`) — no new endpoints. **Toolbar** (`components/MetricsExplorerToolbar.tsx`) is the design's view-type segmented control via `components/MetricSegmentedControl.tsx` (Line/Area/**Bars**/**Stack**/**Heat**/**Top-list**; `ChartType` union extended in `types.ts`) + Markers/Legend/Smooth `Switch`es + linear/log/% Y-axis seg, all persisted in `store/metricsStore.ts`. **KPI strip** (`components/MetricsKpiStrip.tsx`) shows current·1h avg·min·max·samples·cardinality from `utils/seriesStats.ts` (`computeQuerySummary` over the spatially-aggregated timeline). **Top series** (`components/TopSeriesPanel.tsx` + `utils/topSeries.ts`) ranks series by current value with a proportional bar + Δ and a host/region/version re-group from `series[].tags`. **Fleet distribution** (`components/FleetDistributionPanel.tsx` + `utils/fleetDistribution.ts`) bins each host series into 8 latency bands × time bucket → host-density grid (same density-color approach as `dashboard/renderers/LatencyHeatmapRenderer.tsx`, but 8 custom bands so it renders its own grid). **Recent metrics** (`components/RecentMetricsPanel.tsx`) reads the capped recents list pushed by `hooks/useRecordRecentMetrics.ts` into the store, hydrates type/unit via `useMetricNames`, click re-selects the primary query's metric. **Group-by breakdown** (`components/GroupByBreakdownTable.tsx`) emits one row per series, tag-keys → columns, min/avg/**p95**/**p99**/max as percentiles over each series' own value array (`utils/seriesStats.percentile`), `TableSparkline` + Δ, with CSV export. Shared `components/DeltaBadge.tsx` + `utils/formatStat.ts` for stat/delta formatting. **Deferred:** the design's Correlated-metrics grid is omitted — no backend cross-metric Pearson-r/candidate endpoint exists. Limitations: chart "Smooth" maps to line-width (uPlot spline path-builder out of scope) and Y-axis "log" falls back to linear (`ObservabilityChart` scales only take min/max). Heat/Top-list chart-type routes the main chart area to the fleet/top panels. |
| Logs | `src/features/log/` | Rebuilt logs explorer (clean-slate, Datadog-class). Components grouped: toolbar, kpi, facets, trend, table, detail. `LogsTrendChart` consumes the wide-format `/logs/trend` (`{time_bucket, total, error, warn, info, debug}`) as a severity-stacked trend; `LogsSummaryChips` shows TOTAL/ERROR/WARN counts wired to `/logs/summary` (`getLogsSummary`, fetched alongside trend/facets in `useLogsExplorer`). Feature-scoped Zustand store at `store/logsExplorerStore.ts`. JSON auto-detection in body cells. |
| Traces | `src/features/traces/` | Trace explorer, detail, comparison. Trace detail page (composition root `pages/TraceDetailPage/components/TraceDetailLayout.tsx`) matches the Optikk-handoff `trace.svg`: `TraceHeader` (error/ok dot + `METHOD operation` H1 + env/region/status badges + trace-id row w/ copy) → `KPIStrip` **4 cards** (Duration with "N× slower than p50" baseline bar, Errors, **Spans · Services** combined + depth, Critical path) → `ServiceStrip` chips → tabbed viz (**Waterfall / Service map / Errors / JSON**; waterfall renders event dots on bars) with a non-modal resizable right `SpanDrawer` (**Overview / Attributes / Events / Related** tabs). The **Service map** tab (`components/ServiceMapView.tsx`) adapts `tracesService.getServiceMap` → `ServiceMapResponse` `{nodes,edges}` onto the shared `ServiceTopologyGraph`/`buildTopologyGraph`. Overview tab = error callout + "Where this happens" ancestor chain + "Timing" KV grid (`span-detail/SelfChildBar` self-vs-child % bar) + "View span logs"; Attributes = full span/resource attrs; Related = span links + related traces. Drawer header shows a "critical path" pill when the selected span is on the critical path. The Duration baseline is fed by `hooks/useTraceOperationBaseline.ts` → `GET /v1/spans/red/operation-baseline?service=&operation=` (windowed p50/p95/p99). **Errors viz tab** (`components/ErrorsTab.tsx`) renders `components/TraceErrorSummary.tsx` (exception groups from `tracesService.getTraceErrors` → `TraceErrorGroup[]`, expandable to offending spans) above the flat error-span list. Detail data composition in `pages/TraceDetailPage/hooks/useTraceDetailState.ts` fans out over `hooks/{useTraceServiceMap (eager), useTraceErrors (gated on errors tab)}` + `useTraceDetailData`/`useTraceDetailEnhanced`; surfaced via `useTraceDetailPage` (`layoutProps.serviceMap`, `errorGroups`). (Removed vs the old Datadog-parity layout: Flame tab, Service-time / Hot-spans / Phase-breakdown strips, and the `Info/Logs/Infra` drawer tabs.) **Trace list page** (`pages/TracesExplorerPage/index.tsx`) matches the Optikk-handoff `Traces.html`: `ExplorerHeader` filter bar over a two-zone body (`236px 1fr`) = facet rail | content. `components/TracesFacetRail.tsx` renders the real `facetGroups` as dot+value+count rows (status → ok/warn/error dots, service → `getServiceColor`, others mono) with a presentational "Search facets…" box; row-click adds an include filter. Content stacks inline **stat pills** (Total + Errors from `summary`), the `components/TrendStrip.tsx` "Trace Volume Over Time" card (stacked OK/Error bars from `trendBuckets`, normalized to max total), and `components/TracesTable.tsx` wrapped in a "Results" card (presentational toolbar icons + footer cursor pager). Row-click navigates straight to trace detail via `useTracesExplorerPage`'s `onOpenTrace`; the old right-rail quick-look was removed. State in `store/tracesStore.ts` (persists `visualizationTab`, `spanDetailTab`, `drawerWidthPx`); URL holds `?span=<id>`. Hotkeys: `/` filter, `j`/`k` or ↑/↓ navigate spans, `c` copy trace id, `e` cycle errors, `1`/`2` switch viz, `[`/`]` resize drawer, `Esc` close. |
| Infrastructure | `src/features/infrastructure/` | Frontend-owned infrastructure hub matching the Optikk-handoff layout. Composition root [pages/InfrastructureHubPage.tsx](src/features/infrastructure/pages/InfrastructureHubPage.tsx) renders `InfrastructureHubHeader` (title + alert pill driven by `getNodesSummary().unhealthy_nodes` + subtitle) + `InfrastructureKpiStrip` (6 cards: Hosts up / In alert / Pods / Avg CPU / **Avg Memory** / **Avg Disk** — the last two call `/infrastructure/{memory,disk}/avg`) + 4 tabs (`hosts`, `containers`, `network`, `host-map`). `HostsTab` uses [components/InfraHostsTable.tsx](src/features/infrastructure/components/InfraHostsTable.tsx) (status dot + `ServiceAvatar size={26}` + host + services + pods + RED metrics) with an `InfraHostsFilterBar` (text search + status chips + service filter, client-side via `utils/filterNodes.ts`) and an `InfraTopConsumersSidebar` (Top-CPU / Top-memory panels from `/infrastructure/{cpu,memory}/top`). The `containers` tab (`ContainersTab`) lists pods from `getFleetPods` via `InfraPodsTable`. Host- and container-detail pages add an `InfraLogsLink` (deep-link to `/logs` scoped by host/pod) and the host-detail page adds a `HostDetailContainers` list (`fleet/pods` filtered by host). `NetworkTab` renders 2 `InfraMultiSeriesChart` panels (avg + by-instance). `host-map` reuses the existing `FleetTab`. Host detail page at [pages/HostDetailPage/index.tsx](src/features/infrastructure/pages/HostDetailPage/index.tsx) composes `HostDetailHero` + `HostDetailKpiCards` (CPU/Memory/Disk percentages with sparklines from `*/by-instance` filtered by host) + `HostDetailSystemMetrics` (2x2 CPU/memory/disk/network chart grid) + services-on-host table. **Container detail page** at [pages/ContainerDetailPage/index.tsx](src/features/infrastructure/pages/ContainerDetailPage/index.tsx) is reachable by clicking a pod row in `FleetTab` (the Pod column in `InfraPodsTable` is a `Link` to `/infrastructure/containers/$container`). The page is a partial of the design's `ContainerDetailScreen` — design fields without backing data are absent, not blank. It composes `ContainerDetailHero` (breadcrumb + violet grid icon + mono pod name + host/service `Link`s drawn from `FleetPod.services[0]`) + `ContainerDetailKpiCards` (2 tiles: CPU%, Memory% — sparklines from `*/by-instance` filtered on `host + pod + serviceName`) + `ContainerDetailSystemMetrics` (2×2 grid of `InfraMultiSeriesChart` for CPU / Memory / Network / Disk). Status badge, image, namespace, labels, age, restart counter, CrashLoopBackOff/OOMKilled banner, recent-logs panel, k8s lifecycle events from the design are dropped because `observability.metrics_1m` carries no k8s metadata. Removed: `ResourcesTab`, `KubernetesTab`, `JvmTab`, `NodesTab`, `InfraStatGrid` (frontend); JVM, Kubernetes, ConnPool backend modules and per-module endpoint trim (`{avg, by-instance}` for disk/network; cpu/memory also expose `{top}` for the Top-consumers panels). All theming via CSS-variable tokens. |
| Services | `src/features/services/` | Service catalog (`/services`), service map (`/service-map`), deployments (`/deployments`), and service detail (`/services/$serviceName`). Service detail page composition root [pages/ServiceDetailPage/ServiceDetailPage.tsx](src/features/services/pages/ServiceDetailPage/ServiceDetailPage.tsx) renders the Optikk-handoff layout: hero (`hero/` — `ServiceAvatar`, H1+`StatusPill`, `HeroMetaRow`, `HeroActions` Deploy button → `?tab=deploys`) + a **5-card** `ServiceKpiStrip` (Request rate, Error rate, p50, p95, p99 — with ▲/▼ deltas + p50/p95 baselines from the prior comparison window; `useServiceSummary` now uses `serviceCatalogApi.getRedSummaryWithComparison` and returns `{summary, previous}`. The design's 6th SLO·error-budget card is dropped — `/v1/slo/stats` never existed, so the dead `useSloStats` hook was deleted) + reordered tabs (`overview, endpoints, traces, errors, logs, infra, deploys, code`; badges show endpoints/errors/infra counts via `useTabCounts`) + per-tab content under `sections/`. Overview tab is composed of modular single-responsibility sub-panels under `panels/overview/` (`OverviewGoldenSignals` with dynamic x-axis timeline ticks matching the selected global time range, `OverviewServiceMap` using the premium JetBrains Mono font for nodes and text, `OverviewDeployments`, `OverviewEndpointsAndResources`, `OverviewPodFleet`, `OverviewErrors`, and `OverviewRecentTraces`), which fetch real data via hooks and omit unserved columns, sparklines, charts, and metrics. The **deploys tab** (`sections/DeploysTabPanel.tsx`) stacks `VersionTrafficPanel` (multi-series rps-by-version area chart, `hooks/useServiceVersionTraffic.ts` → `deploymentsApi.getVersionTraffic`) + `DeployImpactTablePanel` (Version · Released · Δ Error rate · Δ p99, status-colored, `hooks/useServiceDeployImpact.ts` → `deploymentsApi.getImpact`; baseline rows show `—`) + the existing `DeploysListPanel` history. These service-detail hooks call `deploymentsApi` directly (the overview compare hooks are feature-private). The infra tab's `HostsGridPanel` flags instances whose error-rate / p99 is a clear outlier vs the fleet (median-based `panels/hostOutliers.ts` → `HostCard` "outlier" badge). Dependency graph panel removed from the page; `useServiceTopology` hook remains for [pages/ServiceCatalogPage/catalog/CatalogDrawerDeps.tsx](src/features/services/pages/ServiceCatalogPage/catalog/CatalogDrawerDeps.tsx). Service catalog (`/services`) was rebuilt clean-slate to match the design (telemetry-only): `ServiceCatalogPage` → `HubBody` = `ServiceCatalogHeader` + `ServiceHubTabs` (3 tabs: Catalog/Service map/Deploys — **no SLOs tab**; the backend has no `/v1/slo`) + `ServiceHubTabContent`. **Catalog tab** (`tabs/CatalogTab.tsx`): no KPI strip, renders a card with `SearchToolbar` (search + `StatusFilterPill` button, no environment filter) + `CatalogTable`; columns = Service (`StatusDot` + `ServiceAvatar` + name + `lang · inst · version`) · RPS · Error · P99 · "Last 1 hour" (`SparklineCell`) · chevron; row-click opens the **quick-look drawer** (`catalog/CatalogQuickLook.tsx`: identity + golden signals from the loaded `CatalogRow`, "Open service →" navigates). Rows come from `hooks/useCatalogList.ts` → `catalog/buildCatalogRows.ts` (RED summary + comparison + request-rate series + latest deploys + team/tier metadata looked up/hashed). Active-alerts/SLOs-at-risk KPIs, the red alert banner, the SLOs tab + SLO columns stay omitted (no backend source); header subtitle prepends the org name from the auth user. **Deploys tab** (`tabs/DeploysTab.tsx`) derives everything from `deploys/useDeploysData.ts` (single `deploymentsApi.getLatestByService()` call — the only all-services deploy source — shares its query key with the catalog's latest-deploys query so they dedupe): `DeploysKpiStrip` (Deploys·window / Services tracked / Active versions) + `DeployTimelineChart` (`UPlotChart`+`uBars`, deploys bucketed across the window via `deploys/useDeployTimeline.ts`) + `RecentDeploysTable` (Service · Version · Environment · When, row-nav). Deployer/commit/duration/status and the multi-deploy histogram are omitted (no backend source). **Service map tab** (`map/ServiceMapTab.tsx`) is a real focused dependency graph built on the shared `ServiceTopologyGraph` kit: `map/focusSubgraph.ts` reduces the full topology to a focus service ± N hops (1/2-hop toggle, focus picker, health legend in `map/ServiceMapToolbar.tsx`), `buildTopologyGraph` lays it out left→right; double-click re-focuses, single-click opens detail. `ServiceAvatar` ([src/features/services/components/ServiceAvatar.tsx](src/features/services/components/ServiceAvatar.tsx)) is still used by the Detail hero (default 44). All theming via `themeColors.css` tokens. |
| Settings | `src/features/settings/` | Profile, team, and preferences pages |
| Marketing | `src/features/marketing/` | Public-facing site content and shell |
| Explorer | `src/features/explorer/` | Shared explorer primitives across logs/traces/metrics (DSL search, facets, analytics, trend) |

## Domain → dashboard page mapping

| Dashboard page ID | Feature | Hub page component |
|-------------------|---------|--------------------|
| overview | overview | OverviewHubPage |
| service | overview | ServiceHubPage |
| saturation | overview → metrics | SaturationHubPage |
| infrastructure | infrastructure | InfrastructureHubPage — full frontend-owned infra UI + Datadog-style fleet controls + new panels; see § Infrastructure product direction |

## Key paths and hooks

- **Route constants**: [src/shared/constants/routes.ts](src/shared/constants/routes.ts)
- **HTTP client**: [src/shared/api/api/client.ts](src/shared/api/api/client.ts)
- **Global store**: [src/app/store/appStore.ts](src/app/store/appStore.ts) — `triggerRefresh()` increments `refreshKey`; persisted: timeRange, teamId, theme, timezone, comparisonMode, viewPreferences, recentPages
- **Theme tokens / color contract** (Datadog-aligned, **light-first**): [src/config/themeColors.css](src/config/themeColors.css) → [tailwind.config.ts](tailwind.config.ts). `:root` holds the **light** palette (`color-scheme: light`); `[data-theme="dark"]` overrides with the dark palette. **Every theme-variant color token is defined in BOTH blocks** (only theme-agnostic chart series hues `--chart-1..8` live once). Neutrals are one cool blue-grey family across both themes; `--color-primary` + `--color-{success,warning,error,info}` are tuned per theme (deeper on light for AA on white, brighter on dark). Default theme is **light** ([appStoreMigrations.ts](src/app/store/appStoreMigrations.ts) `?? "light"`). **Color-authoring rule:** components never use Tailwind named colors (`text-red-500`) or raw hex/rgba in `className` — use semantic utilities (`text-error`, `bg-surface`, `text-foreground-muted`) or `[var(--token)]`, with `color-mix(...)` for tinted borders; reuse the `Pill`/`Badge` primitives for status chips. `var()`/raw colors are only allowed in inline `style={{}}` (dynamic/canvas) and `.css` files. Enforced by `yarn check:colors` ([scripts/check-theme-colors.mjs](scripts/check-theme-colors.mjs), in `yarn ci`). Canvas charts resolve tokens live via `resolveThemeColor` ([src/shared/utils/chartTheme.ts](src/shared/utils/chartTheme.ts)). Marketing (`src/features/marketing/`) keeps its own scoped `marketing.css` theme and is excluded. Additionally, global font-family variables `--font` (Inter) and `--font-mono` (JetBrains Mono) with full weight ranges (400-700) are declared in [src/index.css](src/index.css).
- **Overview hub**: [src/features/overview/pages/OverviewHubPage/index.tsx](src/features/overview/pages/OverviewHubPage/index.tsx) — single-page Overview landing; APIs via [src/features/overview/api/overviewHubApi.ts](src/features/overview/api/overviewHubApi.ts) (RED + errors) and [deploymentsApi](src/shared/api/deployments/deploymentsApi.ts)
- **Deployments API** (shared): [src/shared/api/deployments/deploymentsApi.ts](src/shared/api/deployments/deploymentsApi.ts) — `deploymentsApi.{getLatestByService,getList,getVersionTraffic,getImpact,getActiveVersion,getDeploymentCompare}` (only `getLatestByService` is all-services; the rest require `serviceName`). Consumed by overview + services. Promoted out of `overview/api/` so services can use it without a cross-feature import.
- **Service topology graph kit** (shared): [src/shared/components/ui/charts/ServiceTopologyGraph/](src/shared/components/ui/charts/ServiceTopologyGraph/) — React Flow + dagre kit: `getServiceTopology`/`ServiceTopologyResponse` (`api.ts`), `buildTopologyGraph`/`topologyNodeTypes`/`topologyEdgeTypes` (`buildGraph.ts`), `ServiceTopologyNode`/`ServiceTopologyEdge`, `layout.ts` (LR), `ServiceTopologyGraph` wrapper. Used by overview's `TopologyView` and the services map tab. Promoted out of `overview/pages/ServiceHubPage/topology/` (only `TopologyToolbar.tsx` stays in overview).
- **Dashboard primitives**: `src/shared/components/ui/dashboard/` — `ConfigurableChartCard.tsx`, `DashboardEntityDrawer.tsx`
- **Panel registry**: `src/shared/components/ui/dashboard/dashboardPanelRegistry.tsx` — 12 built-in + 10 domain panels
- **Built-in panels**: `builtInDashboardPanels.tsx` — request, error-rate, latency, exception-type-line (base-chart); table, bar, gauge, heatmap, pie, stat-cards-grid (specialized); stat-card, stat-summary (self-contained)
- **Charts**: `src/shared/components/ui/charts/` — `UPlotChart` (use `setData()` for flicker-free refresh), `ObservabilityChart`, `time-series/`, `distributions/`, `micro/`, `specialized/`
- **Live tail**: [src/shared/hooks/useSocketStream.ts](src/shared/hooks/useSocketStream.ts) (core WebSocket), `src/features/explorer-core/hooks/useLiveTailStream.ts` (wrapper with teamId)
- **Explorer core**: `src/features/explorer-core/` — shared analytics, facets, visualizations for Logs/Traces/Metrics explorers
- **Navigation utils**: [src/shared/utils/navigation.ts](src/shared/utils/navigation.ts) — `dynamicNavigateOptions(to, search?)` and `dynamicTo(path)` for TanStack Router dynamic-path navigation (replaces scattered `as any` casts)
- **Standard query**: [src/shared/hooks/useStandardQuery.ts](src/shared/hooks/useStandardQuery.ts) — `useStandardQuery(options)` with `keepPreviousData`, `staleTime: 5s`, `retry: 2`
- **Drawer entities**: databaseSystem, deployment, errorGroup, kafkaGroup, kafkaTopic, node, redisInstance, service

## Explorer conventions

- Logs and traces use the shared `ExplorerSearchBarDsl` DSL search. Pass `scope="logs"` or `scope="traces"` so `parseDsl` validates against the correct field catalog.
- Logs value suggestions are fed from the logs facets response into `LogsToolbar.valueSuggestions`.
- Logs results use cursor-backed pages from `useLogsExplorer().list.pages` and render one page at a time with footer navigation. Do not reintroduce near-end infinite append.
- The logs explorer uses a feature-scoped Zustand store (`logsExplorerStore`) for UI-only state (expanded rows, density, wrap lines, facet collapsed, detail tab, column widths). Filters remain URL-synced via shared `useExplorerState`.
- Log rows feature severity-colored gutter bars, inline expand with JSON tree detection, and severity-based background tinting (error rows get subtle red tint).
- The log detail panel is rendered inside `DetailDrawer` (shared Radix Dialog slide-over) with 4 tabs: Message, Fields, JSON, Correlation.
- `ResultsArea` accepts an optional `rowHeight` for denser or more readable explorer rows while keeping the shared virtual list implementation.

## Monitors

`src/features/monitors/` ships the alerting platform UI — list, detail, wizard, notifications — backed by `optikk-backend`'s `internal/modules/alerting/`. The feature is **flat-vs-nested compliant**: only subdirectories live under `monitors/`.

```
src/features/monitors/
  api/                         monitorsApi.ts (CRUD + state actions + series + events), notificationsApi.ts (channels/integrations/policies/templates)
  pages/
    MonitorsPage/              list (KpiStrip + Tabs + MonitorsTable + ActivityCard)
    MonitorDetailPage/         DetailHeader (Ack/Mute + ⋯ menu → Edit/Delete with confirm Modal) + EvalChartCard (SVG threshold lines) + CurrentValueCard + StatusTimelineCard + QueryCard + RecentTriggersCard + NotificationsCard + RunbookCard
    NewMonitorPage/            5-step wizard (WizardTypeStep / WizardQueryStep / WizardConditionsStep / WizardNotifyStep / WizardDefineStep) with per-type query forms under queryForms/ (MetricQuery, APMQuery, LogQuery). Doubles as the edit surface at `/monitors/$monitorId/edit`: `useMonitorDetail` → `monitorToDraft` seeds `useWizardState(initial)`; `WizardFooter` + `useWizardSubmit` handle create-vs-update save and (edit-only) the "Test on existing data" button (`testMonitor` needs a saved id, so it is hidden in create mode)
    NotificationsPage/         tabs: ChannelsTab (CRUD + edit + test) / IntegrationsTab / PoliciesTab (CRUD; actions edited as JSON) / TemplatesTab (CRUD: name/description/body editor)
  components/                  MonitorStatusBadge, PriorityChip
  hooks/                       useMonitorsList, useMonitorsActivity, useMonitorDetail (+series/events/status-timeline), useChannels, useNotifications (integrations/policies/templates), useMonitorMutations (useUpdateMonitor/useDeleteMonitor), useNotificationMutations (useChannelMutations/usePolicyMutations/useTemplateMutations — each {create,update,remove})
  index.ts                     monitorsConfig DomainConfig
```

Routes live in [src/app/routes/router.tsx](src/app/routes/router.tsx): `/monitors`, `/monitors/new`, `/monitors/$monitorId`, `/monitors/$monitorId/edit` (reuses `NewMonitorPage`), `/monitors/notifications`. `/alerts/new` redirects to `/monitors/new` preserving querystring so `CreateMonitorButton` deep-links keep working. Mutation hooks use react-query `useMutation` + `invalidateQueries` (monitor edits invalidate `["monitors","detail",id]` + `["monitors","list"]`; channel/policy/template CRUD invalidate `["notifications",<kind>]`). The wizard's `anomaly` "coming soon" card was removed (C14) — no backend evaluator exists; `MonitorType` stays `metric | apm | log`.

[src/features/traces/components/CreateMonitorButton/index.tsx](src/features/traces/components/CreateMonitorButton/index.tsx) targets `/monitors/new` and passes `?from=traces&filters=field:op:value;…`. The wizard's `useWizardState` hook parses this on mount and pre-fills `type=apm` + scope chips.

The eval chart on the detail page is hand-rolled SVG (`EvalChartCard.tsx`) rather than `UPlotChart` because it needs threshold-line overlays in the same coordinate space as the area path — switching to `UPlotChart` for parity with other dashboards is a follow-up.

Channel transports: only **Slack** is wired end-to-end on the backend (`dispatch.SlackWebhook` posts to a Slack incoming-webhook URL); the wizard exposes `slack`/`webhook`/`email`/`pagerduty` types but everything except `slack` routes through `dispatch.Stub` server-side. The Integrations tab mirrors this: Slack = "connected", others = "install".

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
- `yarn check:colors` — theme-color guardrail; fails on Tailwind named colors / raw hex / rgba in `className` (see color contract above)
- `yarn build`
- `yarn deploy:firebase` — compiles with Vite and deploys to Firebase Hosting
- `yarn preview`
- `yarn ci` — `type-check && lint && check:colors && build`

## Cross-repo docs

- Frontend overview: [README.md](README.md)
- Backend overview: [../optikk-backend/README.md](../optikk-backend/README.md)
