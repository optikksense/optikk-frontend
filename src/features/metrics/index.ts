import { BarChart3, Gauge } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const MetricsPage = lazy(() =>
  import('./pages/MetricsPage').then((module) => ({ default: module.default })),
);
const SaturationHubPage = lazy(() =>
  import('./pages/SaturationHubPage').then((module) => ({ default: module.default })),
);
const KafkaTopicDetailPage = lazy(() =>
  import('./pages/KafkaTopicDetailPage').then((module) => ({ default: module.default })),
);
const KafkaGroupDetailPage = lazy(() =>
  import('./pages/KafkaGroupDetailPage').then((module) => ({ default: module.default })),
);
const LatencyHistogramRenderer = lazy(() =>
  import('./dashboard/renderers/LatencyHistogramRenderer').then((module) => ({ default: module.LatencyHistogramRenderer })),
);
const LatencyHeatmapRenderer = lazy(() =>
  import('./dashboard/renderers/LatencyHeatmapRenderer').then((module) => ({ default: module.LatencyHeatmapRenderer })),
);
const DbSystemsRenderer = lazy(() =>
  import('./dashboard/renderers/DbSystemsRenderer').then((module) => ({ default: module.DbSystemsRenderer })),
);

export /**
 *
 */
const metricsConfig: DomainConfig = {
  key: 'metrics',
  label: 'Metrics',
  permissions: ['metrics:read'],
  navigation: [
    {
      path: ROUTES.metrics,
      label: 'Metrics',
      icon: BarChart3,
      group: 'observe',
    },
    {
      path: ROUTES.saturation,
      label: 'Saturation',
      icon: Gauge,
      group: 'operate',
    },
  ],
  routes: [
  ],
  dashboardPages: [
    { pageId: 'metrics', page: MetricsPage },
    { pageId: 'saturation', page: SaturationHubPage },
    { pageId: 'kafka-topic-detail', page: KafkaTopicDetailPage },
    { pageId: 'kafka-group-detail', page: KafkaGroupDetailPage },
  ],
  dashboardPanels: [
    { panelType: 'latency-histogram', kind: 'specialized', component: LatencyHistogramRenderer },
    { panelType: 'latency-heatmap', kind: 'specialized', component: LatencyHeatmapRenderer },
    { panelType: 'db-systems-overview', kind: 'specialized', component: DbSystemsRenderer },
  ],
};
export * from './components';
export * from './utils';
export * from './types';
