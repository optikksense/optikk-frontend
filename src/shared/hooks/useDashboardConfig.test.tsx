import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDashboardConfig } from './useDashboardConfig';

vi.mock('./usePageTabs', () => ({
  usePageTabs: vi.fn(() => ({
    tabs: [{ id: 'summary', pageId: 'overview', label: 'Summary', order: 10 }],
    isLoading: false,
    error: null,
  })),
}));

vi.mock('./useDashboardTabDocument', () => ({
  useDashboardTabDocument: vi.fn(() => ({
    tab: {
      id: 'summary',
      pageId: 'overview',
      label: 'Summary',
      order: 10,
      sections: [
        { id: 'golden-signals', title: 'Golden Signals', order: 10, kind: 'trends', layoutMode: 'two-up', collapsible: true },
      ],
      panels: [
        {
          id: 'request-rate',
          panelType: 'request',
          sectionId: 'golden-signals',
          order: 10,
          layout: { preset: 'trend' },
          query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
          dataSource: 'request-rate',
        },
      ],
    },
    isLoading: false,
    error: null,
  })),
}));

describe('useDashboardConfig', () => {
  it('returns the first tab document as a render config', () => {
    const { result } = renderHook(() => useDashboardConfig('overview'));

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.config?.panels).toEqual([
      expect.objectContaining({
        id: 'request-rate',
        panelType: 'request',
        dataSource: 'request-rate',
      }),
    ]);
  });
});
