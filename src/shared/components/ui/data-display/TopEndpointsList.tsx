import { Link } from "@tanstack/react-router";

import type { DashboardDrawerAction } from "@/types/dashboardConfig";
import { CHART_COLORS } from "@config/constants";
import { buildDashboardDrawerSearch } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";
import { formatDuration, formatNumber } from "@shared/utils/formatters";

import { APP_COLORS } from "@config/colorLiterals";

export type TopEndpointsListType = "requests" | "errorRate" | "latency" | "count";

interface TopEndpointListItem {
  key?: string;
  endpoint?: string;
  service?: string;
  request_count?: number;
  errorRate?: number;
  value?: number;
  latency?: number;
  [key: string]: unknown;
}

interface TopEndpointsListProps {
  title?: string;
  endpoints?: TopEndpointListItem[];
  selectedEndpoints?: string[];
  onToggle?: (endpointKey: string) => void;
  type?: TopEndpointsListType;
  drawerAction?: DashboardDrawerAction;
  currentPathname?: string;
  currentSearch?: string;
  maxVisibleRows?: number;
}

interface RowDisplayConfig {
  selectedBg: string;
  hoverBg: string;
  valueColor: string;
  displayValue: string;
}

function getRowDisplayConfig(
  type: TopEndpointsListType,
  endpoint: TopEndpointListItem
): RowDisplayConfig {
  if (type === "errorRate") {
    const rate = endpoint.errorRate ?? endpoint.value ?? 0;
    return {
      selectedBg: "rgba(240, 68, 56, 0.12)",
      hoverBg: "rgba(255,255,255,0.04)",
      valueColor: rate > 5 ? "var(--color-error)" : "var(--text-primary)",
      displayValue: `${Number(rate).toFixed(2)}%`,
    };
  }

  if (type === "latency") {
    const latency = endpoint.latency ?? 0;
    return {
      selectedBg: "rgba(247, 182, 58, 0.12)",
      hoverBg: "rgba(255,255,255,0.04)",
      valueColor:
        latency > 500
          ? "var(--color-error)"
          : latency > 200
            ? "var(--color-warning)"
            : "var(--text-primary)",
      displayValue: formatDuration(latency),
    };
  }

  return {
    selectedBg: "rgba(124, 127, 242, 0.12)",
    hoverBg: "rgba(255,255,255,0.04)",
    valueColor: "var(--text-primary)",
    displayValue: formatNumber(endpoint.request_count ?? 0),
  };
}

/**
 * Reusable component for displaying top endpoints below charts
 * @param props Component props.
 * @returns Rendered endpoint table for the selected metric.
 */
export default function TopEndpointsList({
  title,
  endpoints = [],
  selectedEndpoints = [],
  onToggle,
  type = "requests", // 'requests', 'errorRate', 'latency'
  drawerAction,
  currentPathname = "",
  currentSearch = "",
  maxVisibleRows,
}: TopEndpointsListProps): JSX.Element | null {
  if (endpoints.length === 0) return null;
  const visibleEndpoints = maxVisibleRows ? endpoints.slice(0, maxVisibleRows) : endpoints;

  return (
    <div style={{ marginTop: 0, borderTop: "1px solid var(--border-color)" }}>
      <div
        style={{
          maxHeight: "180px",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: `var(--border-color, ${APP_COLORS.hex_2d2d2d}) transparent`,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                color: "var(--text-secondary)",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <th style={{ padding: "4px 8px", fontWeight: 500 }}>Name</th>
              <th style={{ padding: "4px 8px", fontWeight: 500, textAlign: "right" }}>{title}</th>
              {drawerAction ? (
                <th style={{ padding: "4px 8px", fontWeight: 500, textAlign: "right" }}>Details</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {visibleEndpoints.map((endpoint, index) => {
              const endpointKey = endpoint.key ?? `${endpoint.endpoint ?? "unknown"}-${index}`;
              const detailSearch = buildDashboardDrawerSearch(
                currentSearch,
                drawerAction,
                endpoint as Record<string, unknown>
              );
              const isSelected = selectedEndpoints.includes(endpointKey);
              const isFaded = selectedEndpoints.length > 0 && !isSelected;
              const { selectedBg, hoverBg, valueColor, displayValue } = getRowDisplayConfig(
                type,
                endpoint
              );

              // Find max value in list for proportional bar calculation
              const getVal = (ep: TopEndpointListItem) =>
                type === "errorRate"
                  ? (ep.errorRate ?? ep.value ?? 0)
                  : type === "latency"
                    ? (ep.latency ?? 0)
                    : (ep.request_count ?? 0);
              const maxValInList = Math.max(...visibleEndpoints.map(getVal), 1);
              const currentVal = getVal(endpoint);
              const pct = (currentVal / maxValInList) * 100;
              const barWidth = Math.max(Math.min(pct, 100), 2);

              // Gradient based on type (Error rate/Hotspot uses orange->red)
              const barBg =
                type === "errorRate"
                  ? `linear-gradient(90deg, ${APP_COLORS.hex_f79009} 0%, ${APP_COLORS.hex_f04438} 100%)`
                  : type === "latency"
                    ? `linear-gradient(90deg, ${APP_COLORS.hex_ffd166} 0%, ${APP_COLORS.hex_f79009} 100%)`
                    : `linear-gradient(90deg, ${CHART_COLORS[1]} 0%, ${CHART_COLORS[0]} 100%)`;

              return (
                <tr
                  key={endpointKey}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle?.(endpointKey);
                  }}
                  style={{
                    background: isSelected ? selectedBg : "transparent",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    opacity: isFaded ? 0.4 : 1,
                  }}
                  onMouseEnter={(event) => {
                    if (!isFaded) {
                      event.currentTarget.style.background = isSelected ? selectedBg : hoverBg;
                    }
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = isSelected ? selectedBg : "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "4px 8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {endpoint.endpoint}
                      </span>
                      {endpoint.service && endpoint.service !== "unknown" && (
                        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                          {endpoint.service}
                        </span>
                      )}
                    </div>
                    {/* Proportional Gradient Intensity Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "3px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "999px",
                        overflow: "hidden",
                        marginTop: "2px",
                      }}
                    >
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: "100%",
                          background: barBg,
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      padding: "4px 8px",
                      textAlign: "right",
                      color: valueColor,
                    }}
                  >
                    {displayValue}
                  </td>
                  {drawerAction ? (
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {detailSearch ? (
                        <Link
                          to={currentPathname + detailSearch}
                          onClick={(event) => event.stopPropagation()}
                          style={{
                            color: "var(--color-primary)",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          View
                        </Link>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
