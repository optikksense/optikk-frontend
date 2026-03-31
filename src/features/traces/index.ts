import { GitBranch } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const TracesPage = lazy(() =>
  import('./pages/TracesPage').then((module) => ({ default: module.default }))
);
const TraceDetailPage = lazy(() =>
  import('./pages/TraceDetailPage').then((module) => ({ default: module.default }))
);
const TraceWaterfallRenderer = lazy(() =>
  import('./dashboard/renderers/TraceWaterfallRenderer').then((module) => ({
    default: module.TraceWaterfallRenderer,
  }))
);
const TraceComparisonPage = lazy(() =>
  import('./pages/TraceComparisonPage').then((module) => ({ default: module.default }))
);

export /**
 *
 */
const tracesConfig: DomainConfig = {
  key: 'traces',
  label: 'Traces',
  permissions: ['traces:read'],
  navigation: [
    {
      path: ROUTES.traces,
      label: 'Traces',
      icon: GitBranch,
      group: 'observe',
    },
  ],
  routes: [
    { path: ROUTES.traces, page: TracesPage },
    { path: ROUTES.traceDetail, page: TraceDetailPage },
    { path: ROUTES.traceCompare, page: TraceComparisonPage },
  ],
  dashboardPanels: [
    { panelType: 'trace-waterfall', kind: 'specialized', component: TraceWaterfallRenderer },
  ],
};
export * from './components';
export type { ServiceBadge, TraceRecord } from './types';
