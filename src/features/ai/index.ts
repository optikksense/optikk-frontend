import { Brain, Play } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const AiPage = lazy(() =>
  import('./pages/AiObservabilityPage').then((module) => ({ default: module.default })),
);

const AiRunsPage = lazy(() =>
  import('./pages/AiRunsExplorerPage').then((module) => ({ default: module.default })),
);

const AiRunDetailPage = lazy(() =>
  import('./pages/AiRunDetailPage').then((module) => ({ default: module.default })),
);

export const aiConfig: DomainConfig = {
  key: 'ai',
  label: 'AI Observability',
  permissions: ['ai:read'],
  navigation: [
    {
      path: ROUTES.aiObservability,
      label: 'AI Dashboard',
      icon: Brain,
      group: 'operate',
    },
    {
      path: ROUTES.aiRuns,
      label: 'LLM Runs',
      icon: Play,
      group: 'operate',
    },
  ],
  routes: [
    { path: ROUTES.aiObservability, page: AiPage },
    { path: ROUTES.aiRuns, page: AiRunsPage },
    { path: ROUTES.aiRunDetail, page: AiRunDetailPage },
  ],
};

export { default as AiObservabilityPageView } from './pages/AiObservabilityPage';
export * from './components';
export * from './types';
