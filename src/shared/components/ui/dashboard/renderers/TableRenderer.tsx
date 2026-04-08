import { SimpleTable } from "@shared/components/primitives/ui/simple-table";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";
import { useDashboardData } from "../hooks/useDashboardData";
import { buildDashboardDrawerSearch } from "../utils/dashboardDrawerState";

import type { DashboardPanelRendererProps } from "../dashboardPanelRegistry";

/**
 *
 */
export function TableRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);
  const location = useLocation();
  const navigate = useNavigate();

  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    const resolvedColumns: Array<{
      key: string;
      label: string;
      formatter?: string;
      width?: number;
      align?: "left" | "center" | "right";
    }> = chartConfig.columns?.length
      ? chartConfig.columns
      : Object.keys(rows[0])
          .slice(0, 8)
          .map((key) => ({
            key,
            label: key
              .replace(/_/g, " ")
              .replace(/([A-Z])/g, " $1")
              .trim(),
          }));

    const baseColumns = resolvedColumns.map((column) => ({
      title: column.label,
      dataIndex: column.key,
      key: column.key,
      width: column.width,
      align: column.align,
      ellipsis: true,
      render: (val: any) => {
        if (val == null || val === "") return "—";
        if (column.key === "sample_trace_id" || column.key === "trace_id") {
          return (
            <span
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate({ to: `/traces/${val}` });
              }}
              className="group flex cursor-pointer items-center gap-1 text-[var(--color-primary)] hover:underline"
            >
              {String(val)}
            </span>
          );
        }

        if (column.formatter) {
          switch (column.formatter) {
            case "ms":
              return formatDuration(val);
            case "number":
              return formatNumber(val);
            case "percent":
            case "percent2":
              return formatPercentage(val);
          }
        }

        if (typeof val === "number") return Number.isInteger(val) ? val : Number(val).toFixed(2);
        return String(val);
      },
    }));
    if (!chartConfig.drawerAction) {
      return baseColumns;
    }

    return [
      ...baseColumns,
      {
        title: "Details",
        key: "__details",
        align: "right" as const,
        render: (_val: unknown, row: Record<string, unknown>) => {
          const search = buildDashboardDrawerSearch(location.search, chartConfig.drawerAction, row);
          return search ? <Link to={location.pathname + search}>View</Link> : "—";
        },
      },
    ];
  }, [chartConfig.columns, chartConfig.drawerAction, location.pathname, location.search, rows]);
  if (rows.length === 0) {
    return <ChartNoDataOverlay />;
  }
  return (
    <div className="h-full min-h-0 overflow-auto">
      <SimpleTable
        dataSource={rows.map((r: any, i: number) => ({ ...r, _rowKey: r.id ?? r.key ?? i }))}
        columns={columns}
        rowKey="_rowKey"
        size="middle"
      />
    </div>
  );
}
