import { useCallback } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";

export const SERVICE_HUB_TABS = ["catalog", "map", "slos", "deploys"] as const;

export type ServiceHubTab = (typeof SERVICE_HUB_TABS)[number];

const DEFAULT_TAB: ServiceHubTab = "catalog";

function normalize(value: string | null | undefined): ServiceHubTab {
  if (!value) return DEFAULT_TAB;
  return (SERVICE_HUB_TABS as readonly string[]).includes(value)
    ? (value as ServiceHubTab)
    : DEFAULT_TAB;
}

export function useServiceHubTab(): {
  tab: ServiceHubTab;
  setTab: (next: ServiceHubTab) => void;
} {
  const [params, setParams] = useSearchParams();
  const tab = normalize(params.get("tab"));
  const setTab = useCallback(
    (next: ServiceHubTab) => {
      const updated = new URLSearchParams(params);
      if (next === DEFAULT_TAB) updated.delete("tab");
      else updated.set("tab", next);
      setParams(updated);
    },
    [params, setParams]
  );
  return { tab, setTab };
}
