import { lazy } from "react";

import type { DashboardPanelRegistration } from "./dashboardPanelRegistry";
import { BarRenderer } from "./renderers/BarRenderer";
import { GaugeRenderer } from "./renderers/GaugeRenderer";
import { HeatmapRenderer } from "./renderers/HeatmapRenderer";
import { PieRenderer } from "./renderers/PieRenderer";
import { StatCardRenderer, StatSummaryRenderer } from "./renderers/StatCardRenderer";
import { StatCardsGridRenderer } from "./renderers/StatCardsGridRenderer";
import { TableRenderer } from "./renderers/TableRenderer";

const RequestChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/RequestChart").then((module) => ({
    default: module.default,
  }))
);
const ErrorRateChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/ErrorRateChart").then((module) => ({
    default: module.default,
  }))
);
const ExceptionTypeLineChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/ExceptionTypeLineChart").then((module) => ({
    default: module.default,
  }))
);
const LatencyChart = lazy(() =>
  import("@shared/components/ui/charts/time-series/LatencyChart").then((module) => ({
    default: module.default,
  }))
);

export const BUILT_IN_DASHBOARD_PANELS: readonly DashboardPanelRegistration[] = [
  { panelType: "request", kind: "base-chart", component: RequestChart },
  { panelType: "error-rate", kind: "base-chart", component: ErrorRateChart },
  { panelType: "exception-type-line", kind: "base-chart", component: ExceptionTypeLineChart },
  { panelType: "latency", kind: "base-chart", component: LatencyChart },
  { panelType: "table", kind: "specialized", component: TableRenderer },
  { panelType: "bar", kind: "specialized", component: BarRenderer },
  { panelType: "gauge", kind: "specialized", component: GaugeRenderer },
  { panelType: "heatmap", kind: "specialized", component: HeatmapRenderer },
  { panelType: "pie", kind: "specialized", component: PieRenderer },
  { panelType: "stat-card", kind: "self-contained", component: StatCardRenderer },
  { panelType: "stat-summary", kind: "self-contained", component: StatSummaryRenderer },
  { panelType: "stat-cards-grid", kind: "specialized", component: StatCardsGridRenderer },
] as const;
