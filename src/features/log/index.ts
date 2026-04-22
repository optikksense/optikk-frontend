import { FileText } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const LogsExplorerPage = lazy(() => import("./pages/LogsExplorerPage"));

export const logsConfig: DomainConfig = {
  key: "logs",
  label: "Logs",
  permissions: ["logs:read"],
  navigation: [
    { path: ROUTES.logs, label: "Logs", icon: FileText, group: "observe" },
  ],
  routes: [{ path: ROUTES.logs, page: LogsExplorerPage }],
  dashboardPanels: [],
};
