import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

export const SETTINGS_TABS = ["profile", "tenant", "instrumentation", "members"] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

const DEFAULT_TAB: SettingsTab = "profile";

function normalize(value: string | null | undefined): SettingsTab {
  if (!value) return DEFAULT_TAB;
  return (SETTINGS_TABS as readonly string[]).includes(value)
    ? (value as SettingsTab)
    : DEFAULT_TAB;
}

export function useSettingsTab(): {
  tab: SettingsTab;
  setTab: (next: SettingsTab) => void;
} {
  const search = useSearch({ from: "/_app/settings" });
  const navigate = useNavigate();
  const tab = normalize(search.tab);
  const setTab = useCallback(
    (next: SettingsTab) => {
      navigate({
        to: "/settings",
        search: (prev) => ({ ...prev, tab: next === DEFAULT_TAB ? undefined : next }),
      });
    },
    [navigate]
  );
  return { tab, setTab };
}
