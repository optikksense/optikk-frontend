
import { aiConfig } from '@/features/ai';
import { infrastructureConfig } from '@/features/infrastructure';
import { logsConfig } from '@/features/log';
import { metricsConfig } from '@/features/metrics';
import { overviewConfig } from '@/features/overview';
import { servicesConfig } from '@/features/services';
import { settingsConfig } from '@/features/settings';
import { tracesConfig } from '@/features/traces';

import type { LucideIcon } from 'lucide-react';
import type { ComponentType, LazyExoticComponent } from 'react';

/**
 *
 */
type DomainPage =
  | ComponentType<any>
  | LazyExoticComponent<ComponentType<any>>;


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
  readonly path: string;
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
