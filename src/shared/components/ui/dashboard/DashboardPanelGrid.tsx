import { useEffect, useMemo, useRef, useState } from "react";
import { Responsive } from "react-grid-layout";

import type {
  DashboardDataSources,
  DashboardExtraContext,
  DashboardPanelSpec,
} from "@/types/dashboardConfig";

import ConfigurableChartCard from "./ConfigurableChartCard";
import { GRID_COLS, GRID_CONTAINER_PADDING, GRID_MARGIN, GRID_ROW_HEIGHT } from "./panelSizePolicy";

import type { ApiErrorShape } from "@shared/api/api/interceptors/errorInterceptor";

interface DashboardPanelGridProps {
  panels: DashboardPanelSpec[];
  dataSources: DashboardDataSources;
  errors: Record<string, ApiErrorShape | null>;
  isLoading: boolean;
  extraContext: DashboardExtraContext;
}

interface DashboardGridItem {
  readonly i: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly static: true;
}

type DashboardLayouts = Record<string, DashboardGridItem[]>;

function sortPanels(panels: DashboardPanelSpec[]): DashboardPanelSpec[] {
  return [...panels].sort((left, right) => {
    if (left.layout.y !== right.layout.y) {
      return left.layout.y - right.layout.y;
    }
    if (left.layout.x !== right.layout.x) {
      return left.layout.x - right.layout.x;
    }
    if (left.order !== right.order) {
      return left.order - right.order;
    }
    return left.id.localeCompare(right.id);
  });
}

function toLayoutItem(panel: DashboardPanelSpec): DashboardGridItem {
  return {
    i: panel.id,
    x: panel.layout.x,
    y: panel.layout.y,
    w: panel.layout.w,
    h: panel.layout.h,
    static: true,
  };
}

function stackPanels(panels: readonly DashboardPanelSpec[]): DashboardGridItem[] {
  let y = 0;
  return panels.map((panel) => {
    const h = panel.layout.h;
    const item: DashboardGridItem = {
      i: panel.id,
      x: 0,
      y,
      w: GRID_COLS,
      h,
      static: true,
    };
    y += h;
    return item;
  });
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

  const orderedPanels = useMemo(() => sortPanels(panels), [panels]);

  const layouts = useMemo<DashboardLayouts>(() => {
    const largeLayouts = orderedPanels.map(toLayoutItem);
    const stacked = stackPanels(orderedPanels);

    return {
      lg: largeLayouts,
      md: largeLayouts,
      sm: stacked,
      xs: stacked,
    };
  }, [orderedPanels]);

  const panelMap = useMemo(() => {
    const map = new Map<string, DashboardPanelSpec>();
    for (const p of orderedPanels) map.set(p.id, p);
    return map;
  }, [orderedPanels]);

  // Collect panel IDs in layout order for stable rendering
  const panelIds = useMemo(() => (layouts.lg ?? []).map((item) => item.i), [layouts]);

  return (
    <div ref={containerRef}>
      {width > 0 && (
        <Responsive
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 0 }}
          cols={{ lg: GRID_COLS, md: GRID_COLS, sm: GRID_COLS, xs: GRID_COLS }}
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
