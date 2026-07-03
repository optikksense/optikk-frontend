import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Suspense, lazy } from "react";

import { getExplorerRoutes } from "@/app/registry/domainRegistry";
import { FeatureErrorBoundary, Loading } from "@/shared/components/ui/feedback";
import { ROUTES } from "@/shared/constants/routes";

import { session } from "@shared/api/auth/session";

import { AppContent } from "../App";
import MainLayout from "../layout/MainLayout";
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
const SaturationDatabaseDetailPage = lazy(
  () =>
    import("@/features/saturation/pages/SaturationDatabaseDetailPage/SaturationDatabaseDetailPage")
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
const DashboardsPage = lazy(
  () => import("@/features/dashboards/pages/DashboardsPage/DashboardsPage")
);
const DashboardDetailPage = lazy(
  () => import("@/features/dashboards/pages/DashboardDetailPage/DashboardDetailPage")
);
const WelcomePage = lazy(() => import("@/features/onboarding/pages/WelcomePage/WelcomePage"));

export const rootRoute = createRootRoute({ component: AppContent });

// Auth gate for every protected route. Runs before render so an unrecoverable
// session redirects to /login instead of leaving the shell blank.
const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main-layout",
  beforeLoad: async ({ location }) => {
    if (!(await session.ensureSession())) {
      throw redirect({
        to: ROUTES.login,
        search: { redirect: location.href },
        replace: true,
      });
    }
  },
  component: MainLayout,
});

// Post-signup wizard. Authed like the app, but full-screen (no MainLayout shell).
const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.welcome.replace(/^\//, ""),
  beforeLoad: async ({ location }) => {
    if (!(await session.ensureSession())) {
      throw redirect({ to: ROUTES.login, search: { redirect: location.href }, replace: true });
    }
  },
  component: () => (
    <FeatureErrorBoundary featureName="route:welcome">
      <Suspense fallback={<Loading fullscreen />}>
        <WelcomePage />
      </Suspense>
    </FeatureErrorBoundary>
  ),
});

function toNestedRoutePath(path: string): string {
  if (!path || path === ROUTES.home) return "";
  return path.startsWith("/") ? path.slice(1) : path;
}

function createProtected(path: string, PageComponent: ComponentType<any>, fallbackPath?: string) {
  if (fallbackPath) {
    return createRoute({
      getParentRoute: () => mainLayoutRoute,
      path: toNestedRoutePath(path),
      loader: () => {
        throw redirect({ to: fallbackPath, replace: true });
      },
    }) as any;
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
const saturationDatabaseDetailRoute = createProtected(
  ROUTES.saturationDatabaseDetail,
  SaturationDatabaseDetailPage
);
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
const hostDetailRoute = createProtected(ROUTES.hostDetail, HostDetailPage);
const containerDetailRoute = createProtected(ROUTES.containerDetail, ContainerDetailPage);

const monitorsRoute = createProtected(ROUTES.monitors, MonitorsPage);
const monitorsNotificationsRoute = createProtected(ROUTES.monitorsNotifications, NotificationsPage);
const monitorsNewRoute = createProtected(ROUTES.monitorsNew, NewMonitorPage);
const monitorDetailRoute = createProtected(ROUTES.monitorDetail, MonitorDetailPage);
const monitorEditRoute = createProtected(ROUTES.monitorEdit, NewMonitorPage);
const alertsNewRedirect = createProtected(ROUTES.alertsNew, () => null, ROUTES.monitorsNew);

const dashboardsRoute = createProtected(ROUTES.dashboards, DashboardsPage);
const dashboardDetailRoute = createProtected(ROUTES.dashboardDetail, DashboardDetailPage);

const logsPatternsRedirect = createProtected("/logs/patterns", () => null, ROUTES.logs);
const logsTransactionsRedirect = createProtected("/logs/transactions", () => null, ROUTES.logs);


const { marketingTree, productRedirectRoute, loginRoute, signupRoute } = buildMarketingRoutes(
  () => rootRoute
);

const routeTree = rootRoute.addChildren([
  marketingTree,
  productRedirectRoute,
  loginRoute,
  signupRoute,
  welcomeRoute,
  mainLayoutRoute.addChildren([
    ...protectedExplorerRoutes,
    overviewRoute,
    infrastructureRoute,
    serviceDetailRoute,
    kafkaOverviewRoute,
    saturationDatabaseRoute,
    saturationDatabaseDetailRoute,
    saturationDatabaseQueryRoute,
    errorTrackingRoute,
    errorGroupDetailRoute,
    servicesCatalogRoute,
    serviceMapRoute,
    hostDetailRoute,
    containerDetailRoute,
    monitorsRoute,
    monitorsNotificationsRoute,
    monitorsNewRoute,
    monitorDetailRoute,
    monitorEditRoute,
    alertsNewRedirect,
    dashboardsRoute,
    dashboardDetailRoute,
    logsPatternsRedirect,
    logsTransactionsRedirect,
    ...buildLegacyRedirects(mainLayoutRoute),
  ]),
]);

export const router = createRouter({ routeTree });
