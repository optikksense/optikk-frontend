import { LayoutDashboard, Server } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const ServiceHealthGridRenderer = lazy(() =>
  import("./dashboard/renderers/ServiceHealthGridRenderer").then((module) => ({
    default: module.ServiceHealthGridRenderer,
  }))
);
const LatencyHistogramRenderer = lazy(() =>
  import("./dashboard/renderers/LatencyHistogramRenderer").then((module) => ({
    default: module.LatencyHistogramRenderer,
  }))
);
const LatencyHeatmapRenderer = lazy(() =>
  import("./dashboard/renderers/LatencyHeatmapRenderer").then((module) => ({
    default: module.LatencyHeatmapRenderer,
  }))
);
const DbSystemsRenderer = lazy(() =>
  import("./dashboard/renderers/DbSystemsRenderer").then((module) => ({
    default: module.DbSystemsRenderer,
  }))
);

export const overviewConfig: DomainConfig = {
  key: "overview",
  label: "Overview",
  navigation: [
    {
      path: ROUTES.overview,
      label: "Overview",
      icon: LayoutDashboard,
      group: "observe",
    },
    {
      path: ROUTES.services,
      label: "Service",
      icon: Server,
      group: "observe",
    },
  ],
  dashboardPanels: [
    { panelType: "service-health-grid", kind: "specialized", component: ServiceHealthGridRenderer },
    { panelType: "latency-histogram", kind: "specialized", component: LatencyHistogramRenderer },
    { panelType: "latency-heatmap", kind: "specialized", component: LatencyHeatmapRenderer },
    { panelType: "db-systems-overview", kind: "specialized", component: DbSystemsRenderer },
  ],
};
