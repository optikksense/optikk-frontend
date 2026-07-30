import { cloudConfig } from "@/features/cloud";
import { dashboardsConfig } from "@/features/dashboards";
import { deploymentsConfig } from "@/features/deployments";
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
  readonly group: NavGroupKey | "pinned";
}

export interface DomainConfig {
  readonly key: string;
  readonly label: string;
  readonly navigation: readonly DomainNavigationItem[];
}

export const NAV_GROUPS = [
  { key: "apm", label: "APM" },
  { key: "telemetry", label: "Telemetry" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "operate", label: "Operate" },
] as const;

type NavGroupKey = (typeof NAV_GROUPS)[number]["key"];

const domainRegistry: readonly DomainConfig[] = [
  overviewConfig,
  tracesConfig,
  errorsConfig,
  deploymentsConfig,
  metricsConfig,
  logsConfig,
  llmConfig,
  infrastructureConfig,
  cloudConfig,
  saturationConfig,
  monitorsConfig,
  dashboardsConfig,
] as const;

export function getDomainNavigationItems(): readonly DomainNavigationItem[] {
  return domainRegistry.flatMap((domain) => domain.navigation);
}
