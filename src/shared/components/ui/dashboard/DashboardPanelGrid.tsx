import { useEffect, useMemo, useRef, useState } from 'react';
import { Responsive } from 'react-grid-layout';

import type {
  DashboardDataSources,
  DashboardExtraContext,
  DashboardPanelSpec,
  DashboardSectionLayoutMode,
} from '@/types/dashboardConfig';

import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';

import ConfigurableChartCard from './ConfigurableChartCard';
import { buildResponsiveLayouts } from './autoLayout';
import { GRID_CONTAINER_PADDING, GRID_MARGIN, GRID_ROW_HEIGHT } from './gridConstants';

interface DashboardPanelGridProps {
  panels: DashboardPanelSpec[];
  layoutMode: DashboardSectionLayoutMode;
  dataSources: DashboardDataSources;
  errors: Record<string, ApiErrorShape | null>;
  isLoading: boolean;
  extraContext: DashboardExtraContext;
}

export default function DashboardPanelGrid({
  panels,
  dataSources,
  errors,
  isLoading,
  extraContext,
}: DashboardPanelGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const layouts = useMemo(() => buildResponsiveLayouts(panels), [panels]);

  const panelMap = useMemo(() => {
    const map = new Map<string, DashboardPanelSpec>();
    for (const p of panels) map.set(p.id, p);
    return map;
  }, [panels]);

  // Collect panel IDs in layout order for stable rendering
  const panelIds = useMemo(() => (layouts.lg ?? []).map((item) => item.i), [layouts]);

  return (
    <div ref={containerRef}>
      {width > 0 && (
        <Responsive
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 1 }}
          rowHeight={GRID_ROW_HEIGHT}
          margin={GRID_MARGIN}
          containerPadding={GRID_CONTAINER_PADDING}
          dragConfig={{ enabled: false }}
          resizeConfig={{ enabled: false }}
          compactor={undefined}
        >
          {panelIds.map((id) => {
            const panelConfig = panelMap.get(id);
            if (!panelConfig) return null;
            return (
              <div key={id}>
                <ConfigurableChartCard
                  componentConfig={panelConfig}
                  dataSources={dataSources}
                  error={errors[panelConfig.id] ?? null}
                  isLoading={isLoading}
                  extraContext={extraContext}
                />
              </div>
            );
          })}
        </Responsive>
      )}
    </div>
  );
}
