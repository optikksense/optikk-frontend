import { useCallback } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";

export const SERVICE_TAB_IDS = [
  "overview",
  "endpoints",
  "traces",
  "errors",
  "infra",
  "deploys",
  "logs",
  "code",
] as const;

export type ServiceTabId = (typeof SERVICE_TAB_IDS)[number];

const DEFAULT_TAB: ServiceTabId = "overview";

function normalizeTab(value: string | null | undefined): ServiceTabId {
  if (!value) return DEFAULT_TAB;
  return (SERVICE_TAB_IDS as readonly string[]).includes(value)
    ? (value as ServiceTabId)
    : DEFAULT_TAB;
}

export function useActiveServiceTab(): {
  tab: ServiceTabId;
  setTab: (next: ServiceTabId) => void;
} {
  const [params, setParams] = useSearchParams();
  const tab = normalizeTab(params.get("tab"));
  const setTab = useCallback(
    (next: ServiceTabId) => {
      const updated = new URLSearchParams(params);
      if (next === DEFAULT_TAB) updated.delete("tab");
      else updated.set("tab", next);
      setParams(updated);
    },
    [params, setParams]
  );
  return { tab, setTab };
}
