import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Suspense, lazy } from "react";

import { getExplorerRoutes } from "@/app/registry/domainRegistry";
import { FeatureErrorBoundary, Loading } from "@/shared/components/ui/feedback";
import { ROUTES } from "@/shared/constants/routes";

import { AppContent } from "../App";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import { buildLegacyRedirects } from "./legacyRedirects";
import { buildMarketingRoutes } from "./marketingRoutes";

const ServiceDetailPage = lazy(
  () => import("@/features/services/pages/ServiceDetailPage/ServiceDetailPage")
);
const InfrastructureHubPage = lazy(
  () => import("@/features/infrastructure/pages/InfrastructureHubPage")
);
const OverviewHubPage = lazy(() => import("@/features/overview/pages/OverviewHubPage"));
const SaturationKafkaPage = lazy(
  () => import("@/features/saturation/pages/SaturationKafkaPage/SaturationKafkaPage")
);
const SaturationDatabasePage = lazy(
  () => import("@/features/saturation/pages/SaturationDatabasePage/SaturationDatabasePage")
);
const SaturationDatabaseQueryPage = lazy(
  () => import("@/features/saturation/pages/SaturationDatabaseQueryPage")
);
const ErrorTrackingPage = lazy(() => import("@/features/errors/pages/ErrorTrackingPage"));
const ErrorGroupDetailPage = lazy(() => import("@/features/errors/pages/ErrorGroupDetailPage"));
const ServiceCatalogPage = lazy(
  () => import("@/features/services/pages/ServiceCatalogPage/ServiceCatalogPage")
);
const HostDetailPage = lazy(() => import("@/features/infrastructure/pages/HostDetailPage"));
const ContainerDetailPage = lazy(
  () => import("@/features/infrastructure/pages/ContainerDetailPage")
);
const MonitorsPage = lazy(() => import("@/features/monitors/pages/MonitorsPage/MonitorsPage"));
const MonitorDetailPage = lazy(
  () => import("@/features/monitors/pages/MonitorDetailPage/MonitorDetailPage")
);
const NewMonitorPage = lazy(
  () => import("@/features/monitors/pages/NewMonitorPage/NewMonitorPage")
);
const NotificationsPage = lazy(
  () => import("@/features/monitors/pages/NotificationsPage/NotificationsPage")
);

export const rootRoute = createRootRoute({ component: AppContent });

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main-layout",
  component: () => (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  ),
});

function toNestedRoutePath(path: string): string {
  if (!path || path === ROUTES.home) return "";
  return path.startsWith("/") ? path.slice(1) : path;
}

function createProtected(
  path: string,
  // biome-ignore lint/suspicious/noExplicitAny: router dispatch accepts heterogeneous page components
  PageComponent: ComponentType<any>,
  fallbackPath?: string
) {
  if (fallbackPath) {
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Router infers heterogeneous route types that don't unify under createProtected's signature
    return createRoute({
      getParentRoute: () => mainLayoutRoute,
      path: toNestedRoutePath(path),
      loader: () => {
        throw redirect({ to: fallbackPath, replace: true });
      },
    }) as any;
  }
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Router infers heterogeneous route types that don't unify under createProtected's signature
  return createRoute({
    getParentRoute: () => mainLayoutRoute,
    path: toNestedRoutePath(path),
    component: () => (
      <FeatureErrorBoundary featureName={`route:${path}`}>
        <Suspense fallback={<Loading fullscreen />}>
          <PageComponent />
        </Suspense>
      </FeatureErrorBoundary>
    ),
  }) as any;
}

const protectedExplorerRoutes = getExplorerRoutes().map((route) =>
  createProtected(route.path, route.page)
);

const overviewRoute = createProtected(ROUTES.overview, OverviewHubPage);
const infrastructureRoute = createProtected(ROUTES.infrastructure, InfrastructureHubPage);
const serviceDetailRoute = createProtected(ROUTES.serviceDetail, ServiceDetailPage);
const kafkaOverviewRoute = createProtected(ROUTES.saturationKafkaOverview, SaturationKafkaPage);
const saturationDatabaseRoute = createProtected(ROUTES.saturationDatabase, SaturationDatabasePage);
const saturationDatabaseQueryRoute = createProtected(
  ROUTES.saturationDatabaseQuery,
  SaturationDatabaseQueryPage
);
const errorTrackingRoute = createProtected(ROUTES.errors, ErrorTrackingPage);
const errorGroupDetailRoute = createProtected(ROUTES.errorGroupDetail, ErrorGroupDetailPage);
const servicesCatalogRoute = createProtected(ROUTES.services, ServiceCatalogPage);
const serviceMapRoute = createProtected(
  ROUTES.serviceMap,
  () => null,
  `${ROUTES.services}?tab=map`
);
const deploymentsRoute = createProtected(ROUTES.deployments, () => null, ROUTES.services);
const hostDetailRoute = createProtected(ROUTES.hostDetail, HostDetailPage);
const containerDetailRoute = createProtected(ROUTES.containerDetail, ContainerDetailPage);

const monitorsRoute = createProtected(ROUTES.monitors, MonitorsPage);
const monitorsNotificationsRoute = createProtected(ROUTES.monitorsNotifications, NotificationsPage);
const monitorsNewRoute = createProtected(ROUTES.monitorsNew, NewMonitorPage);
const monitorDetailRoute = createProtected(ROUTES.monitorDetail, MonitorDetailPage);
const monitorEditRoute = createProtected(ROUTES.monitorEdit, NewMonitorPage);
const alertsNewRedirect = createProtected(ROUTES.alertsNew, () => null, ROUTES.monitorsNew);

const logsPatternsRedirect = createProtected("/logs/patterns", () => null, ROUTES.logs);
const logsTransactionsRedirect = createProtected("/logs/transactions", () => null, ROUTES.logs);

const layoutFallback = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "$",
  loader: () => {
    throw redirect({ to: ROUTES.overview, replace: true });
  },
});

const globalFallback = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  loader: () => {
    throw redirect({ to: ROUTES.home, replace: true });
  },
});

const { marketingTree, productRedirectRoute, loginRoute } = buildMarketingRoutes(() => rootRoute);

const routeTree = rootRoute.addChildren([
  marketingTree,
  productRedirectRoute,
  loginRoute,
  mainLayoutRoute.addChildren([
    ...protectedExplorerRoutes,
    overviewRoute,
    infrastructureRoute,
    serviceDetailRoute,
    kafkaOverviewRoute,
    saturationDatabaseRoute,
    saturationDatabaseQueryRoute,
    errorTrackingRoute,
    errorGroupDetailRoute,
    servicesCatalogRoute,
    serviceMapRoute,
    deploymentsRoute,
    hostDetailRoute,
    containerDetailRoute,
    monitorsRoute,
    monitorsNotificationsRoute,
    monitorsNewRoute,
    monitorDetailRoute,
    monitorEditRoute,
    alertsNewRedirect,
    logsPatternsRedirect,
    logsTransactionsRedirect,
    ...buildLegacyRedirects(mainLayoutRoute),
    layoutFallback,
  ]),
  globalFallback,
]);

export const router = createRouter({ routeTree });
