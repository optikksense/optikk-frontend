import { Surface } from "@/components/ui";

import StatCard from "@shared/components/ui/cards/StatCard";

import { useDashboardData } from "../hooks/useDashboardData";
import { formatStatValue, resolveFieldValue } from "../utils/dashboardFormatters";
import { renderStatSummary } from "./StatSummaryRenderer";
import { getDashboardIcon } from "../utils/dashboardUtils";

import type { DashboardPanelRendererProps } from "../dashboardPanelRegistry";

export function StatCardRenderer({
  chartConfig,
  dataSources,
  titleContent,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const value = resolveFieldValue(rawData, chartConfig.valueField as string | undefined);
  const displayValue =
    typeof value === "string" || typeof value === "number" ? value : String(value ?? "");
  const iconName = chartConfig.titleIcon ?? chartConfig.icon;
  const icon = iconName ? getDashboardIcon(String(iconName), 20) : undefined;

  return (
    <StatCard
      metric={{
        title: titleContent || String(chartConfig.title || ""),
        value: displayValue,
        formatter: (val) => formatStatValue(chartConfig.formatter as string | undefined, val),
      }}
      visuals={{
        icon: icon ?? undefined,
      }}
    />
  );
}

export function StatSummaryRenderer({
  chartConfig,
  dataSources,
  titleContent,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const summaryFields = Array.isArray(chartConfig.summaryFields)
    ? (chartConfig.summaryFields as Array<{ label: string; field?: string; keys?: string[] }>)
    : undefined;

  return (
    <Surface elevation={1} padding="sm" className="chart-card h-full">
      <div className="chart-card__title">{titleContent || String(chartConfig.title || "")}</div>
      {renderStatSummary(rawData, {
        formatter: chartConfig.formatter as string | undefined,
        fields: summaryFields,
      })}
    </Surface>
  );
}
