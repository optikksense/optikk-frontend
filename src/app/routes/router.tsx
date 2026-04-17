import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useParams,
} from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { Suspense, lazy } from "react";

import { getExplorerRoutes } from "@/app/registry/domainRegistry";
import { buildLegacyServicePagePath } from "@/features/overview/components/serviceDrawerState";
import { FeatureErrorBoundary, Loading } from "@/shared/components/ui/feedback";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicTo } from "@/shared/utils/navigation";

import type { DashboardDrawerEntity } from "@/shared/types/dashboardConfig";

import { AppContent } from "../App";
import MainLayout from "../layout/MainLayout";
import LegacyDashboardDetailRedirect from "./LegacyDashboardDetailRedirect";
import ProtectedRoute from "./ProtectedRoute";

const LoginPage = lazy(() => import("@/app/auth"));
const MarketingLayout = lazy(() => import("@/features/marketing/MarketingLayout"));
const MarketingShellLazy = lazy(() =>
  import("@/features/marketing/MarketingShell").then((m) => ({ default: m.MarketingShell }))
);
const MetricsPage = lazy(() => import("@/features/metrics/pages/MetricsExplorerPage"));
const ServiceHubPage = lazy(() => import("@/features/overview/pages/ServiceHubPage"));
const InfrastructureHubPage = lazy(
  () => import("@/features/infrastructure/pages/InfrastructureHubPage")
);
const OverviewHubPage = lazy(
  () => import("@/features/overview/pages/OverviewHubPage/OverviewHubPage")
);
function LegacyServicePathRedirect() {
  const params = useParams({ strict: false });
  const serviceName = typeof params.serviceName === "string" ? params.serviceName : "";
  return (
    <Navigate to={serviceName ? buildLegacyServicePagePath(serviceName) : ROUTES.service} replace />
  );
}

function LegacySaturationDatabaseRedirect() {
  const params = useParams({ strict: false });
  const dbSystem = typeof params.dbSystem === "string" ? params.dbSystem : "";
  return (
    <Navigate
      to={dynamicTo(
        ROUTES.saturationDatastoreDetail.replace(
          "$system",
          encodeURIComponent(dbSystem || "unknown")
        )
      )}
      replace
    />
  );
}

function LegacySaturationRedisRedirect() {
  const params = useParams({ strict: false });
  const instance = typeof params.instance === "string" ? params.instance : "";
  return (
    <Navigate
      to={dynamicTo(ROUTES.saturationDatastoreDetail.replace("$system", "redis"))}
      search={instance ? ({ instance } as Record<string, unknown>) : undefined}
      replace
    />
  );
}

function PageTransition({ children }: { children: ReactNode }) {
  return <div style={{ width: "100%", height: "100%" }}>{children}</div>;
}

export const rootRoute = createRootRoute({
  component: AppContent,
});

const marketingLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "marketing-layout",
  component: () => (
    <Suspense fallback={<Loading fullscreen />}>
      <MarketingLayout />
    </Suspense>
  ),
});

function marketingChild(path: string) {
  const normalized = path === ROUTES.home ? "/" : path.replace(/^\//, "");
  return createRoute({
    getParentRoute: () => marketingLayoutRoute,
    path: normalized,
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <MarketingShellLazy path={path} />
        </PageTransition>
      </Suspense>
    ),
  });
}

const marketingRoutesGroup = [
  marketingChild(ROUTES.home),
  marketingChild(ROUTES.features),
  marketingChild(ROUTES.pricing),
  marketingChild(ROUTES.opentelemetry),
  marketingChild(ROUTES.selfHost),
  marketingChild(ROUTES.architecture),
];

const productRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "product",
  loader: () => {
    throw redirect({ to: ROUTES.pricing, replace: true });
  },
});

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
// Redirects
const logsPatternsRedirect = createProtected("/logs/patterns", () => null, ROUTES.logs);
const logsTransactionsRedirect = createProtected("/logs/transactions", () => null, ROUTES.logs);
const errorsRedirect = createProtected("/errors", () => null, `${ROUTES.overview}?tab=errors`);
const aiLegacyRedirect = createProtected("/ai", () => null, ROUTES.llmOverview);
const llmRootRedirect = createProtected("/llm", () => null, ROUTES.llmOverview);

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
        drawerEntity={drawerEntity as DashboardDrawerEntity}
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
];

const serviceOpsRedirect = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "services/$serviceName/operations/$operationName",
  loader: () => {
    throw redirect({ to: ROUTES.metrics, replace: true });
  },
});

const legacySaturationDatabaseRedirect = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "saturation/database/$dbSystem",
  component: LegacySaturationDatabaseRedirect,
});

const legacySaturationRedisRedirect = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "saturation/redis/$instance",
  component: LegacySaturationRedisRedirect,
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
  marketingLayoutRoute.addChildren(marketingRoutesGroup),
  productRedirectRoute,
  loginRoute,
  mainLayoutRoute.addChildren([
    ...protectedExplorerRoutes,
    overviewRoute,
    infrastructureRoute,
    serviceRoute,
    logsPatternsRedirect,
    logsTransactionsRedirect,
    errorsRedirect,
    aiLegacyRedirect,
    llmRootRedirect,
    ...legacyRedirects,
    legacySaturationDatabaseRedirect,
    legacySaturationRedisRedirect,
    serviceOpsRedirect,
    legacyServicePathRedirect,
    layoutFallback,
  ]),
  globalFallback,
]);

export const router = createRouter({ routeTree });
