import { GitBranch } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const TracesExplorerPage = lazy(() => import("./pages/TracesExplorerPage"));
const TraceDetailPage = lazy(() => import("./pages/TraceDetailPage"));

export const tracesConfig: DomainConfig = {
  key: "traces",
  label: "Traces",
  permissions: ["traces:read"],
  navigation: [
    { path: ROUTES.traces, label: "Traces", icon: GitBranch, group: "observe" },
  ],
  routes: [
    { path: ROUTES.traces, page: TracesExplorerPage },
    { path: ROUTES.traceDetail, page: TraceDetailPage },
  ],
  dashboardPanels: [],
};
