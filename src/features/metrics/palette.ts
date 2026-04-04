import { useMetricsStore } from './store/metricsStore';
import { PaletteAction } from '@/app/layout/CommandPalette/types';

export const metricsPaletteActions: PaletteAction[] = [
  {
    id: 'nav.metrics',
    label: 'Go to Metrics',
    keywords: ['metrics', 'dashboard', 'charts'],
    group: 'navigation',
    hotkey: 'g m',
    perform: ({ navigate }) => {
      navigate('/metrics');
    },
  },
  {
    id: 'metrics.toggle-density',
    label: 'Toggle Metrics Density',
    keywords: ['metrics', 'density', 'compact', 'comfortable'],
    group: 'feature',
    perform: () => {
      const store = useMetricsStore.getState();
      store.setChartDensity(store.chartDensity === 'low' ? 'high' : 'low');
    },
  },
];
