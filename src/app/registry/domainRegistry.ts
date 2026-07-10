import { dashboardsConfig } from "@/features/dashboards";
import { infrastructureConfig } from "@/features/infrastructure";
import { ingestionConfig } from "@/features/ingestion";
import { llmConfig } from "@/features/llm";
import { logsConfig } from "@/features/logs";
import { metricsConfig } from "@/features/metrics";
import { monitorsConfig } from "@/features/monitors";
import { overviewConfig } from "@/features/overview";
import { saturationConfig } from "@/features/saturation";
import { settingsConfig } from "@/features/settings";
import { tracesConfig } from "@/features/traces";

import type { AppRoutePath } from "@/shared/constants/routes";
import type { DashboardPanelRegistration } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, LazyExoticComponent } from "react";

interface DashboardAdapterPageProps {
  readonly pathParams?: Record<string, string>;
}

type DomainPage =
  | ComponentType<DashboardAdapterPageProps>
  | LazyExoticComponent<ComponentType<DashboardAdapterPageProps>>;

export interface DomainNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly group: string;
}

interface DomainRouteConfig {
  readonly path: AppRoutePath;
  readonly page: DomainPage;
}

interface DashboardPageAdapterConfig {
  readonly pageId: string;
  readonly page: DomainPage;
}

export interface DomainConfig {
  readonly key: string;
  readonly label: string;
  readonly permissions: readonly string[];
  readonly navigation: readonly DomainNavigationItem[];
  readonly routes?: readonly DomainRouteConfig[];
  readonly dashboardPages?: readonly DashboardPageAdapterConfig[];
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
  ingestionConfig,
  monitorsConfig,
  dashboardsConfig,

  settingsConfig,
] as const;

export function getDomainNavigationItems(): readonly DomainNavigationItem[] {
  return domainRegistry.flatMap((domain) => domain.navigation);
}

export function getDashboardPanelRegistrations(): readonly DashboardPanelRegistration[] {
  return domainRegistry.flatMap((domain) => domain.dashboardPanels ?? []);
}
