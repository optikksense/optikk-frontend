import { aiConfig } from '@/features/ai';
import { infrastructureConfig } from '@/features/infrastructure';
import { logsConfig } from '@/features/log';
import { metricsConfig } from '@/features/metrics';
import { overviewConfig } from '@/features/overview';
import { servicesConfig } from '@/features/services';
import { settingsConfig } from '@/features/settings';
import { tracesConfig } from '@/features/traces';
import { matchPath } from 'react-router-dom';

import type { LucideIcon } from 'lucide-react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { AppRoutePath } from '@/shared/constants/routes';
import type { DashboardPanelRegistration } from '@shared/components/ui/dashboard/dashboardPanelRegistry';

/**
 *
 */
type DomainPage =
  | ComponentType<object>
  | LazyExoticComponent<ComponentType<object>>;

/**
 *
 */
export interface DomainNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly group: string;
}

/**
 *
 */
export interface DomainRouteConfig {
  readonly path: AppRoutePath;
  readonly page: DomainPage;
}

export interface DashboardPageAdapterConfig {
  readonly pageId: string;
  readonly page: DomainPage;
}

/**
 *
 */
export interface DomainConfig {
  readonly key: string;
  readonly label: string;
  readonly permissions: readonly string[];
  readonly navigation: readonly DomainNavigationItem[];
  readonly routes: readonly DomainRouteConfig[];
  readonly dashboardPages?: readonly DashboardPageAdapterConfig[];
  readonly dashboardPanels?: readonly DashboardPanelRegistration[];
}

export /**
 *
 */
const domainRegistry: readonly DomainConfig[] = [
  overviewConfig,
  metricsConfig,
  logsConfig,
  tracesConfig,
  servicesConfig,
  infrastructureConfig,
  aiConfig,
  settingsConfig,
] as const;

export interface RegisteredDomainRoute extends DomainRouteConfig {
  readonly domainKey: string;
  readonly label: string;
  readonly permissions: readonly string[];
}

export interface RegisteredDashboardPageAdapter extends DashboardPageAdapterConfig {
  readonly domainKey: string;
  readonly label: string;
  readonly permissions: readonly string[];
}

export function getDomainNavigationItems(): readonly DomainNavigationItem[] {
  return domainRegistry.flatMap((domain) => domain.navigation);
}

export function getExplorerRoutes(): readonly RegisteredDomainRoute[] {
  return domainRegistry.flatMap((domain) =>
    domain.routes.map((route) => ({
      ...route,
      domainKey: domain.key,
      label: domain.label,
      permissions: domain.permissions,
    })),
  );
}

export function resolveRegisteredExplorerRoute(
  pathname: string,
): RegisteredDomainRoute | null {
  return (
    getExplorerRoutes().find((route) =>
      matchPath({ path: route.path, end: true }, pathname),
    ) ?? null
  );
}

export function getDashboardPageAdapters(): readonly RegisteredDashboardPageAdapter[] {
  return domainRegistry.flatMap((domain) =>
    (domain.dashboardPages ?? []).map((pageAdapter) => ({
      ...pageAdapter,
      domainKey: domain.key,
      label: domain.label,
      permissions: domain.permissions,
    })),
  );
}

export function resolveDashboardPageAdapter(
  pageId: string,
): RegisteredDashboardPageAdapter | null {
  return getDashboardPageAdapters().find((entry) => entry.pageId === pageId) ?? null;
}

export function getDashboardPanelRegistrations(): readonly DashboardPanelRegistration[] {
  return domainRegistry.flatMap((domain) => domain.dashboardPanels ?? []);
}
