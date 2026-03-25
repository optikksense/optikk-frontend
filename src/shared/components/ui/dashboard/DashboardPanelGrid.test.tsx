import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DashboardPanelSpec } from '@/types/dashboardConfig';

import DashboardPanelGrid, {
  resolvePanelHeightClasses,
  resolvePanelSpanClasses,
  resolveSectionGridClasses,
} from './DashboardPanelGrid';

vi.mock('./ConfigurableChartCard', () => ({
  default: ({ componentConfig }: { componentConfig: DashboardPanelSpec }) => (
    <div data-testid={`panel-${componentConfig.id}`}>{componentConfig.title}</div>
  ),
}));

const basePanel = (overrides: Partial<DashboardPanelSpec> = {}): DashboardPanelSpec => ({
  id: 'panel-a',
  panelType: 'request',
  sectionId: 'trends',
  title: 'Panel A',
  order: 10,
  layout: { preset: 'trend' },
  query: { method: 'GET', endpoint: '/v1/panel-a' },
  ...overrides,
});

describe('DashboardPanelGrid', () => {
  it('uses stable section template classes for each layout mode', () => {
    expect(resolveSectionGridClasses('kpi-strip')).toContain('xl:grid-cols-4');
    expect(resolveSectionGridClasses('two-up')).toContain('xl:grid-cols-2');
    expect(resolveSectionGridClasses('three-up')).toContain('xl:grid-cols-3');
    expect(resolveSectionGridClasses('stack')).toBe('grid grid-cols-1 gap-[var(--space-md)]');
  });

  it('makes hero and detail panels span the full row inside multi-column sections', () => {
    expect(resolvePanelSpanClasses('two-up', basePanel({ layout: { preset: 'hero' } }))).toBe('xl:col-span-2');
    expect(resolvePanelSpanClasses('three-up', basePanel({ layout: { preset: 'detail' } }))).toBe('md:col-span-2 xl:col-span-3');
    expect(resolvePanelSpanClasses('two-up', basePanel({ layout: { preset: 'trend' } }))).toBe('');
  });

  it('maps panel presets to consistent section-scoped heights', () => {
    expect(resolvePanelHeightClasses('kpi')).toBe('min-h-[152px]');
    expect(resolvePanelHeightClasses('breakdown')).toBe('min-h-[280px]');
    expect(resolvePanelHeightClasses('trend')).toBe('min-h-[320px]');
    expect(resolvePanelHeightClasses('hero')).toBe('min-h-[360px]');
    expect(resolvePanelHeightClasses('detail')).toBe('min-h-[380px]');
  });

  it('renders full-span panels after smaller cards without affecting sibling sections', () => {
    render(
      <DashboardPanelGrid
        panels={[
          basePanel({ id: 'breakdown-a', title: 'Breakdown A', layout: { preset: 'breakdown' } }),
          basePanel({ id: 'hero-a', title: 'Hero A', order: 20, layout: { preset: 'hero' } }),
        ]}
        layoutMode="two-up"
        dataSources={{}}
        errors={{}}
        isLoading={false}
        extraContext={{}}
      />,
    );

    const heroWrapper = screen.getByTestId('panel-hero-a').parentElement;
    const breakdownWrapper = screen.getByTestId('panel-breakdown-a').parentElement;

    expect(breakdownWrapper?.className).toContain('min-h-[280px]');
    expect(heroWrapper?.className).toContain('xl:col-span-2');
    expect(heroWrapper?.className).toContain('min-h-[360px]');
  });
});
