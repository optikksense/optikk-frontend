---
description: Optik frontend — development standards, architecture, and LLD patterns
alwaysApply: true
---

# Optik Frontend — Engineering Skill

This skill defines the development standards and architectural patterns for the **optic-frontend** repository. As an AI assistant, you must adhere to these guidelines for all tasks within this workspace.

## Session Workflow (Mandatory)

1. **Read [CODEBASE_INDEX.md](../../CODEBASE_INDEX.md)** at the repository root. This provides the full map of domains, routes, and shared layers.
2. **Review [Active Rules](../../.cursor/rules/optik-frontend.mdc)** for the latest hot paths and patterns.
3. **Read [Agent Philosophy](./philosophy/)**: Review strategic alignment, ADRs, and **[Highest Standards](./philosophy/highest-standards.md)** (No Python, Direct Imports, Conventional Commits) for Staff-level context.
4. **Plan First, Code After Approval**:
   - For non-trivial work, produce a plan.
   - **At least two viable approaches** must be presented with Pros/Cons.
   - Do **not** modify project files until the user explicitly approves the plan.
4. **After every iteration (mandatory)**: Review and update if anything changed:
   - `CODEBASE_INDEX.md` — new features, routes, hooks, types, panels, cross-repo contracts
   - `.cursor/rules/optik-frontend.mdc` — new patterns, conventions, LLD details
   - This file (`.agent/SKILL.md`) and `CLAUDE.md` — keep aligned
   
   Documentation must always reflect current architecture. Always check, even for small changes.

- **Biome**: Unified toolchain for linting and formatting. Use `npm run lint:fix` before completion.
- **Conventional Commits**: Use `feat:`, `fix:`, `refactor:` prefixes for all summaries.
- **Direct Imports**: No barrel imports. Import directly from the source file.
- **Import Type**: Always use `import type` for TypeScript types.

## Performance and UI Patterns

- **uPlot Charts**: When data updates but the geometry/options are the same, call **`setData`** on the existing chart instance. Do **not** destroy and recreate the chart; this prevents visual flickering during auto-refresh.
- **TanStack Query v5**: 
  - Use **`placeholderData: keepPreviousData`** (or `(p) => p`) to ensure refetches do not flash empty/loading states.
  - Avoid putting `refreshKey` directly into `queryKey` for backend-driven panels (this blinks the grid). Use stable keys and **`useInvalidateQueriesOnAppRefresh`** instead.
- **Auto-Refresh**: Distinguish between "Initial Fetch" (`isPending && data === undefined`) and "Background Refresh" to ensure the UI feels stable.

## Engineering Principles

- **SOLID & DRY**: Factor shared behavior when a pattern appears more than once.
- **Quality Improvement**: Leave the code clearer or simpler with every change.
- **No Unsolicited Tests**: Do not add or expand test cases unless explicitly asked by the user.

## Canonical Paths

- **Feature Registry**: `src/app/registry/domainRegistry.ts` — 8 domains: overview, saturation, metrics, logs, traces, infrastructure, alerts, settings
- **Route Constants**: `src/shared/constants/routes.ts`
- **Dashboard UI**: `src/shared/components/ui/dashboard/` (`ConfigurableDashboard.tsx`, `DashboardEntityDrawer.tsx`, `ConfigurableChartCard.tsx`)
- **Panel Registry**: `src/shared/components/ui/dashboard/dashboardPanelRegistry.tsx` — 12 built-in + 10 domain-contributed panels
- **Built-in Panels**: `src/shared/components/ui/dashboard/builtInDashboardPanels.tsx`
- **HTTP Client**: `src/shared/api/api/client.ts`
- **API Decode**: `src/shared/api/utils/decode.ts`
- **Overview hub**: `src/features/overview/pages/OverviewHubPage/` + `src/features/overview/api/overviewHubApi.ts`
- **Global Store**: `src/app/store/appStore.ts`
- **Charts**: `src/shared/components/ui/charts/` (UPlotChart, ObservabilityChart, time-series/, distributions/, micro/, specialized/)
- **Theme**: `src/config/themeColors.css`
- **Entities**: `src/shared/entities/` (log, metric, trace, user)
- **Live Tail**: `src/shared/hooks/useSocketStream.ts` (core), `src/features/explorer-core/hooks/useLiveTailStream.ts` (wrapper)
- **Explorer Core**: `src/features/explorer-core/` (shared analytics, facets, visualizations)

## Low-Level Design Patterns

### Feature Module Pattern

Each feature's `index.ts` exports a `DomainConfig`:

```tsx
const MyPage = lazy(() => import('./pages/MyPage').then(m => ({ default: m.default })));
export const myConfig: DomainConfig = {
  key: 'my-domain', label: 'My Domain', permissions: ['my-domain:read'],
  navigation: [{ path: ROUTES.myDomain, label: 'My Domain', icon: SomeIcon, group: 'observe' }],
  routes: [{ path: ROUTES.myDomain, page: MyPage }],
  dashboardPanels: [{ panelType: 'my-panel', kind: 'specialized', component: MyRenderer }],
};
```

- All pages/renderers use `lazy()` for code splitting
- Register in `domainRegistry.ts` — order = nav order

### Dashboard Panel Registration

- `DashboardPanelRegistration`: `{ panelType, kind: 'base-chart'|'specialized'|'self-contained', component }`
- Built from all domain configs via `getDashboardPanelRegistrations()` + `DashboardPanelRegistryProvider`
- Resolve at render: `useDashboardPanelRegistration(panelType)`
- Drawer entities: `databaseSystem`, `deployment`, `errorGroup`, `kafkaGroup`, `kafkaTopic`, `node`, `redisInstance`, `service`

### Query Patterns

| Scope | `refreshKey` in key? | Invalidation |
|-------|---------------------|--------------|
| Explorer | Yes | Key change triggers refetch |
| Dashboard component | **No** | `useInvalidateQueriesOnAppRefresh` |
| Dashboard datasource | **No** | `useInvalidateQueriesOnAppRefresh` |

- Always: `placeholderData: keepPreviousData`
- Loading = `isPending && data === undefined`

### State Management

- **Zustand** (`appStore`): `timeRange`, `teamId`, `refreshKey`, `theme`, `sidebar`, `autoRefreshInterval`, `timezone`, `comparisonMode`, `viewPreferences`, `recentPages`, `recentTimeRanges`
- **TanStack Query**: all server/API state
- **Local state**: component-specific UI
- Never duplicate server state in Zustand

### ESLint Feature Boundary

- No cross-feature imports (`no-restricted-imports`)
- No TS enums (`no-restricted-syntax`) — use `as const` + union types
- `no-floating-promises`: error

### CSS Theming

- CSS variables in `themeColors.css` → Tailwind in `tailwind.config.ts`
- Tokens: `--bg-primary`, `--text-primary`, `--color-success/warning/error`, `--chart-1..8`
- Dark mode via class toggle; Fonts: Inter (sans), JetBrains Mono / Fira Code (mono)
