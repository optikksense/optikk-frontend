import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { useAppStore } from "@app/store/appStore";

import {
  buildServiceLogsSearch,
  buildServiceTracesSearch,
} from "../../serviceDrawerState";

export function useOpenSurface(serviceName: string | undefined) {
  const navigate = useNavigate();
  const location = useLocation();
  const setCustomTimeRange = useAppStore((state) => state.setCustomTimeRange);

  return useCallback(
    (target: "logs" | "traces", startMs: number, endMs: number) => {
      if (!serviceName) return;
      setCustomTimeRange(startMs, endMs, "Deployment comparison");
      navigate(
        dynamicNavigateOptions(
          target === "logs" ? ROUTES.logs : ROUTES.traces,
          target === "logs"
            ? buildServiceLogsSearch(location.search, serviceName)
            : buildServiceTracesSearch(location.search, serviceName)
        )
      );
    },
    [location.search, navigate, serviceName, setCustomTimeRange]
  );
}
