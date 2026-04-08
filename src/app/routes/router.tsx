import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useParams,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { getExplorerRoutes } from "@/app/registry/domainRegistry";
import { buildLegacyServicePagePath } from "@/features/overview/components/serviceDrawerState";
import { FeatureErrorBoundary, Loading } from "@/shared/components/ui/feedback";
import { ROUTES } from "@/shared/constants/routes";

import { AppContent } from "../App";
import MainLayout from "../layout/MainLayout";
import BackendDrivenPage from "./BackendDrivenPage";
import LegacyDashboardDetailRedirect from "./LegacyDashboardDetailRedirect";
import ProtectedRoute from "./ProtectedRoute";

const LoginPage = lazy(() => import("@/app/auth"));
const ProductPage = lazy(() => import("@/app/auth/pages/Pricing"));
const MetricsPage = lazy(() => import("@/features/metrics/pages/MetricsExplorerPage"));
const ServiceHubPage = lazy(() => import("@/features/overview/pages/ServiceHubPage"));

function LegacyServicePathRedirect() {
  const params = useParams({ strict: false });
  const serviceName = typeof params.serviceName === "string" ? params.serviceName : "";
  return (
    <Navigate to={serviceName ? buildLegacyServicePagePath(serviceName) : ROUTES.service} replace />
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return <div style={{ width: "100%", height: "100%" }}>{children}</div>;
}

export const rootRoute = createRootRoute({
  component: AppContent,
});

// Marketing Pages
const marketingPaths = [
  ROUTES.home,
  ROUTES.product,
  ROUTES.pricing,
  ROUTES.opentelemetry,
  ROUTES.selfHost,
];
const marketingRoutes = marketingPaths.map((path) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`,
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <ProductPage />
        </PageTransition>
      </Suspense>
    ),
  })
);

// Login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.login,
  component: () => (
    <Suspense fallback={<Loading fullscreen />}>
      <PageTransition>
        <LoginPage />
      </PageTransition>
    </Suspense>
  ),
});

// Authed Layout
const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main-layout",
  component: () => (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  ),
});

// Helper for dynamic paths
function toNestedRoutePath(path: string): string {
  if (!path || path === ROUTES.home) return "";
  return path.startsWith("/") ? path.slice(1) : path;
}

// Protected Routes mapped under mainLayoutRoute
function createProtected(
  path: string,
  PageComponent: React.ComponentType<any>,
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
      <FeatureErrorBoundary
        featureName={`route:${path}`}
        onError={(err, feature) => {
          console.log(`[Telemetry Push] ${feature} failed:`, err);
        }}
      >
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

const overviewRoute = createProtected(ROUTES.overview, BackendDrivenPage);
const saturationRoute = createProtected(ROUTES.saturation, BackendDrivenPage);
const infrastructureRoute = createProtected(ROUTES.infrastructure, BackendDrivenPage);
const serviceRoute = createProtected(ROUTES.service, ServiceHubPage);
const aiObservabilityRoute = createProtected(ROUTES.aiObservability, BackendDrivenPage);

// Redirects
const logsPatternsRedirect = createProtected("/logs/patterns", () => null, ROUTES.logs);
const logsTransactionsRedirect = createProtected("/logs/transactions", () => null, ROUTES.logs);
const errorsRedirect = createProtected("/errors", () => null, `${ROUTES.overview}?tab=errors`);

// Legacy dashboard detail redirects
function createLegacyDetailRedirect(
  path: string,
  parentPath: string,
  drawerEntity: string,
  paramKey: string,
  tab?: string
) {
  return createRoute({
    getParentRoute: () => mainLayoutRoute,
    path: toNestedRoutePath(path),
    component: () => (
      <LegacyDashboardDetailRedirect
        parentPath={parentPath}
        drawerEntity={drawerEntity as any}
        paramKey={paramKey}
        tab={tab}
      />
    ),
  });
}

const legacyRedirects = [
  createLegacyDetailRedirect(
    "/errors/$errorGroupId",
    ROUTES.overview,
    "errorGroup",
    "errorGroupId",
    "errors"
  ),
  createLegacyDetailRedirect(
    "/infrastructure/nodes/$host",
    ROUTES.infrastructure,
    "node",
    "host",
    "nodes"
  ),
  createLegacyDetailRedirect(
    "/saturation/database/$dbSystem",
    ROUTES.saturation,
    "databaseSystem",
    "dbSystem",
    "database"
  ),
  createLegacyDetailRedirect(
    "/saturation/redis/$instance",
    ROUTES.saturation,
    "redisInstance",
    "instance",
    "redis"
  ),
  createLegacyDetailRedirect(
    "/saturation/kafka/topics/$topic",
    ROUTES.saturation,
    "kafkaTopic",
    "topic",
    "queue"
  ),
  createLegacyDetailRedirect(
    "/saturation/kafka/groups/$groupId",
    ROUTES.saturation,
    "kafkaGroup",
    "groupId",
    "queue"
  ),
  createLegacyDetailRedirect(
    "/ai-observability/models/$modelName",
    ROUTES.aiObservability,
    "aiModel",
    "modelName"
  ),
];

const serviceOpsRedirect = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "services/$serviceName/operations/$operationName",
  loader: () => {
    throw redirect({ to: ROUTES.metrics, replace: true });
  },
});

const legacyServicePathRedirect = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "services/$serviceName",
  component: LegacyServicePathRedirect,
});

// Fallbacks
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

const routeTree = rootRoute.addChildren([
  ...marketingRoutes,
  loginRoute,
  mainLayoutRoute.addChildren([
    ...protectedExplorerRoutes,
    overviewRoute,
    saturationRoute,
    infrastructureRoute,
    serviceRoute,
    aiObservabilityRoute,
    logsPatternsRedirect,
    logsTransactionsRedirect,
    errorsRedirect,
    ...legacyRedirects,
    serviceOpsRedirect,
    legacyServicePathRedirect,
    layoutFallback,
  ]),
  globalFallback,
]);

export const router = createRouter({ routeTree });
