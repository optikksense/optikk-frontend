import { Navigate, createRoute, redirect } from "@tanstack/react-router";
import type { RootRoute } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import type { DashboardDrawerEntity } from "@/shared/types/dashboardConfig";

import LegacyDashboardDetailRedirect from "./LegacyDashboardDetailRedirect";

// Legacy per-datastore / per-redis detail URLs now forward to the Database hub
// (the standalone detail pages were removed in the saturation simplification).
function LegacySaturationDatabaseRedirect() {
  return <Navigate to={(ROUTES.saturationDatabase as string & {})} replace />;
}

function toNestedRoutePath(path: string): string {
  if (!path || path === ROUTES.home) return "";
  return path.startsWith("/") ? path.slice(1) : path;
}

function createLegacyDetailRedirect(
  parent: () => RootRoute | ReturnType<typeof createRoute>,
  path: string,
  parentPath: string,
  drawerEntity: string,
  paramKey: string,
  tab?: string
) {
  return createRoute({
    getParentRoute: parent as any,
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

export function buildLegacyRedirects(mainLayoutRoute: any) {
  const parent = () => mainLayoutRoute;
  return [
    createLegacyDetailRedirect(
      parent,
      "/infrastructure/nodes/$host",
      ROUTES.infrastructure,
      "node",
      "host",
      "nodes"
    ),
    createRoute({
      getParentRoute: parent,
      path: "services/$serviceName/operations/$operationName",
      loader: () => {
        throw redirect({ to: ROUTES.metrics, replace: true });
      },
    }),
    createRoute({
      getParentRoute: parent,
      path: "saturation/database/$dbSystem",
      component: LegacySaturationDatabaseRedirect,
    }),
    createRoute({
      getParentRoute: parent,
      path: "saturation/redis/$instance",
      component: LegacySaturationDatabaseRedirect,
    }),
  ];
}
