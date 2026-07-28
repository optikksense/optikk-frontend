import DataTable from "@shared/components/ui/data-display/DataTable";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { buildTraceDetailHref } from "@shared/observability/deepLinks";
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

    const baseColumns: ColumnDef<Record<string, unknown>>[] = resolvedColumns.map((column) => ({
      header: column.label,
      accessorKey: column.key,
      size: column.width,
      meta: { align: column.align },
      cell: ({ getValue }) => {
        const val = getValue();
        if (val == null || val === "") return "—";
        if (column.key === "sampleTraceId" || column.key === "traceId") {
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate({ to: buildTraceDetailHref(String(val)) as never });
              }}
              className="group flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-primary hover:underline"
            >
              {String(val)}
            </button>
          );
        }

        if (column.formatter) {
          switch (column.formatter) {
            case "ms":
              return formatDuration(val as number);
            case "number":
              return formatNumber(val as number);
            case "percent":
            case "percent2":
              return formatPercentage(val as number);
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
        header: "Details",
        id: "__details",
        meta: { align: "right" },
        cell: ({ row }) => {
          const search = buildDashboardDrawerSearch(
            location.search,
            chartConfig.drawerAction,
            row.original
          );
          return search ? <Link to={location.pathname + search}>View</Link> : "—";
        },
      },
    ];
  }, [
    chartConfig.columns,
    chartConfig.drawerAction,
    location.pathname,
    location.search,
    navigate,
    rows,
  ]);
  if (rows.length === 0) {
    return <ChartNoDataOverlay />;
  }
  return (
    <div className="h-full min-h-0 overflow-auto">
      <DataTable
        data={{
          rows: rows.map((r: Record<string, unknown>, i: number) => ({
            ...r,
            _rowKey: r.id ?? r.key ?? i,
          })),
          columns,
        }}
      />
    </div>
  );
}
