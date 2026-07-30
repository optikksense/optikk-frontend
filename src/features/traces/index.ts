import { GitBranch } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const tracesConfig: DomainConfig = {
  key: "traces",
  label: "Traces",
  navigation: [{ path: ROUTES.traces, label: "Traces", icon: GitBranch, group: "apm" }],
};
