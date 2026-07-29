import { cloudConfig } from "@/features/cloud";
import { dashboardsConfig } from "@/features/dashboards";
import { errorsConfig } from "@/features/errors";
import { infrastructureConfig } from "@/features/infrastructure";
import { llmConfig } from "@/features/llm";
import { logsConfig } from "@/features/logs";
import { metricsConfig } from "@/features/metrics";
import { monitorsConfig } from "@/features/monitors";
import { overviewConfig } from "@/features/overview";
import { saturationConfig } from "@/features/saturation";
import { tracesConfig } from "@/features/traces";

import type { LucideIcon } from "lucide-react";

export interface DomainNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly group: string;
}

export interface DomainConfig {
  readonly key: string;
  readonly label: string;
  readonly navigation: readonly DomainNavigationItem[];
}

const domainRegistry: readonly DomainConfig[] = [
  overviewConfig,
  saturationConfig,
  metricsConfig,
  logsConfig,
  tracesConfig,
  errorsConfig,
  llmConfig,
  infrastructureConfig,
  cloudConfig,
  monitorsConfig,
  dashboardsConfig,
] as const;

export function getDomainNavigationItems(): readonly DomainNavigationItem[] {
  return domainRegistry.flatMap((domain) => domain.navigation);
}
