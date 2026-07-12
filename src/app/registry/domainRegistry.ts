import { cloudConfig } from "@/features/cloud";
import { dashboardsConfig } from "@/features/dashboards";
import { infrastructureConfig } from "@/features/infrastructure";
import { llmConfig } from "@/features/llm";
import { logsConfig } from "@/features/logs";
import { metricsConfig } from "@/features/metrics";
import { monitorsConfig } from "@/features/monitors";
import { overviewConfig } from "@/features/overview";
import { saturationConfig } from "@/features/saturation";
import { tracesConfig } from "@/features/traces";

import type { DashboardPanelRegistration } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import type { LucideIcon } from "lucide-react";

export interface DomainNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly group: string;
}

// Routing is file-based (src/routes/); this registry only feeds
// sidebar navigation and dashboard panel registration.
export interface DomainConfig {
  readonly key: string;
  readonly label: string;
  readonly navigation: readonly DomainNavigationItem[];
  readonly dashboardPanels?: readonly DashboardPanelRegistration[];
}

const domainRegistry: readonly DomainConfig[] = [
  overviewConfig,
  saturationConfig,
  metricsConfig,
  logsConfig,
  tracesConfig,
  llmConfig,
  infrastructureConfig,
  cloudConfig,
  monitorsConfig,
  dashboardsConfig,
] as const;

export function getDomainNavigationItems(): readonly DomainNavigationItem[] {
  return domainRegistry.flatMap((domain) => domain.navigation);
}

export function getDashboardPanelRegistrations(): readonly DashboardPanelRegistration[] {
  return domainRegistry.flatMap((domain) => domain.dashboardPanels ?? []);
}
