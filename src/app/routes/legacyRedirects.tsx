import { Navigate, createRoute, redirect, useParams } from "@tanstack/react-router";
import type { RootRoute } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import type { DashboardDrawerEntity } from "@/shared/types/dashboardConfig";
import { dynamicTo } from "@/shared/utils/navigation";

import LegacyDashboardDetailRedirect from "./LegacyDashboardDetailRedirect";

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
    // biome-ignore lint/suspicious/noExplicitAny: tanstack router parent type chain is heterogeneous
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

// biome-ignore lint/suspicious/noExplicitAny: tanstack router heterogeneous parent
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
      component: LegacySaturationRedisRedirect,
    }),
  ];
}
