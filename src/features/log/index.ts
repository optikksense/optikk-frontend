import { FileText } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const LogsPage = lazy(() =>
  import('./pages/LogsHubPage').then((module) => ({ default: module.default })),
);
const LogHistogramRenderer = lazy(() =>
  import('./dashboard/renderers/LogHistogramRenderer').then((module) => ({ default: module.LogHistogramRenderer })),
);

export /**
 *
 */
const logsConfig: DomainConfig = {
  key: 'logs',
  label: 'Logs',
  permissions: ['logs:read'],
  navigation: [
    {
      path: ROUTES.logs,
      label: 'Logs',
      icon: FileText,
      group: 'observe',
    },
  ],
  routes: [{ path: ROUTES.logs, page: LogsPage }],
  dashboardPanels: [
    { panelType: 'log-histogram', kind: 'specialized', component: LogHistogramRenderer },
  ],
};
