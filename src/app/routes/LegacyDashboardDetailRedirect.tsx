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
  
  const searchObj: Record<string, string> = {};
  for (const [k, v] of Object.entries(location.search)) {
    if (v != null) searchObj[k] = String(v);
  }
  const nextSearchParams = new URLSearchParams(searchObj);
  
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
