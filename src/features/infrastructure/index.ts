import { HardDrive } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const InfrastructurePage = lazy(() =>
  import('./pages/InfrastructureHubPage').then((module) => ({ default: module.default })),
);

export /**
 *
 */
const infrastructureConfig: DomainConfig = {
  key: 'infrastructure',
  label: 'Infrastructure',
  permissions: ['infrastructure:read'],
  navigation: [
    {
      path: ROUTES.infrastructure,
      label: 'Infrastructure',
      icon: HardDrive,
      group: 'operate',
    },
  ],
  routes: [{ path: ROUTES.infrastructure, page: InfrastructurePage }],
};

export { default as InfrastructureHubPageView } from './pages/InfrastructureHubPage';
export * from './types';
