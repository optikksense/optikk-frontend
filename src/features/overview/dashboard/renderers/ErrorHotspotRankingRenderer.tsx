import { useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import type { DashboardPanelRendererProps } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useDashboardData } from "@shared/components/ui/dashboard/hooks/useDashboardData";

interface HotspotRow {
  readonly label: string;
  readonly detail: string;
  readonly errorRate: number;
}

function getBarColor(value: number): string {
  if (value >= 50) return APP_COLORS.hex_f04438;
  if (value >= 15) return APP_COLORS.hex_f79009;
  return APP_COLORS.hex_06aed5;
}

export function ErrorHotspotRankingRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);
  const valueKey = chartConfig.valueKey || "error_rate";

  const items = useMemo<HotspotRow[]>(() => {
    return rows
      .map((row) => {
        const serviceName = String(row.service_name ?? "unknown-service");
        const operationName = String(row.operation_name ?? "unknown-operation");
        const errorRate = Math.max(0, Number(row[valueKey] ?? 0));
        const errorCount = Math.max(0, Number(row.error_count ?? 0));
        const totalCount = Math.max(0, Number(row.total_count ?? 0));

        return {
          label: `${serviceName} · ${operationName}`,
          detail: `${errorCount} errors / ${totalCount} requests`,
          errorRate,
          errorCount,
        };
      })
      .filter((row) => row.errorRate > 0 || row.errorCount > 0)
      .sort((left, right) => {
        if (right.errorRate !== left.errorRate) {
          return right.errorRate - left.errorRate;
        }
        return right.errorCount - left.errorCount;
      })
      .slice(0, 8)
      .map(({ label, detail, errorRate }) => ({
        label,
        detail,
        errorRate,
      }));
  }, [rows, valueKey]);

  if (items.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
        No data
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-3 py-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                className="truncate font-medium text-[12px] text-[var(--text-primary)]"
                title={item.label}
              >
                {item.label}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">{item.detail}</div>
            </div>
            <div
              className="shrink-0 font-semibold text-[11px] tabular-nums"
              style={{ color: getBarColor(item.errorRate) }}
            >
              {item.errorRate >= 10 ? item.errorRate.toFixed(0) : item.errorRate.toFixed(1)}%
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(item.errorRate, 100)}%`,
                backgroundColor: getBarColor(item.errorRate),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
