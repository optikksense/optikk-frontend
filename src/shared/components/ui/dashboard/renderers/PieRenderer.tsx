import { useEffect, useMemo, useRef, useState } from "react";

import DonutChart from "@shared/components/ui/charts/micro/DonutChart";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { getChartColor } from "@shared/utils/charting";
import { useDashboardData } from "../hooks/useDashboardData";

import type { DashboardPanelRendererProps } from "../dashboardPanelRegistry";

/**
 *
 */
export function PieRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  const labelKey = chartConfig.labelKey || chartConfig.groupByKey || "label";
  const valueKey = chartConfig.valueKey || "value";

  const chartData = useMemo(() => {
    const filtered = rows.filter((row) => row != null);
    if (filtered.length === 0) return null;

    const segments = filtered.map((row, index) => {
      const value = Number(row[valueKey]);
      const name = String(row[labelKey] ?? `Item ${index + 1}`);

      let color = getChartColor(index);
      if (name.startsWith("2xx"))
        color = "#10b981"; // Emerald 500 (Green)
      else if (name.startsWith("3xx"))
        color = "#3b82f6"; // Blue 500
      else if (name.startsWith("4xx"))
        color = "#ef4444"; // Red 500
      else if (name.startsWith("5xx")) color = "#eab308"; // Yellow 500

      return {
        name,
        value: Number.isFinite(value) ? value : 0,
        color,
      };
    });

    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    if (total <= 0) return null;

    return {
      segments,
      total,
    };
  }, [labelKey, rows, valueKey]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [donutSize, setDonutSize] = useState(180);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const s = Math.min(width, height);
        setDonutSize(Math.max(120, Math.min(220, Math.floor(s * 0.82))));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!chartData) {
    return <ChartNoDataOverlay />;
  }

  return (
    <div ref={wrapRef} className="flex h-full min-h-0 w-full items-center justify-center py-2">
      <DonutChart
        size={donutSize}
        strokeWidth={20}
        segments={chartData.segments.map((segment) => ({
          label: segment.name,
          value: segment.value,
          color: segment.color,
        }))}
        centerValue={String(chartData.total)}
        centerLabel={chartConfig.title ?? "Total"}
      />
    </div>
  );
}
