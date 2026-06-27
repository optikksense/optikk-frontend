import { useStandardQuery } from "@/shared/hooks/useStandardQuery";

import {
  type DashboardPageDetail,
  type DashboardPageListResponse,
  type ListDashboardPagesParams,
  getDashboardPage,
  listDashboardPages,
} from "../api/dashboardsApi";

const STALE_MS = 15_000;

export function useDashboardPagesList(params: ListDashboardPagesParams) {
  return useStandardQuery<DashboardPageListResponse>({
    queryKey: ["dashboards", "pages", params],
    queryFn: () => listDashboardPages(params),
    staleTime: STALE_MS,
  });
}

export function useDashboardPageDetail(id: number) {
  return useStandardQuery<DashboardPageDetail>({
    queryKey: ["dashboards", "page", id],
    queryFn: () => getDashboardPage(id),
    staleTime: STALE_MS,
    enabled: id > 0,
  });
}
