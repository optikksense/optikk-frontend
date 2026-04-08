import { formatDuration, formatNumber } from "@shared/utils/formatters";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

import { APP_COLORS } from "@config/colorLiterals";

const DEFAULT_MAX_HEIGHT = "200px";

type EndpointListType = "requests" | "errorRate" | "latency";

interface EndpointListItem {
  key?: string;
  http_method?: string;
  operation_name?: string;
  endpoint_name?: string;
  service_name?: string;
  service?: string;
  request_count?: number;
  error_count?: number;
  avg_latency?: number;
  p95_latency?: number;
}

interface EndpointListProps {
  endpoints?: EndpointListItem[];
  selectedEndpoints?: string[];
  onToggle?: (endpointKey: string) => void;
  type?: EndpointListType;
  maxHeight?: string;
}

interface EndpointValue {
  value: number;
  formatted: string;
}

function VirtualizedEndpoints({
  endpoints,
  selectedEndpoints,
  onToggle,
  maxHeight,
  getEndpointValue,
  getValueColor,
  getBackgroundColor,
  getBorderColor,
}: {
  endpoints: EndpointListItem[];
  selectedEndpoints: string[];
  onToggle?: (key: string) => void;
  maxHeight: string;
  getEndpointValue: (ep: EndpointListItem) => EndpointValue;
  getValueColor: (value: number) => string;
  getBackgroundColor: (isSelected: boolean) => string;
  getBorderColor: (isSelected: boolean) => string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: endpoints.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // ~36px item + 8px gap
    overscan: 5,
    gap: 8,
  });

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight,
        overflowY: "auto",
        paddingRight: 4,
        scrollbarWidth: "thin",
        scrollbarColor: "var(--border-color) var(--bg-secondary)",
      }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const ep = endpoints[virtualRow.index];
          const endpointKey =
            ep.key ||
            `${ep.http_method || "N/A"}_${ep.operation_name || ep.endpoint_name || "Unknown"}_${ep.service_name || ""}`;
          const isSelected = selectedEndpoints.includes(endpointKey);
          const isFaded = selectedEndpoints.length > 0 && !isSelected;
          const { value, formatted } = getEndpointValue(ep);

          return (
            <div
              key={endpointKey}
              onClick={() => onToggle?.(endpointKey)}
              style={{
                position: "absolute",
                top: virtualRow.start,
                width: "100%",
                height: virtualRow.size,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: getBackgroundColor(isSelected),
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.2s",
                opacity: isFaded ? 0.3 : 1,
                border: `1px solid ${getBorderColor(isSelected)}`,
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                if (!isFaded) {
                  e.currentTarget.style.background = isSelected
                    ? getBackgroundColor(true).replace("0.2", "0.3")
                    : "var(--bg-tertiary)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = getBackgroundColor(isSelected);
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 12,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ep.http_method || "N/A"} {ep.operation_name || ep.endpoint_name || "Unknown"}
                </div>
                {ep.service && ep.service !== "unknown" && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {ep.service}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: getValueColor(value),
                  marginLeft: 12,
                }}
              >
                {formatted}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Reusable component for displaying endpoint lists below charts
 * Reduces code duplication across RequestChart, ErrorRateChart, and LatencyChart
 * @param props Component props.
 * @returns Rendered endpoint list for the selected metric type.
 */
export default function EndpointList({
  endpoints = [],
  selectedEndpoints = [],
  onToggle,
  type = "requests", // 'requests', 'errorRate', 'latency'
  maxHeight = DEFAULT_MAX_HEIGHT,
}: EndpointListProps): JSX.Element | null {
  if (endpoints.length === 0) return null;

  const getEndpointValue = (endpoint: EndpointListItem): EndpointValue => {
    switch (type) {
      case "errorRate": {
        const requestCount = endpoint.request_count || 0;
        const errorCount = endpoint.error_count || 0;
        const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
        return { value: errorRate, formatted: `${Number(errorRate).toFixed(2)}%` };
      }
      case "latency": {
        const latency = endpoint.avg_latency || endpoint.p95_latency || 0;
        return { value: latency, formatted: formatDuration(latency) };
      }
      default: // requests
        return {
          value: endpoint.request_count || 0,
          formatted: formatNumber(endpoint.request_count || 0),
        };
    }
  };

  const getValueColor = (value: number): string => {
    switch (type) {
      case "errorRate":
        if (value > 5) return "var(--color-error)";
        if (value > 1) return "var(--color-warning)";
        return "var(--color-success)";
      case "latency":
        if (value > 500) return "var(--color-error)";
        if (value > 200) return "var(--color-warning)";
        return "var(--color-success)";
      default:
        return "var(--color-primary)";
    }
  };

  const getBackgroundColor = (isSelected: boolean): string => {
    if (isSelected) {
      switch (type) {
        case "errorRate":
          return APP_COLORS.rgba_255_77_79_0p2;
        case "latency":
          return APP_COLORS.rgba_250_173_20_0p2;
        default:
          return "var(--color-primary-subtle-18)";
      }
    }
    return "var(--bg-secondary)";
  };

  const getBorderColor = (isSelected: boolean): string => {
    if (isSelected) {
      switch (type) {
        case "errorRate":
          return APP_COLORS.hex_f04438;
        case "latency":
          return APP_COLORS.hex_f79009;
        default:
          return "var(--color-primary)";
      }
    }
    return "transparent";
  };

  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid var(--border-color)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-muted)",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Top Endpoints by{" "}
        {type === "errorRate" ? "Error Rate" : type === "latency" ? "Latency" : "Requests"}
      </div>
      <VirtualizedEndpoints
        endpoints={endpoints}
        selectedEndpoints={selectedEndpoints}
        onToggle={onToggle}
        maxHeight={maxHeight}
        getEndpointValue={getEndpointValue}
        getValueColor={getValueColor}
        getBackgroundColor={getBackgroundColor}
        getBorderColor={getBorderColor}
      />
    </div>
  );
}
