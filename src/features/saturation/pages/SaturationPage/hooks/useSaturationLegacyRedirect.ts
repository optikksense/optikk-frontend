import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { readDashboardDrawerState } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";

import { resolveLegacySaturationPath } from "../../../components/navigation";

export function useSaturationLegacyRedirect(searchParams: URLSearchParams): void {
  const navigate = useNavigate();
  const drawerState = useMemo(() => readDashboardDrawerState(searchParams), [searchParams]);

  useEffect(() => {
    const legacyTarget = resolveLegacySaturationPath(drawerState.entity, drawerState.id);
    if (!legacyTarget) return;
    navigate({
      ...dynamicNavigateOptions(legacyTarget.to, legacyTarget.search),
      replace: true,
    });
  }, [drawerState.entity, drawerState.id, navigate]);
}
