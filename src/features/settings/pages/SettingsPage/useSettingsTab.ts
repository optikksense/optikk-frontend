import { useCallback } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";

export const SETTINGS_TABS = ["tenant", "members", "ingestion"] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

const DEFAULT_TAB: SettingsTab = "tenant";

function normalize(value: string | null | undefined): SettingsTab {
  if (!value) return DEFAULT_TAB;
  return (SETTINGS_TABS as readonly string[]).includes(value)
    ? (value as SettingsTab)
    : DEFAULT_TAB;
}

/** URL-synced settings tab (`?tab=`), mirroring the services-hub tab pattern. */
export function useSettingsTab(): {
  tab: SettingsTab;
  setTab: (next: SettingsTab) => void;
} {
  const [params, setParams] = useSearchParams();
  const tab = normalize(params.get("tab"));
  const setTab = useCallback(
    (next: SettingsTab) => {
      const updated = new URLSearchParams(params);
      if (next === DEFAULT_TAB) updated.delete("tab");
      else updated.set("tab", next);
      setParams(updated);
    },
    [params, setParams]
  );
  return { tab, setTab };
}
