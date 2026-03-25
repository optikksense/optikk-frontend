import { Server } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then((module) => ({ default: module.default })),
);
const ServiceDetailPage = lazy(() =>
  import('./pages/ServiceDetailPage').then((module) => ({ default: module.default })),
);
const ServiceMapRenderer = lazy(() =>
  import('./dashboard/renderers/ServiceMapRenderer').then((module) => ({ default: module.ServiceMapRenderer })),
);

export /**
 *
 */
const servicesConfig: DomainConfig = {
  key: 'services',
  label: 'Services',
  permissions: ['services:read'],
  navigation: [
    {
      path: ROUTES.services,
      label: 'Services',
      icon: Server,
      group: 'observe',
    },
  ],
  routes: [],
  dashboardPages: [
    { pageId: 'services', page: ServicesPage },
    { pageId: 'service-detail', page: ServiceDetailPage },
  ],
  dashboardPanels: [
    { panelType: 'service-map', kind: 'specialized', component: ServiceMapRenderer },
  ],
};
export * from './components/detail';
export * from './utils/servicesUtils';
