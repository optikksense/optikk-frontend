import { Navigate, useLocation, useParams } from "@tanstack/react-router";

import type { DashboardDrawerEntity } from "@/types/dashboardConfig";

import { buildLegacyDashboardDrawerSearch } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";

interface LegacyDashboardDetailRedirectProps {
  parentPath: string;
  drawerEntity: DashboardDrawerEntity;
  paramKey: string;
  tab?: string;
}

export default function LegacyDashboardDetailRedirect({
  parentPath,
  drawerEntity,
  paramKey,
  tab,
}: LegacyDashboardDetailRedirectProps): JSX.Element {
  const location = useLocation();
  const params = useParams({ strict: false });

  const rawValue = params[paramKey] ?? "";
  const nextSearchParams = new URLSearchParams(location.search);
  if (tab) {
    nextSearchParams.set("tab", tab);
  }
  const currentSearch = nextSearchParams.toString();

  const search = rawValue
    ? buildLegacyDashboardDrawerSearch(
        currentSearch ? `?${currentSearch}` : "",
        drawerEntity,
        rawValue,
        rawValue
      )
    : currentSearch
      ? `?${currentSearch}`
      : "";

  return <Navigate to={parentPath + search} replace />;
}
