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

### Login

- `/login` → [LoginPage](src/app/auth/pages/LoginPage/LoginPage.tsx) — two-column shell (`grid-cols-[1.05fr_1fr]`, single column under `lg`). Left side is `LoginBrandPanel` (Optikk logomark + name, "Observability" eyebrow, gradient headline, sub, year/Privacy/Terms/Security row; radial gradients + soft 32px grid mask). Right side stacks `LoginTopBar` (trial CTA), `LoginHeader` (form title), `LoginForm` (icon-prefixed `LoginField` inputs, password Show/Hide trailing slot, "Forgot?" hint, "Keep me signed in" checkbox, `Sign in` submit + arrow, "Request access" line, legal blurb) and `LoginFooter` (status pill + version link). Form state + submission live in [useLoginSubmit.ts](src/app/auth/pages/LoginPage/useLoginSubmit.ts). Tailwind utilities only — uses existing theme tokens (`--bg-canvas`, `--bg-card`, `--border-color`, `--text-*`, `--color-primary`, `--color-healthy`) plus new login tokens in [themeColors.css](src/config/themeColors.css) (`--login-link`, `--login-link-hover`, `--login-submit-fg`, `--login-focus-ring`, `--login-grid-line`, `--login-headline-from/to`, `--login-aside-bg`) that flip between dark and light themes so the page renders correctly in both.

### Authenticated product routes

Direct protected routes in the router:

- `/overview` → [OverviewHubPage](src/features/overview/pages/OverviewHubPage/index.tsx)
- `/infrastructure` → frontend-owned infrastructure hub
- `/service` → service hub
- `/service/$serviceName` → service detail page

Additional explorer/product routes come from the domain registry configs inside each feature package.

### Important implication

The current frontend owns significant page composition and interaction logic directly. The backend is primarily the data plane for these screens rather than the author of page layouts.

## Feature map

| Area | Path | Notes |
|------|------|-------|
| Overview | `src/features/overview/` | Single-page `/overview` landing (Datadog-style). Composition root [pages/OverviewHubPage/index.tsx](src/features/overview/pages/OverviewHubPage/index.tsx); sections under `components/` (`OverviewHero` KPIs, `SystemPerformanceCard` request/error overlay, `ServiceHealthGrid` colored tiles, `TopErrorsCard`, `RecentDeploysCard`, `InfrastructureStrip` linking to Kafka/Database saturation). Data fans out from `hooks/useOverviewModel.ts` over `getRedSummary`, `getRedRequestRateSeries`, `getRedErrorRateSeries`, `getErrorHotspot`, `deploymentsApi.getLatestByService`. Active-incidents, on-call, watchdog, and Redis/Queues/Storage tiles from the design are omitted because the backend has no matching endpoints. Sibling pages: service hub, service detail, deployment-compare drawer. |
| Saturation | `src/features/saturation/` | Saturation hub (Overview surface ported from the Optikk design handoff) + per-datastore / Kafka drill-downs. `pages/SaturationPage/` is the `/saturation` landing page; composition root is `index.tsx`, data fans out from `hooks/useSaturationOverviewModel.ts`, view-model builders live in `view-models/`, presentation in `components/` (Tailwind utilities only — no CSS file; shared table classes in `components/tableClasses.ts`, uses `themeColors.css` tokens via arbitrary values). Renders: subsystem cards (Kafka / Database / Redis), worst-saturated-systems table, top-Kafka-topics table. Subnav links to existing Kafka & datastore detail pages. Cross-fleet hex map, queues/storage subsystems, alerts feed and refresh/export buttons from the design are intentionally omitted because the backend has no matching endpoints. |
| Metrics | `src/features/metrics/` | Metrics explorer, charts, store, API hooks |
| Logs | `src/features/log/` | Rebuilt logs explorer (clean-slate, Datadog-class). Components grouped: toolbar, kpi, facets, trend, table, detail. Feature-scoped Zustand store at `store/logsExplorerStore.ts`. JSON auto-detection in body cells. |
| Traces | `src/features/traces/` | Trace explorer, detail, comparison. Trace detail page uses Datadog-parity layout: full-width viz (Waterfall + Flame Graph; waterfall renders event dots on bars at event timestamps) with non-modal resizable right `SpanDrawer` for span detail (Info / Logs / Events / Links / Infra tabs, hide-when-empty). Info tab includes a "Where this happens" ancestor chain + "Timing" KV grid; drawer header shows a "critical path" pill when the selected span is on the critical path. Composition root at `pages/TraceDetailPage/components/TraceDetailLayout.tsx`. State in `store/tracesStore.ts` (persists `visualizationTab`, `spanDetailTab`, `drawerWidthPx`); URL holds `?span=<id>`. Hotkeys: `/` filter, `j`/`k` or ↑/↓ navigate spans, `c` copy trace id, `e` cycle errors, `1`/`2` switch viz, `[`/`]` resize drawer, `Esc` close. |
| Infrastructure | `src/features/infrastructure/` | Frontend-owned infrastructure hub, APIs, fleet and tab content |
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
- **Theme tokens**: [src/config/themeColors.css](src/config/themeColors.css) → [tailwind.config.ts](tailwind.config.ts)
- **Overview hub**: [src/features/overview/pages/OverviewHubPage/index.tsx](src/features/overview/pages/OverviewHubPage/index.tsx) — single-page Overview landing; APIs via [src/features/overview/api/overviewHubApi.ts](src/features/overview/api/overviewHubApi.ts) (RED + errors) and [deploymentsApi](src/features/overview/api/deploymentsApi.ts)
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
    MonitorDetailPage/         DetailHeader + EvalChartCard (SVG threshold lines) + CurrentValueCard + StatusTimelineCard + QueryCard + RecentTriggersCard + NotificationsCard + RunbookCard
    NewMonitorPage/            5-step wizard (WizardTypeStep / WizardQueryStep / WizardConditionsStep / WizardNotifyStep / WizardDefineStep) with per-type query forms under queryForms/ (MetricQuery, APMQuery, LogQuery)
    NotificationsPage/         tabs: ChannelsTab (CRUD + test) / IntegrationsTab / PoliciesTab / TemplatesTab
  components/                  MonitorStatusBadge, PriorityChip
  hooks/                       useMonitorsList, useMonitorsActivity, useMonitorDetail (+series/events/status-timeline), useChannels, useNotifications (integrations/policies/templates)
  index.ts                     monitorsConfig DomainConfig
```

Routes live in [src/app/routes/router.tsx](src/app/routes/router.tsx): `/monitors`, `/monitors/new`, `/monitors/$monitorId`, `/monitors/notifications`. `/alerts/new` redirects to `/monitors/new` preserving querystring so `CreateMonitorButton` deep-links keep working.

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
- `yarn build`
- `yarn deploy:firebase` — compiles with Vite and deploys to Firebase Hosting
- `yarn preview`
- `yarn ci`

## Cross-repo docs

- Frontend overview: [README.md](README.md)
- Backend overview: [../optikk-backend/README.md](../optikk-backend/README.md)
