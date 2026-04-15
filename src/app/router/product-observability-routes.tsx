import { createRoute } from "@tanstack/react-router"

import { protectedRoute } from "@/app/router/base-routes"
import {
  SaturationDatastoreRoute,
  SaturationGroupRoute,
  SaturationTopicRoute,
} from "@/app/router/route-components"
import { InfrastructurePage } from "@/features/infrastructure/InfrastructurePage"
import { LogsPage } from "@/features/logs/LogsPage"
import { MetricsPage } from "@/features/metrics/MetricsPage"
import { OverviewPage } from "@/features/overview/OverviewPage"
import { SaturationPage } from "@/features/saturation/SaturationPage"
import { ServicePage } from "@/features/service/ServicePage"
import { TraceComparePage } from "@/features/traces/TraceComparePage"
import { TraceDetailPage } from "@/features/traces/TraceDetailPage"
import { TracesPage } from "@/features/traces/TracesPage"

export const observabilityRoutes = [
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "overview",
    component: OverviewPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "service",
    component: ServicePage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "logs",
    component: LogsPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "traces",
    component: TracesPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "traces/compare",
    component: TraceComparePage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "traces/$traceId",
    component: TraceDetailPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "metrics",
    component: MetricsPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "infrastructure",
    component: InfrastructurePage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "saturation",
    component: SaturationPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "saturation/datastores/$system",
    component: SaturationDatastoreRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "saturation/kafka/topics/$topic",
    component: SaturationTopicRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "saturation/kafka/groups/$groupId",
    component: SaturationGroupRoute,
  }),
]
