import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Suspense, lazy } from "react";

import { getExplorerRoutes } from "@/app/registry/domainRegistry";
import { FeatureErrorBoundary, Loading } from "@/shared/components/ui/feedback";
import { ROUTES } from "@/shared/constants/routes";

import { AppContent } from "../App";
import MainLayout from "../layout/MainLayout";
import { buildLegacyRedirects } from "./legacyRedirects";
import { buildMarketingRoutes } from "./marketingRoutes";
import ProtectedRoute from "./ProtectedRoute";

const ServiceHubPage = lazy(() => import("@/features/overview/pages/ServiceHubPage"));
const ServicePage = lazy(() => import("@/features/overview/pages/ServicePage/ServicePage"));
const InfrastructureHubPage = lazy(
  () => import("@/features/infrastructure/pages/InfrastructureHubPage")
);
const OverviewHubPage = lazy(
  () => import("@/features/overview/pages/OverviewHubPage/OverviewHubPage")
);
const DatabaseQueriesPage = lazy(() => import("@/features/saturation/pages/DatabaseQueriesPage"));
const KafkaOverviewPage = lazy(() => import("@/features/saturation/pages/KafkaOverviewPage"));
const ErrorTrackingPage = lazy(() => import("@/features/errors/pages/ErrorTrackingPage"));
const ErrorGroupDetailPage = lazy(
  () => import("@/features/errors/pages/ErrorGroupDetailPage")
);
const SloListPage = lazy(() => import("@/features/slo/pages/SloListPage"));
const SloDetailPage = lazy(() => import("@/features/slo/pages/SloDetailPage"));
const ServiceCatalogPage = lazy(
  () => import("@/features/services/pages/ServiceCatalogPage")
);
const ServiceMapPage = lazy(() => import("@/features/services/pages/ServiceMapPage"));
const DeploymentsPage = lazy(() => import("@/features/services/pages/DeploymentsPage"));
const HostMapPage = lazy(() => import("@/features/infrastructure/pages/HostMapPage"));
const HostDetailPage = lazy(() => import("@/features/infrastructure/pages/HostDetailPage"));

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
    return createRoute({
      getParentRoute: () => mainLayoutRoute,
      path: toNestedRoutePath(path),
      loader: () => {
        throw redirect({ to: fallbackPath, replace: true });
      },
    });
  }
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
  });
}

const protectedExplorerRoutes = getExplorerRoutes().map((route) =>
  createProtected(route.path, route.page)
);

const overviewRoute = createProtected(ROUTES.overview, OverviewHubPage);
const infrastructureRoute = createProtected(ROUTES.infrastructure, InfrastructureHubPage);
const serviceRoute = createProtected(ROUTES.service, ServiceHubPage);
const serviceDetailRoute = createProtected(ROUTES.serviceDetail, ServicePage);
const databaseQueriesRoute = createProtected(
  ROUTES.saturationDatabaseQueries,
  DatabaseQueriesPage
);
const kafkaOverviewRoute = createProtected(ROUTES.saturationKafkaOverview, KafkaOverviewPage);
const errorTrackingRoute = createProtected(ROUTES.errors, ErrorTrackingPage);
const errorGroupDetailRoute = createProtected(ROUTES.errorGroupDetail, ErrorGroupDetailPage);
const sloListRoute = createProtected(ROUTES.slos, SloListPage);
const sloDetailRoute = createProtected(ROUTES.sloDetail, SloDetailPage);
const servicesCatalogRoute = createProtected(ROUTES.services, ServiceCatalogPage);
const serviceMapRoute = createProtected(ROUTES.serviceMap, ServiceMapPage);
const deploymentsRoute = createProtected(ROUTES.deployments, DeploymentsPage);
const hostsRoute = createProtected(ROUTES.hosts, HostMapPage);
const hostDetailRoute = createProtected(ROUTES.hostDetail, HostDetailPage);

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
    serviceRoute,
    serviceDetailRoute,
    databaseQueriesRoute,
    kafkaOverviewRoute,
    errorTrackingRoute,
    errorGroupDetailRoute,
    sloListRoute,
    sloDetailRoute,
    servicesCatalogRoute,
    serviceMapRoute,
    deploymentsRoute,
    hostsRoute,
    hostDetailRoute,
    logsPatternsRedirect,
    logsTransactionsRedirect,
    ...buildLegacyRedirects(mainLayoutRoute),
    layoutFallback,
  ]),
  globalFallback,
]);

export const router = createRouter({ routeTree });
