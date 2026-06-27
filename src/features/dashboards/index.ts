import { LayoutGrid } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

// Routes are wired directly in app/routes/router.tsx for lazy ProtectedRoute
// treatment. This domain entry surfaces the top-level "Dashboards" nav link.
export const dashboardsConfig: DomainConfig = {
  key: "dashboards",
  label: "Dashboards",
  permissions: ["dashboards:read"],
  navigation: [
    {
      path: ROUTES.dashboards,
      label: "Dashboards",
      icon: LayoutGrid,
      group: "observe",
    },
  ],
  routes: [],
};
