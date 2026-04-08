import { Gauge, LayoutDashboard, Server } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const OverviewHubPage = lazy(() =>
  import("./pages/OverviewHubPage").then((module) => ({ default: module.default }))
);
const SaturationHubPage = lazy(() =>
  import("@/features/metrics/pages/SaturationHubPage").then((module) => ({
    default: module.default,
  }))
);
const ServiceHubPage = lazy(() =>
  import("./pages/ServiceHubPage").then((module) => ({ default: module.default }))
);
const ServiceHealthGridRenderer = lazy(() =>
  import("./dashboard/renderers/ServiceHealthGridRenderer").then((module) => ({
    default: module.ServiceHealthGridRenderer,
  }))
);
const SloIndicatorsRenderer = lazy(() =>
  import("./dashboard/renderers/SloIndicatorsRenderer").then((module) => ({
    default: module.SloIndicatorsRenderer,
  }))
);
const ErrorHotspotRankingRenderer = lazy(() =>
  import("./dashboard/renderers/ErrorHotspotRankingRenderer").then((module) => ({
    default: module.ErrorHotspotRankingRenderer,
  }))
);
const LatencyHistogramRenderer = lazy(() =>
  import("@/features/metrics/dashboard/renderers/LatencyHistogramRenderer").then((module) => ({
    default: module.LatencyHistogramRenderer,
  }))
);
const LatencyHeatmapRenderer = lazy(() =>
  import("@/features/metrics/dashboard/renderers/LatencyHeatmapRenderer").then((module) => ({
    default: module.LatencyHeatmapRenderer,
  }))
);
const DbSystemsRenderer = lazy(() =>
  import("@/features/metrics/dashboard/renderers/DbSystemsRenderer").then((module) => ({
    default: module.DbSystemsRenderer,
  }))
);

export const overviewConfig: DomainConfig = {
  key: "overview",
  label: "Overview",
  permissions: ["overview:read"],
  navigation: [
    {
      path: ROUTES.overview,
      label: "Overview",
      icon: LayoutDashboard,
      group: "observe",
    },
    {
      path: ROUTES.saturation,
      label: "Saturation",
      icon: Gauge,
      group: "operate",
    },
    {
      path: ROUTES.service,
      label: "Service",
      icon: Server,
      group: "observe",
    },
  ],
  routes: [],
  dashboardPages: [
    { pageId: "overview", page: OverviewHubPage },
    { pageId: "saturation", page: SaturationHubPage },
    { pageId: "service", page: ServiceHubPage },
  ],
  dashboardPanels: [
    { panelType: "service-health-grid", kind: "specialized", component: ServiceHealthGridRenderer },
    { panelType: "slo-indicators", kind: "specialized", component: SloIndicatorsRenderer },
    {
      panelType: "error-hotspot-ranking",
      kind: "specialized",
      component: ErrorHotspotRankingRenderer,
    },
    { panelType: "latency-histogram", kind: "specialized", component: LatencyHistogramRenderer },
    { panelType: "latency-heatmap", kind: "specialized", component: LatencyHeatmapRenderer },
    { panelType: "db-systems-overview", kind: "specialized", component: DbSystemsRenderer },
  ],
};
