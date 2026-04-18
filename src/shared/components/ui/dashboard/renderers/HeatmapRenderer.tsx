import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";

import type { DashboardPanelRendererProps } from "../dashboardPanelRegistry";

/**
 * Renders a latency heatmap table with intelligent date formatting on the X-axis.
 * All hooks must be called before any conditional returns (Rules of Hooks).
 */
export function HeatmapRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  const xKey = chartConfig.xKey || "operation_name";
  const yKey = chartConfig.yKey || "service_name";
  const valueKey = chartConfig.valueKey || "error_rate";

  // All useMemo calls must be before conditional returns
  const xValues = useMemo(
    () => Array.from(new Set(rows.map((r: any) => String(r[xKey] ?? "")))).slice(0, 20),
    [rows, xKey]
  );

  const xLabels = useMemo(() => {
    if (xValues.length === 0) return {};

    const timestamps = xValues.map((v) => new Date(v).getTime());
    const isTimestamps =
      timestamps.every((ts) => !Number.isNaN(ts)) && xValues.some((v) => v.includes("-"));

    if (!isTimestamps) {
      return Object.fromEntries(
        xValues.map((x) => [x, x.length > 12 ? `${x.slice(0, 12)}...` : x])
      );
    }

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const diffHours = (maxTime - minTime) / (1000 * 60 * 60);

    return Object.fromEntries(
      xValues.map((x, i) => {
        const d = new Date(timestamps[i]!);
        let formatted = "";

        if (diffHours <= 24) {
          formatted = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
        } else if (diffHours <= 7 * 24) {
          formatted = d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } else {
          formatted = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        }

        return [x, formatted];
      })
    );
  }, [xValues]);

  const { yValues, lookup, maxVal, yOverflow } = useMemo(() => {
    const Y_CAP = 50;
    const allYVals = Array.from(new Set(rows.map((r: any) => String(r[yKey] ?? ""))));
    const yVals = allYVals.slice(0, Y_CAP);
    const yVisible = new Set(yVals);
    const lkp: Record<string, Record<string, number>> = {};
    let max = 1;
    for (const row of rows) {
      const y = String(row[yKey] ?? "");
      if (!yVisible.has(y)) continue;
      const x = String(row[xKey] ?? "");
      const v = Number(row[valueKey]) || 0;
      if (!lkp[y]) lkp[y] = {};
      lkp[y][x] = v;
      if (v > max) max = v;
    }
    return {
      yValues: yVals,
      lookup: lkp,
      maxVal: max,
      yOverflow: Math.max(0, allYVals.length - yVals.length),
    };
  }, [rows, xKey, yKey, valueKey]);

  const formattedValues = useMemo(() => {
    const out: Record<string, Record<string, string>> = {};
    for (const y of yValues) {
      out[y] = {};
      for (const x of xValues) {
        const val = lookup[y]?.[x] ?? 0;
        out[y]![x] = val > 0 ? (val < 1 ? val.toFixed(2) : val.toFixed(0)) : "";
      }
    }
    return out;
  }, [yValues, xValues, lookup]);

  // Conditional return AFTER all hooks
  if (rows.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
        No data
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
        <thead>
          <tr>
            <th style={{ padding: "4px 8px", textAlign: "left" }} />
            {xValues.map((x) => (
              <th
                key={x}
                style={{
                  padding: "4px 6px",
                  fontWeight: 400,
                  maxWidth: 80,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={x}
              >
                {xLabels[x]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yValues.map((y) => (
            <tr key={y}>
              <td style={{ padding: "4px 8px", fontWeight: 500, whiteSpace: "nowrap" }}>{y}</td>
              {xValues.map((x) => {
                const val = lookup[y]?.[x] ?? 0;
                const intensity = Math.min(1, val / maxVal);
                const bg = `rgba(240,68,56,${intensity.toFixed(2)})`;
                return (
                  <td
                    key={x}
                    style={{
                      background: bg,
                      padding: "4px 6px",
                      textAlign: "center",
                      color: intensity > 0.5 ? "#fff" : "inherit",
                    }}
                  >
                    {formattedValues[y]?.[x]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {yOverflow > 0 ? (
        <div
          className="text-muted"
          style={{ textAlign: "center", padding: "8px 12px", fontSize: 11 }}
        >
          +{yOverflow} more rows hidden
        </div>
      ) : null}
    </div>
  );
}
