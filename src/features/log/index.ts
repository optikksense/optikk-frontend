import { FileText } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const LogsHubPage = lazy(() =>
  import('./pages/LogsHubPage').then((module) => ({ default: module.default }))
);
const LogPatternsPage = lazy(() =>
  import('./pages/LogPatternsPage').then((module) => ({ default: module.default }))
);
const LogTransactionsPage = lazy(() =>
  import('./pages/LogTransactionsPage').then((module) => ({ default: module.default }))
);
const LogHistogramRenderer = lazy(() =>
  import('./dashboard/renderers/LogHistogramRenderer').then((module) => ({
    default: module.LogHistogramRenderer,
  }))
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
  routes: [
    { path: ROUTES.logs, page: LogsHubPage },
    { path: ROUTES.logsPatterns, page: LogPatternsPage },
    { path: ROUTES.logsTransactions, page: LogTransactionsPage },
  ],
  dashboardPanels: [
    { panelType: 'log-histogram', kind: 'specialized', component: LogHistogramRenderer },
  ],
};
