import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((module) => ({ default: module.default }))
);

export const settingsConfig: DomainConfig = {
  key: "settings",
  label: "Settings",
  permissions: ["settings:read"],
  navigation: [],
  routes: [{ path: ROUTES.settings, page: SettingsPage }],
};
