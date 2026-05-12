# Optikk Frontend — Design Document

Comprehensive design reference for the Optikk observability platform frontend. Covers the visual language, token system, component architecture, layout, charting, state management, and interaction patterns.

---

## 1. Design Philosophy

Optikk follows a **calm-tech, data-dense** design philosophy inspired by tools like Datadog and Grafana, with a premium dark-first aesthetic. Key principles:

- **Dark-first, light-aware** — Dark theme is the default (`color-scheme: dark`). A warm off-white light theme flips surfaces and foregrounds via `[data-theme="light"]`.
- **Token-driven consistency** — Every color, spacing, shadow, and animation value flows through CSS custom properties. No raw hex/rgb values in components — a `check-no-raw-colors.mjs` CI script enforces this.
- **Information density** — The default spacing scale is "comfortable"; a compact density mode (`[data-density="compact"]`) shrinks the entire spacing scale for power users.
- **Calm status communication** — Health states use a restrained `healthy / degraded / critical / unknown` vocabulary with glow rings rather than aggressive alert banners.
- **Progressive disclosure** — Dashboards → drill-down drawers → explorer pages. Users move from overview to detail without context-switching.

---

## 2. Design Token System

All tokens are defined in [`src/config/themeColors.css`](src/config/themeColors.css) and consumed by both Tailwind (via `tailwind.config.ts` mappings) and direct `var()` references.

### 2.1 Color Tokens

| Category | Key tokens | Purpose |
|----------|-----------|---------|
| **Backgrounds** | `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-hover` | Page canvas → card → inset → hover state |
| **Extended surfaces** | `--bg-canvas`, `--bg-card`, `--bg-card-hover`, `--bg-inset`, `--bg-overlay` | Semantic surface layers for cards, drawers, modals |
| **Elevation** | `--surface-2-bg`, `--surface-3-bg` | Stacked card/popover layering |
| **Text** | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-numeric`, `--text-label`, `--text-caption` | Hierarchical text contrast |
| **Brand** | `--color-primary` (#2563eb), `--color-primary-hover`, `--color-primary-active` | CTA buttons, active nav, focus rings |
| **Primary alpha** | `--color-primary-subtle-{02..50}` | 16 opacity stops for tinted backgrounds, borders, hover states |
| **Semantic** | `--color-success`, `--color-warning`, `--color-error`, `--color-info` | Status indicators with matching `-subtle` variants |
| **Calm-tech** | `--color-healthy` / `--color-degraded` / `--color-critical` + `-glow` | Health rings, SLO gauges |
| **Severity** | `--severity-{critical,high,medium,low,info}` + `-subtle` | Alert and log severity mapping |
| **Chart palette** | `--chart-1` through `--chart-8` | 8-color spectral palette; `--chart-1` (#5ea9ff) is intentionally lighter than `--color-primary` so single-series charts don't resemble buttons |
| **Borders** | `--border-color`, `--border-light` | Structural and subtle dividers |

### 2.2 OKLCH Layer (Design-Handoff Tokens)

A modern OKLCH-based layer powers the Logs Explorer and newer pages:

- **Surfaces**: `--bg-0` through `--bg-3`, `--bg-row-h` (hover)
- **Foregrounds**: `--fg-0` through `--fg-3`
- **Lines**: `--line`, `--line-2`
- **Severity hues**: `--trace-c`, `--debug-c`, `--info-c`, `--warn-c`, `--err-c`, `--fatal-c` — identical across themes
- **Accent**: `--accent-h: 268` (purple), derived `--accent`, `--accent-2`, `--accent-bg`, `--accent-ln`

### 2.3 Spacing Scale

Comfortable (default) and compact modes:

| Token | Comfortable | Compact |
|-------|-------------|---------|
| `--space-2xs` | 4px | 2px |
| `--space-xs` | 8px | 4px |
| `--space-sm` | 12px | 8px |
| `--space-md` | 16px | 12px |
| `--space-lg` | 20px | 16px |
| `--space-xl` | 24px | 20px |
| `--space-2xl` | 28px | 24px |
| `--space-3xl` | 36px | 32px |
| `--space-4xl` | 44px | 40px |
| `--space-page` | 16px | 12px |

### 2.4 Typography

- **Font stack**: Inter (400/500/600) via Google Fonts, with system fallbacks
- **Mono**: JetBrains Mono → Fira Code → Courier New
- **Scale**: `--text-xs` (11px) → `--text-display` (32px); base is 13px
- **Weights**: `--font-normal` (400), `--font-medium` (500), `--font-semibold` (600), `--font-bold` (700)
- **Metric display**: `--metric-weight: 300` (light) for large numeric readouts
- **Labels**: `--label-weight: 500`, `--label-size: 11px`, uppercase with 0.5px tracking

### 2.5 Shadows & Elevation

Three-tier shadow scale, each with a subtle top-edge highlight:

| Token | Effect |
|-------|--------|
| `--shadow-sm` | Cards at rest — `0 10px 24px rgba(0,0,0,0.24)` |
| `--shadow-md` | Sidebar, popovers — `0 16px 34px rgba(0,0,0,0.3)` |
| `--shadow-lg` | Modals, drawers — `0 24px 48px rgba(0,0,0,0.34)` |

Light theme shadows are softer with visible border rings.

### 2.6 Glass & Blur

- `--glass-bg`: translucent surface (`rgba(23,27,36,0.9)`)
- `--glass-border`: `rgba(255,255,255,0.08)`
- `--glass-blur`: `blur(12px)`
- Used for command palette, overlays, floating panels

### 2.7 Animation Tokens

| Token | Value |
|-------|-------|
| `--duration-fast` | 150ms |
| `--duration-normal` | 250ms |
| `--duration-slow` | 350ms |
| `--ease-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

Named Tailwind animations: `logs-fade-in`, `waterfall-bar-enter`, `oqb-pill-in`, `trp-slide-in`, `expand-row`, `oboard-shimmer`.

---

## 3. Layout System

### 3.1 App Shell

```
┌──────────────────────────────────────────────────┐
│                    App Root                       │
│  ┌─────────┬────────────────────────────────────┐ │
│  │ Sidebar │            Header                  │ │
│  │ (fixed) │────────────────────────────────────│ │
│  │ 220px / │            <main>                  │ │
│  │  56px   │         (scrollable)               │ │
│  │         │    ┌──────────────────────┐        │ │
│  │ Observe │    │  Page Content        │        │ │
│  │ Operate │    │  (Outlet)            │        │ │
│  │         │    └──────────────────────┘        │ │
│  │ Settings│                                    │ │
│  │ Logout  │                                    │ │
│  │ ◄► Toggle                                    │ │
│  └─────────┴────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- **Sidebar**: Fixed left, `--space-sidebar-w` (220px) or `--space-sidebar-collapsed` (56px). Groups: "Observe" and "Operate". Active item uses primary-subtle tint with border glow.
- **Header**: `--space-header-h` (56px). Contains breadcrumbs, time selector, refresh, auto-refresh controls.
- **Main content**: `flex-1 overflow-y-auto`, padded with `--space-page`.
- Transition: `margin-left` animates at 200ms linear on sidebar toggle.

### 3.2 Layout Components

| Component | Path | Purpose |
|-----------|------|---------|
| `MainLayout` | `src/app/layout/MainLayout.tsx` | Shell with Sidebar + Header + Outlet + keyboard shortcuts |
| `Sidebar` | `src/app/layout/Sidebar.tsx` | Fixed nav with collapsible state, domain-registry-driven items |
| `Header` | `src/app/layout/Header.tsx` | Top bar with breadcrumbs, time range, refresh controls |
| `PageShell` | `src/shared/components/ui/layout/PageShell.tsx` | Standard page wrapper |
| `PageHeader` | `src/shared/components/ui/layout/PageHeader.tsx` | Title + icon + subtitle + actions + auto-breadcrumbs |
| `EntityExplorerLayout` | `src/shared/components/layout/EntityExplorerLayout.tsx` | Explorer-style full-bleed layout |
| `DensityProvider` | `src/shared/components/primitives/ui/providers/` | Sets `data-density` attribute on root |

### 3.3 Routing Architecture

- **TanStack Router** with `createRouter` / `createRoute` / nested layouts
- **Root route** → `AppContent` (auth validation, command palette, outlet)
- **Marketing routes**: Public shell (`MarketingShell`) — `/`, `/features`, `/pricing`, `/opentelemetry`, `/self-host`, `/architecture`
- **Protected routes**: Wrapped in `ProtectedRoute` → `MainLayout` → `FeatureErrorBoundary` + `Suspense`
- **Domain routes**: Auto-generated from `domainRegistry` via `getExplorerRoutes()`
- **Lazy loading**: All page components use `React.lazy()` with `Loading` fallback

---

## 4. Component Architecture

### 4.1 Component Hierarchy

```
src/shared/components/
├── primitives/ui/          ← Atomic building blocks (Radix-based)
│   ├── button, card, badge, input, select, dialog, drawer
│   ├── tabs, tooltip, popover, dropdown-menu
│   ├── pagination, breadcrumb, separator, skeleton, switch
│   ├── pill, icon-button, empty-state, scroll-area
│   └── simple-table, table, table-sparkline
├── layout/
│   └── EntityExplorerLayout
└── ui/                     ← Product-level compositions
    ├── calm/               ← Calm-tech status widgets
    ├── cards/              ← StatCard, StatCardsGrid, HealthIndicator
    ├── charts/             ← Full charting layer (§5)
    ├── common/             ← Hooks
    ├── dashboard/          ← Configurable dashboard runtime (§6)
    ├── data-display/       ← Tables, boards, timelines, detail panels
    ├── feedback/           ← ErrorBoundary, Loading, Skeleton, overlays
    ├── forms/              ← FilterBar, ObservabilityQueryBar, SearchInput
    ├── layout/             ← PageHeader, PageShell, DetailDrawer
    ├── metric-lists/       ← UnifiedMetricList
    ├── overlay/            ← ShortcutHelpOverlay
    └── TimeSelector/       ← Time range picker
```

### 4.2 Primitive Components (Radix + Custom)

All primitives live in `src/shared/components/primitives/ui/` and follow a consistent pattern:

- **Variant-driven**: `Button` has `primary | secondary | ghost | danger` variants
- **Size tokens**: `sm | md | lg` map to height/padding/font classes
- **Token-only styling**: All colors via `var(--token)`, never raw values
- **Ref forwarding**: All accept `ref` via React 19's ref-as-prop pattern
- **cn() composition**: `clsx` + `tailwind-merge` via `@/lib/utils`

**Card elevation system** (4 tiers):
- `0` — transparent (embedded)
- `1` — `--bg-card` + `--shadow-sm` (default)
- `2` — `--surface-2-bg` + `--shadow-md` (popovers)
- `3` — `--surface-3-bg` + `--shadow-lg` (modals)

### 4.3 Calm-Tech Components

Purpose-built for observability status display:

| Component | Purpose |
|-----------|---------|
| `HealthRing` | Animated ring with `healthy/degraded/critical/unknown` states and glow effect |
| `HealthSnapshotStrip` | Row of service health summaries |
| `CalmMetricCard` | Single-metric card with calm status theming |
| `AlertGroupCard` | Grouped alert display |

### 4.4 Feedback & Error Handling

- `ErrorBoundary` — Generic with optional details toggle
- `FeatureErrorBoundary` — Feature-scoped, shows feature name context
- `DashboardCardErrorBoundary` — Per-chart-card isolation
- `Loading` — Fullscreen or inline spinner
- `Skeleton` — Shimmer placeholders
- `ChartErrorOverlay` / `ChartNoDataOverlay` — In-chart status states
- `StatusBadge` — Colored status pills
- `TrendIndicator` — Up/down arrow with percentage, supports inverted semantics

### 4.5 Data Display Components

| Component | Purpose |
|-----------|---------|
| `ObservabilityDataBoard` | Full-featured data table with sorting, filtering, column settings |
| `ObservabilityDetailPanel` | Side-panel detail view for board rows |
| `BoardTable` | Core table renderer with virtual scrolling |
| `BoardSkeleton` | Loading state for data boards |
| `BoardActionBar` | Table toolbar (search, export, column settings) |
| `BoardExportMenu` | CSV/JSON export dropdown |
| `TopEndpointsList` | Ranked endpoint table with sparklines |
| `DatabaseTopTablesList` | Database collection ranking table |
| `QueueMetricsList` | Kafka queue metrics table |
| `DataTable` | Lightweight TanStack Table wrapper |
| `Timeline` | Vertical event timeline |
| `DetailDrawer` | Right-sliding Vaul drawer with section/field layout |

---

## 5. Charting System

### 5.1 Chart Architecture

```
charts/
├── UPlotChart.tsx           ← Core uPlot wrapper (imperative setData() updates)
├── ObservabilityChart.tsx   ← Declarative wrapper with loading/error/empty states
├── time-series/             ← Golden signal charts
│   ├── RequestChart
│   ├── ErrorRateChart
│   ├── LatencyChart
│   └── ExceptionTypeLineChart
├── distributions/           ← Histograms and heatmaps
│   ├── LatencyHeatmap
│   ├── LatencyHistogram
│   └── LogHistogram
├── micro/                   ← Inline mini-charts
│   ├── SparklineChart
│   ├── DonutChart
│   └── GaugeChart
├── specialized/             ← Domain-specific visualizations
│   ├── WaterfallChart + WaterfallRow + WaterfallList + WaterfallToolbar
│   ├── Flamegraph
│   ├── GoldenSignalsHeatmap
│   ├── LatencyHeatmapChart
│   ├── BurnRateChart
│   └── PodLifecycleGantt
├── ServiceTopologyGraph/    ← XY Flow (dagre) service dependency map
├── helpers/                 ← Chart data transformation
└── utils/                   ← Theme resolution, formatting
```

### 5.2 Chart Theme Integration

`chartTheme.ts` provides `resolveThemeColor()` and `CHART_THEME_DEFAULTS` — lazy resolvers that read CSS variables at render time, ensuring charts react to theme changes. The 8-color chart palette is resolved via `getResolvedChartPalette()`.

### 5.3 Key Chart Patterns

- **UPlotChart**: Imperative wrapper; uses `setData()` for flicker-free updates rather than re-mounting. Handles resize observers and cursor synchronization.
- **ObservabilityChart**: Adds loading skeleton, error overlay, no-data state, and comparison data support around `UPlotChart`.
- **Sparklines**: Inline 120×28px charts in StatCards and table cells via `SparklineChart`.
- **Waterfall**: Full trace waterfall with collapsible tree, event dots on bars, animated bar entry (`waterfall-bar-enter`), and resizable ruler.

---

## 6. Dashboard Runtime

### 6.1 Architecture

The dashboard system is a **config-driven panel rendering runtime**:

```
ConfigurableDashboard
  └── DashboardSection (collapsible, persisted state)
       └── DashboardPanelGrid (CSS grid, responsive)
            └── ConfigurableChartCard (per-panel renderer)
                 └── [Panel type from registry]
```

### 6.2 Panel Registry

`dashboardPanelRegistry.tsx` provides a React context with registered panel types. Registration happens at two levels:

1. **Built-in panels** (`builtInDashboardPanels.tsx`): `request`, `error-rate`, `latency`, `exception-type-line`, `table`, `bar`, `gauge`, `heatmap`, `pie`, `stat-cards-grid`, `stat-card`, `stat-summary`
2. **Domain panels**: Each feature domain registers additional panels via `domainConfig.dashboardPanels`

### 6.3 Dashboard Page Pattern

Hub pages (Overview, Service, Saturation, Infrastructure) follow this pattern:
1. Define a `DashboardTabDocument` config with sections and panels
2. Fetch data via TanStack Query hooks
3. Pass data sources to `ConfigurableDashboard`
4. The runtime resolves panel types from the registry and renders them in the grid

---

## 7. State Management

### 7.1 Global State (Zustand)

`appStore.ts` — Persisted to `localStorage`:

| Slice | Purpose |
|-------|---------|
| `timeRange` | Relative or absolute time window |
| `selectedTeamId` / `selectedTeamIds` | Active tenant |
| `sidebarCollapsed` | Sidebar toggle state |
| `theme` | `"dark"` or `"light"` |
| `timezone` | User's preferred timezone |
| `comparisonMode` | Time comparison mode |
| `autoRefreshInterval` | Auto-refresh interval in ms |
| `viewPreferences` | Per-user UI preferences (density, favorites, etc.) |
| `recentPages` | Last 5 visited pages |
| `recentTimeRanges` | Recently used time ranges |
| `refreshKey` | Monotonic counter — incremented on time change or manual refresh |

**Selector exports**: `useTimeRange()`, `useTeamId()`, `useRefreshKey()`, `useSidebarCollapsed()`, `useTheme()`, etc. — reduces coupling to store shape.

### 7.2 Feature-Scoped Stores

Feature modules maintain their own Zustand stores for UI-only state:

- `logsExplorerStore` — Expanded rows, density, wrap lines, facet collapsed, detail tab, column widths
- `tracesStore` — Visualization tab, span detail tab, drawer width (persisted)

### 7.3 Server State (TanStack Query)

Two query patterns:

| Pattern | Key shape | Refresh behavior |
|---------|-----------|-----------------|
| **Dashboard queries** | Stable keys (no `refreshKey`) | Invalidated via `useInvalidateQueriesOnAppRefresh` |
| **Explorer queries** | Include `refreshKey` in key | Re-fetch on every refresh increment |

Standard defaults via `useStandardQuery()`: `keepPreviousData`, `staleTime: 5s`, `retry: 2`.

---

## 8. Feature Module Pattern

Each domain feature follows a consistent directory structure:

```
src/features/<domain>/
├── api/           ← TanStack Query hooks + API calls
├── components/    ← Feature-specific components
├── config/        ← Domain registration config
├── constants/     ← Feature constants
├── hooks/         ← Feature-specific hooks
├── pages/         ← Route-level page components
├── store/         ← Feature-scoped Zustand store (if needed)
├── types/         ← Feature type definitions
├── utils/         ← Feature utilities
├── palette.ts     ← Feature-specific color mappings
└── index.ts       ← Public API + DomainConfig export
```

**Domain registration** (`index.ts` exports a `DomainConfig`):
- `key` — unique identifier
- `label` — display name
- `navigation` — sidebar items with icons and group assignment
- `routes` — page components mapped to route paths
- `dashboardPages` — optional dashboard page adapters
- `dashboardPanels` — optional panel type registrations

**ESLint-enforced boundary**: No cross-feature imports. Shared code lives in `@shared/`.

---

## 9. Explorer Pattern

Logs, Traces, and Metrics explorers share a common exploration framework from `src/features/explorer/`:

### 9.1 Shared Explorer Infrastructure

- **DSL Search** (`ExplorerSearchBarDsl`) — Structured query language with field picker, operator picker, value picker
- **Facets** — Distribution bars with click-to-filter
- **Analytics** — Aggregation and trend panels
- **Trend** — Histogram with brush zoom
- **URL-synced filters** via `useURLFilters` / `useExplorerState`

### 9.2 Logs Explorer (Datadog-class)

Component groups: `toolbar/`, `kpi/`, `facets/`, `trend/`, `table/`, `detail/`

Key interactions:
- Severity-colored gutter bars on log rows
- Inline row expand with JSON tree detection
- Cursor-backed pagination (not infinite scroll)
- 4-tab detail panel: Message / Fields / JSON / Correlation
- Density toggle and line wrap toggle

### 9.3 Trace Detail (Datadog-parity)

- Full-width visualization: Waterfall + Flame Graph toggle
- Non-modal resizable right `SpanDrawer` for span detail
- Drawer tabs: Info / Logs / Events / Links / Infra (hide-when-empty)
- Info tab: ancestor chain ("Where this happens") + timing grid
- Keyboard navigation: `j`/`k`/↑/↓ span nav, `e` cycle errors, `1`/`2` switch viz, `[`/`]` resize drawer

---

## 10. Interaction Patterns

### 10.1 Keyboard Shortcuts

Global shortcuts managed by `useKeyboardShortcuts` + `react-hotkeys-hook`:
- `Shift+/` — Toggle shortcut help overlay
- `/` — Focus search/filter
- `Cmd+K` — Command palette (cmdk-based)
- Feature-specific shortcuts for explorers and trace detail

### 10.2 Command Palette

`CommandPalette` component using `cmdk` — provides quick navigation, recent pages, and actions.

### 10.3 Drawers & Panels

- **DetailDrawer** — Right-sliding Vaul drawer (640px default) with section/field layout
- **DashboardEntityDrawer** — Dashboard-context entity detail
- **Trace SpanDrawer** — Resizable right panel with persistent width

### 10.4 Time Range

- `TimeSelector` component with relative presets and absolute range picker
- Recent ranges stored in app state
- Comparison mode for period-over-period analysis
- Time change triggers `refreshKey` increment → queries re-fetch

---

## 11. Theming

### 11.1 Theme Switching

- Controlled via `appStore.setTheme()`, persisted to localStorage
- Applied via `[data-theme="light"]` CSS attribute selector on root
- Components read tokens via `var()` — no runtime theme prop drilling

### 11.2 Dark Theme (Default)

Deep blue-black palette: `#0f1117` canvas → `#151821` cards → `#1c212c` insets. White text at 90% / 73% / 56% opacity tiers. Chart-heavy shadows for depth.

### 11.3 Light Theme

Warm off-white palette: `#fafaf8` canvas → `#f5f4f0` cards. Stone-tinted borders (`#d8d6d0`). Softer shadows with visible border rings.

### 11.4 Density Modes

`[data-density="compact"]` reduces the spacing scale by ~30% and tightens card padding/radius. Activated per-user via `DensityProvider`.

---

## 12. Third-Party Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.x | UI framework |
| Vite | 8.x | Build tooling |
| TanStack Router | 1.x | File-based routing |
| TanStack Query | 5.x | Server state |
| TanStack Table | 8.x | Data tables |
| TanStack Virtual | 3.x | Virtual scrolling |
| Zustand | 5.x | Client state |
| Tailwind CSS | 3.4 | Utility-first CSS |
| Radix UI | Various | Accessible primitives (Dialog, Dropdown, Popover, Select, Switch, Tabs, Tooltip) |
| uPlot | 1.6 | High-perf time-series charts |
| Framer Motion | 12.x | Animations |
| Lucide React | 0.474 | Icon set |
| XY Flow | 12.x | Service topology graphs |
| Dagre | 0.8 | Graph layout algorithm |
| cmdk | 1.x | Command palette |
| Vaul | 1.x | Drawer component |
| Zod | 4.x | Schema validation |
| date-fns | 4.x | Date utilities |
| Axios | 1.x | HTTP client |
| react-grid-layout | 2.x | Dashboard grid |
| react-resizable-panels | 4.x | Resizable split panes |
| react-virtuoso | 4.x | Virtual list rendering |
| react-hotkeys-hook | 5.x | Keyboard shortcut management |

---

## 13. Build & Tooling

- **Bundler**: Vite 8 with `@vitejs/plugin-react`
- **Linting**: Biome (replaces ESLint + Prettier)
- **Type checking**: TypeScript 5.9 (`tsc --noEmit`)
- **Aliases**: `@` → `src/`, `@app` → `src/app/`, `@features` → `src/features/`, `@shared` → `src/shared/`, `@store` → `src/app/store/`, `@config` → `src/config/`
- **CI pipeline**: `yarn ci` = type-check → lint → marketing asset check → build → budget check
- **Dev proxy**: `/api` → `VITE_DEV_BACKEND_URL`; WebSocket proxy supported
- **Code splitting**: Manual chunks for feature and runtime bundles in `vite.config.ts`
- **E2E**: Playwright (`@playwright/test`)

---

## 14. Cross-Repo Contracts

The frontend consumes the `optikk-backend` REST API exclusively:
- All requests go through the Axios client at `src/shared/api/api/client.ts`
- Auth is cookie-based (session); `useAuthValidation` validates on load
- Time ranges are sent as `startMs` / `endMs` query parameters
- Team context is sent via the session middleware (cookie-derived `teamId`)
- OTLP telemetry for the frontend itself is bootstrapped in `src/shared/telemetry/`
