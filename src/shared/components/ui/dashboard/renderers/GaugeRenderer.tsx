import GaugeChart from "@shared/components/ui/charts/micro/GaugeChart";

import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { useDashboardData } from "../hooks/useDashboardData";

import type { DashboardPanelRendererProps } from "../dashboardPanelRegistry";

/**
 *
 */
export function GaugeRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);
  const valueKey = chartConfig.valueKey || "value";
  const groupKey = chartConfig.groupByKey;

  if (rows.length === 0) {
    return <ChartNoDataOverlay />;
  }

  if (groupKey) {
    return (
      <div
        style={{
          height: "100%",
          overflowX: "hidden",
          overflowY: "auto",
          padding: "8px 8px 12px",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
            alignContent: "start",
          }}
        >
          {rows.map((row: any, i: number) => {
            const val = Number(row[valueKey] ?? 0);
            const label = row[groupKey] || `Item ${i + 1}`;
            return (
              <div
                key={label}
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                }}
                title={String(label)}
              >
                <GaugeChart value={Math.round(val * 100)} label={label} size={80} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const val = Number(rows[0]?.[valueKey] ?? 0);
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      <GaugeChart value={Math.round(val * 100)} label={chartConfig.title ?? ""} />
    </div>
  );
}
