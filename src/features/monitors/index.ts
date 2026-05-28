import { Bell } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

// Routes are wired directly in app/routes/router.tsx because they need
// lazy-loaded ProtectedRoute treatment. The domain entry exists so the global
// nav surfaces a top-level "Monitors" link in the observe group.
export const monitorsConfig: DomainConfig = {
  key: "monitors",
  label: "Monitors",
  permissions: ["monitors:read"],
  navigation: [
    {
      path: ROUTES.monitors,
      label: "Monitors",
      icon: Bell,
      group: "operate",
    },
  ],
  routes: [],
};
