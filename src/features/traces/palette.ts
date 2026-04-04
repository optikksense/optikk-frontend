import { useTracesStore } from './store/tracesStore';
import { PaletteAction } from '@/app/layout/CommandPalette/types';

export const tracePaletteActions: PaletteAction[] = [
  {
    id: 'nav.traces',
    label: 'Go to Traces',
    keywords: ['traces', 'spans', 'apm'],
    group: 'navigation',
    hotkey: 'g t',
    perform: ({ navigate }) => {
      navigate('/traces');
    },
  },
  {
    id: 'traces.reset-waterfall',
    label: 'Reset Trace Waterfall View',
    keywords: ['clear', 'reset', 'waterfall', 'trace'],
    group: 'feature',
    perform: () => useTracesStore.getState().setWaterfallViewMode('compact'),
    enabled: () => useTracesStore.getState().waterfallViewMode === 'detailed',
  },
];
