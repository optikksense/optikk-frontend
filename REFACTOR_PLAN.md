# REFACTOR_PLAN.md for `optic-frontend`

## Summary
- Audit scope: all `152` files under `src/`.
- Output target: `REFACTOR_PLAN.md` at repo root.
- This document will be analysis-only (no component code changes), and will include six required sections exactly as requested.

## Public Interface/Type Changes (Planned, Not Implemented in This Step)
- No runtime API changes in this step (document-only).
- Planned internal interfaces for later refactor:
1. `useUrlSyncedTab<T>()` shared hook for tab/query-param sync.
2. `usePersistedColumns()` + `useResizableColumns()` for board tables.
3. `thresholds`/`status` utility contracts used across features.
4. Domain service split replacing broad `v1Service` usage at page-level.

## 1) Files That Need Refactoring (and Why)
| File | Why |
|---|---|
| `src/App.tsx` | `MIXED`, `COUPLED`: routing + auth-expiry event + theme side effects + background styling in one file |
| `src/components/layout/Header.tsx` | `MIXED`: team switch, refresh timing, auto-refresh dropdown/state, toast side effects |
| `src/components/layout/Header.css` | `STYLE`, `LARGE`: header + auto-refresh + time picker styles tightly mixed |
| `src/components/layout/Sidebar.css` | `STYLE`: large monolithic sidebar styling |
| `src/index.css` | `STYLE`, `MIXED`: global tokens + broad Ant overrides + theme behavior in one file |
| `src/components/common/forms/TimeRangePicker.tsx` | `LARGE`, `MIXED`: picker state machine + rendering + interaction logic |
| `src/components/dashboard/ConfigurableDashboard.tsx` | `LARGE`, `MIXED`, `COUPLED`, `DUP`: renderer registry + dataset adapters + endpoint/queue list derivation + chart card rendering |
| `src/components/common/data-display/ObservabilityDataBoard.tsx` | `LARGE`, `MIXED`: table shell + persistence + export + resize + empty/loading + load-more in one file |
| `src/components/common/data-display/ObservabilityDataBoard.css` | `STYLE`, `LARGE`: dense board/detail panel styling |
| `src/components/common/forms/ObservabilityQueryBar.tsx` | `LARGE`, `MIXED`: query-builder state machine + dropdowns + pills + keyboard hints |
| `src/components/common/forms/ObservabilityQueryBar.css` | `STYLE`, `LARGE`: all query-bar visual states bundled together |
| `src/components/charts/specialized/ServiceGraph.tsx` | `LARGE`, `MIXED`: graph semantics + thresholds + rendering + interactions |
| `src/components/charts/specialized/ServiceGraph.css` | `STYLE`, `LARGE`: graph-specific styling too broad |
| `src/components/common/data-display/TopEndpointsList.tsx` | `DUP`: overlaps with endpoint/queue/table list render patterns |
| `src/components/charts/micro/EndpointList.tsx` | `DUP`: duplicates behavior already present in other endpoint list components |
| `src/components/common/data-display/QueueMetricsList.tsx` | `DUP`: repeated list/table rendering patterns and thresholds |
| `src/components/common/data-display/DatabaseTopTablesList.tsx` | `DUP`: repeated list rendering and color logic |
| `src/features/traces/pages/TracesPage/index.tsx` | `LARGE`, `MIXED`, `DUP`, `COUPLED`: local components + types + normalization + backend param mapping + filtering + rendering |
| `src/features/traces/pages/TracesPage/TracesPage.css` | `STYLE`, `LARGE`: one file contains all traces page visual sections |
| `src/features/traces/pages/TraceDetailPage/index.tsx` | `LARGE`, `MIXED`, `COUPLED`: span normalization + query orchestration + stats + detail UI |
| `src/features/log/pages/LogsHubPage/index.tsx` | `LARGE`, `MIXED`, `DUP`, `COUPLED`: URL filters + backend params + gap-fill + board + detail logic together |
| `src/features/log/pages/LogsHubPage/LogsHubPage.css` | `STYLE`, `LARGE`: monolithic logs page styling |
| `src/features/log/components/log/LogRow.tsx` | `MIXED`, `COUPLED`: reusable time helpers mixed with row UI; imported cross-feature |
| `src/features/log/components/log/KpiCard.tsx` | `DUP`: duplicate KPI card concept also implemented in traces page |
| `src/features/log/components/log/ServicePills.tsx` | `DUP`: duplicate service-pill component logic also in traces page |
| `src/features/services/pages/ServiceDetailPage/index.tsx` | `LARGE`, `MIXED`, `DUP`, `COUPLED`: 4 tab views + normalizers + columns + stats + navigation |
| `src/features/services/pages/ServicesPage/index.tsx` | `LARGE`, `MIXED`, `DUP`: tab URL sync + table columns/sorting + topology table config |
| `src/features/services/hooks/useServicesData.ts` | `LARGE`, `MIXED`: many queries + normalization + topology graph derivation + sorting/filtering |
| `src/features/services/components/services-page/ServiceOverviewTab.tsx` | `LARGE`, `DUP`: repeated status/error-rate visual thresholds and list/table behavior |
| `src/features/services/components/services-page/ServiceTopologyTab.tsx` | `DUP`: repeated table/status/risk rendering patterns |
| `src/features/services/pages/ServiceMapPage/index.tsx` | `COUPLED`, `DUP`, `ORPHAN`: standalone page pattern not used by routing |
| `src/features/services/pages/ServiceMapPage/ServiceMapPage.css` | `STYLE`, `ORPHAN`: style file tied to unused page |
| `src/features/ai/pages/AiObservabilityPage/index.tsx` | `LARGE`, `MIXED`, `DUP`, `COUPLED`: multiple tab implementations + helpers + many queries in one file |
| `src/features/ai/pages/AiObservabilityPage/AiObservabilityPage.css` | `STYLE`: broad page-level styles should be split by tab/components |
| `src/features/errors/pages/ErrorDashboardPage/index.tsx` | `LARGE`, `MIXED`, `DUP`: normalizers + queries + table/dashboard wiring |
| `src/features/infrastructure/pages/NodesPage/index.tsx` | `LARGE`, `MIXED`, `DUP`: board + drawer + nested board + repeated thresholds |
| `src/features/overview/pages/OverviewPage/index.tsx` | `LARGE`, `MIXED`, `DUP`, `COUPLED`: summary/SLO/services grids + metrics normalizer dependency |
| `src/features/overview/pages/SloSliDashboardPage/index.tsx` | `LARGE`, `MIXED`, `DUP`: gauges + compliance table + thresholds in one module |
| `src/features/overview/pages/OverviewHubPage/index.tsx` | `DUP`, `COUPLED`: repeated tab URL sync and direct cross-feature composition |
| `src/features/infrastructure/pages/InfrastructureHubPage/index.tsx` | `DUP`, `COUPLED`: repeated tab URL sync and cross-feature import (`metrics`) |
| `src/features/settings/pages/SettingsPage/index.tsx` | `LARGE`, `MIXED`: profile + preferences + team rendering + mutations in one file |
| `src/features/metrics/pages/SaturationPage/index.tsx` | `LARGE`, `MIXED`, `DUP`, `COUPLED`: page-specific normalizers, many queries, thresholds |
| `src/features/metrics/pages/DatabaseCachePerformancePage/index.tsx` | `LARGE`, `MIXED`, `DUP`, `COUPLED`: local component + style-heavy rendering + multiple datasets |
| `src/features/metrics/pages/MessagingQueueMonitoringPage/index.tsx` | `LARGE`, `MIXED`, `DUP`, `COUPLED`: local table component + system metadata + multiple queries |
| `src/features/metrics/pages/LatencyAnalysisPage/index.tsx` | `MIXED`, `COUPLED`: fetch and presentation tightly bound |
| `src/features/metrics/pages/ResourceUtilizationPage/index.tsx` | `MIXED`, `DUP`, `COUPLED`: repeated numeric/column rendering logic |
| `src/features/metrics/hooks/useMetricsState.ts` | `DUP`: tab query-param synchronization pattern repeated elsewhere |
| `src/features/metrics/hooks/useMetricsQueries.ts` | `MIXED`, `COUPLED`: time-range building + query orchestration + cross-domain service calls |
| `src/features/metrics/utils/metricNormalizers.ts` | `COUPLED`: utilities used across unrelated domains from feature-local path |
| `src/features/services/utils/servicesUtils.ts` | `COUPLED`, `DUP`: service status/thresholds should be shared domain utilities |
| `src/services/metricsService.ts` | `LARGE`, `MIXED`, `COUPLED`: metrics + errors + incidents + infrastructure endpoints in one service |
| `src/services/v1Service.ts` | `COUPLED`: broad compatibility barrel used as cross-domain dependency |
| `src/config/constants.ts` | `MIXED`: API/UI/theme/status/chart constants mixed; duplicates exist outside this file |

## 2) Proposed Folder Structure
```text
src/
  app/
    App.tsx
    routes/
      appRoutes.tsx
      ProtectedRoute.tsx
    providers/
      ThemeProvider.tsx
      AuthExpiryListener.tsx
  shared/
    components/
      data-board/
      query-bar/
      metric-lists/
      status/
    hooks/
      useUrlSyncedTab.ts
      usePaginatedBoardState.ts
      useDetailPanelState.ts
      useAutoRefresh.ts
      usePersistedColumns.ts
      useResizableColumns.ts
    utils/
      numbers.ts
      thresholds.ts
      status.ts
      time.ts
      endpointKeys.ts
      queryParams.ts
    constants/
      chartColors.ts
      ui.ts
      telemetry.ts
  domains/
    traces/{pages,components,hooks,services,utils,styles}
    logs/{pages,components,hooks,services,utils,styles}
    services/{pages,components,hooks,services,utils,styles}
    overview/{pages,components,hooks,services,utils,styles}
    metrics/{pages,components,hooks,services,utils,styles}
    infrastructure/{pages,components,hooks,services,utils,styles}
    ai/{pages,components,hooks,services,utils,styles}
    settings/{pages,components,hooks,services,utils,styles}
  services/
    api/
      client.ts
      service-types.ts
```

## 3) Component Extraction Checklist (with target filenames/locations)
- [ ] `TracesKpiCard.tsx` → `src/domains/traces/components/kpi/TracesKpiCard.tsx`
- [ ] `TracesServicePills.tsx` → `src/domains/traces/components/filters/TracesServicePills.tsx`
- [ ] `TraceStatusBadge.tsx` → `src/domains/traces/components/table/TraceStatusBadge.tsx`
- [ ] `TraceMethodBadge.tsx` → `src/domains/traces/components/table/TraceMethodBadge.tsx`
- [ ] `TopServicesPanel.tsx` → `src/domains/traces/components/charts/TopServicesPanel.tsx`
- [ ] `TracesTableRow.tsx` → `src/domains/traces/components/table/TracesTableRow.tsx`
- [ ] `LogsKpiRow.tsx` → `src/domains/logs/components/kpi/LogsKpiRow.tsx`
- [ ] `LogsVolumeSection.tsx` → `src/domains/logs/components/charts/LogsVolumeSection.tsx`
- [ ] `LogsLevelDistributionCard.tsx` → `src/domains/logs/components/charts/LogsLevelDistributionCard.tsx`
- [ ] `LogsTableSection.tsx` → `src/domains/logs/components/table/LogsTableSection.tsx`
- [ ] `ServiceDetailStatsRow.tsx` → `src/domains/services/components/detail/ServiceDetailStatsRow.tsx`
- [ ] `ServiceDetailOverviewTab.tsx` → `src/domains/services/components/detail/tabs/ServiceDetailOverviewTab.tsx`
- [ ] `ServiceDetailErrorsTab.tsx` → `src/domains/services/components/detail/tabs/ServiceDetailErrorsTab.tsx`
- [ ] `ServiceDetailLogsTab.tsx` → `src/domains/services/components/detail/tabs/ServiceDetailLogsTab.tsx`
- [ ] `ServiceDetailDependenciesTab.tsx` → `src/domains/services/components/detail/tabs/ServiceDetailDependenciesTab.tsx`
- [ ] `AiOverviewTab.tsx` → `src/domains/ai/components/tabs/AiOverviewTab.tsx`
- [ ] `AiPerformanceTab.tsx` → `src/domains/ai/components/tabs/AiPerformanceTab.tsx`
- [ ] `AiCostTab.tsx` → `src/domains/ai/components/tabs/AiCostTab.tsx`
- [ ] `AiSecurityTab.tsx` → `src/domains/ai/components/tabs/AiSecurityTab.tsx`
- [ ] `AiGuideTab.tsx` → `src/domains/ai/components/tabs/AiGuideTab.tsx`
- [ ] `NodesTable.tsx` → `src/domains/infrastructure/components/nodes/NodesTable.tsx`
- [ ] `NodeDetailDrawer.tsx` → `src/domains/infrastructure/components/nodes/NodeDetailDrawer.tsx`
- [ ] `NodeServicesTable.tsx` → `src/domains/infrastructure/components/nodes/NodeServicesTable.tsx`
- [ ] `SloHealthGauges.tsx` → `src/domains/overview/components/slo/SloHealthGauges.tsx`
- [ ] `SloComplianceTable.tsx` → `src/domains/overview/components/slo/SloComplianceTable.tsx`
- [ ] `DatabaseSystemBreakdown.tsx` → `src/domains/metrics/components/database/DatabaseSystemBreakdown.tsx`
- [ ] `TopQueuesTable.tsx` → `src/domains/metrics/components/messaging/TopQueuesTable.tsx`
- [ ] `MessagingSystemsPills.tsx` → `src/domains/metrics/components/messaging/MessagingSystemsPills.tsx`
- [ ] `ConfigurableChartCard.tsx` → `src/shared/components/dashboard/ConfigurableChartCard.tsx`
- [ ] `SpecializedRendererRegistry.ts` → `src/shared/components/dashboard/SpecializedRendererRegistry.ts`
- [ ] `BoardActionBar.tsx` → `src/shared/components/data-board/BoardActionBar.tsx`
- [ ] `BoardExportMenu.tsx` → `src/shared/components/data-board/BoardExportMenu.tsx`
- [ ] `BoardColumnSettingsPopover.tsx` → `src/shared/components/data-board/BoardColumnSettingsPopover.tsx`
- [ ] `BoardSkeleton.tsx` → `src/shared/components/data-board/BoardSkeleton.tsx`
- [ ] `BoardEmptyState.tsx` → `src/shared/components/data-board/BoardEmptyState.tsx`
- [ ] `BoardLoadMoreFooter.tsx` → `src/shared/components/data-board/BoardLoadMoreFooter.tsx`
- [ ] `QueryFieldPicker.tsx` → `src/shared/components/query-bar/QueryFieldPicker.tsx`
- [ ] `QueryOperatorPicker.tsx` → `src/shared/components/query-bar/QueryOperatorPicker.tsx`
- [ ] `QueryKeyboardHints.tsx` → `src/shared/components/query-bar/QueryKeyboardHints.tsx`
- [ ] `UnifiedMetricList.tsx` (replace list duplication) → `src/shared/components/metric-lists/UnifiedMetricList.tsx`
- [ ] `SettingsProfileTab.tsx` → `src/domains/settings/components/tabs/SettingsProfileTab.tsx`
- [ ] `SettingsPreferencesTab.tsx` → `src/domains/settings/components/tabs/SettingsPreferencesTab.tsx`
- [ ] `SettingsTeamTab.tsx` → `src/domains/settings/components/tabs/SettingsTeamTab.tsx`

## 4) Custom Hooks to Create from Repeated Stateful Logic
- `useUrlSyncedTab.ts`: shared `tab` query-param sync for `OverviewHubPage`, `InfrastructureHubPage`, `ServicesPage`, `useMetricsState`.
- `usePaginatedBoardState.ts`: shared `page/pageSize/reset` behavior for logs/traces/service tables.
- `useDetailPanelState.ts`: shared selected-row/open-close handling for detail drawers/panels.
- `useBackendFilterParams.ts`: convert structured filters + quick toggles to backend query params (logs/traces/services).
- `useAutoRefresh.ts`: refresh timer + “last refreshed” label logic from header.
- `usePersistedColumns.ts`: localStorage-backed column visibility state from `ObservabilityDataBoard`.
- `useResizableColumns.ts`: extracted column resize/mouse handlers from `ObservabilityDataBoard`.
- `useTopListSelection.ts`: selected endpoint/queue item toggles used across dashboard list widgets.
- `useModelScopedData.ts`: selected-model filtering for AI tab datasets.
- `useServiceHealthSummary.ts`: reusable health counts/status derivation for services and infrastructure.
- `useTimeRangeBounds.ts`: single source for start/end range calculations currently repeated in direct `useQuery` usage.

## 5) Coupled Features to Decouple
1. `v1Service` is imported directly by many pages; move pages to domain services and keep `v1Service` as transitional adapter only.
2. `OverviewHubPage` renders `ErrorDashboardPage` directly; keep errors under `domains/errors` route composition boundaries.
3. `InfrastructureHubPage` imports `ResourceUtilizationPage` from metrics; move resource utilization under infrastructure domain.
4. `TracesPage` imports `relativeTime` from logs component; move time helpers to `shared/utils/time.ts`.
5. `OverviewPage` imports metric normalizers from metrics feature path; move generic normalizers to shared/domain-neutral utilities.
6. `ConfigurableDashboard` hardcodes AI, queue, endpoint semantics; introduce adapter interface per domain to remove feature coupling.
7. `metricsService.ts` mixes metrics/errors/incidents/infrastructure; split into `metricsService`, `errorsService`, `infraService`.
8. `App.tsx` mixes route composition with global side effects; move side effects to app providers.
9. `ServiceMapPage` exists but is not routed; either integrate via route or retire as dead feature.
10. List components (`TopEndpointsList`, `EndpointList`, `QueueMetricsList`, `DatabaseTopTablesList`) are parallel implementations of the same UI concept; consolidate to one configurable list renderer.

## 6) Shared Utilities/Constants to Centralize
- `shared/utils/numbers.ts`: `safeNumber`, `safeString`, percent/money helpers replacing local `n`, `pct`, `dollar`.
- `shared/utils/thresholds.ts`: latency/error/lag threshold maps used by services, nodes, traces, AI, and metrics.
- `shared/utils/status.ts`: status derivation (`healthy/degraded/unhealthy`) and status-color mapping.
- `shared/utils/time.ts`: `relativeTime`, timestamp bucket helpers, gap-fill utilities.
- `shared/utils/endpointKeys.ts`: endpoint key/name normalizers used by dashboard/list components.
- `shared/utils/queryParams.ts`: structured-filter-to-query-param mapping for logs/traces/services.
- `shared/constants/chartColors.ts`: single chart palette source replacing per-component `CHART_COLORS`.
- `shared/constants/dataBoard.ts`: row heights, min widths, skeleton constants from `ObservabilityDataBoard`.
- `shared/constants/filterOperators.ts`: default operators and field metadata helpers for query bar usage.
- `shared/constants/domainMeta.ts`: DB system and MQ system metadata currently duplicated in page files.
- `shared/constants/ui.ts`: common semantic colors and size tokens where constants are currently hardcoded.

## Test Plan
1. Validate `REFACTOR_PLAN.md` has exactly six required sections in requested order.
2. Validate every listed refactor file has at least one explicit reason tag (`LARGE`, `MIXED`, `DUP`, `COUPLED`, `STYLE`, `ORPHAN`).
3. Validate extraction checklist paths are unique and located under proposed folder structure.
4. Validate each custom hook maps to at least two current call sites/patterns (from audit evidence).
5. Validate coupling list enumerates concrete source-target dependencies (not generic statements).
6. Validate no source code files are changed in this step; only `REFACTOR_PLAN.md` is created.

## Assumptions and Defaults
- “Needs refactor” is defined as any file that is oversized, mixes concerns, duplicates logic, or creates tight coupling.
- Threshold default for “oversized” in this audit is approximately `>=250` lines, with exceptions for clear duplication/coupling.
- Existing behavior/routes stay unchanged during refactor decomposition; extraction is structural first.
- `ServiceMapPage` is treated as orphan until explicitly reintroduced to routing.
- This step creates only the markdown plan artifact; no component implementation changes.
