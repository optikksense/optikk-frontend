import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import HealthIndicator from "@shared/components/ui/cards/HealthIndicator";
import type { DashboardPanelRendererProps } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useDashboardData } from "@shared/components/ui/dashboard/hooks/useDashboardData";
import { buildServiceDrawerSearch } from "@shared/components/ui/drawers/serviceDrawerState";
import { SERVICE_HEALTH_THRESHOLDS, classifyHealth } from "@shared/constants/healthThresholds";
import { formatNumber } from "@shared/utils/formatters";

export function ServiceHealthGridRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: services } = useDashboardData(chartConfig, dataSources);

  const serviceHealth = useMemo(() => {
    return services.slice(0, 8).map((s: Record<string, unknown>) => {
      const requestCount = Number(s.requestCount ?? 0);
      const errorCount = Number(s.errorCount ?? 0);
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
      const status = classifyHealth(errorRate, SERVICE_HEALTH_THRESHOLDS);
      return {
        name: String(s.serviceName ?? ""),
        status,
        requestCount,
        errorCount,
        errorRate,
        avgLatency: Number(s.avgLatency ?? 0),
        p95Latency: Number(s.p95Latency ?? 0),
        p99Latency: Number(s.p99Latency ?? 0),
      };
    });
  }, [services]);

  return (
    <div className="h-full min-h-0 overflow-y-auto p-2">
      {serviceHealth.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 8,
            alignContent: "start",
          }}
        >
          {serviceHealth.map((service) => (
            <div key={service.name}>
              <button
                type="button"
                className="hover:-translate-y-px block w-full cursor-pointer rounded-lg border border-border bg-muted p-3 text-center transition-all duration-200 hover:border-primary"
                onClick={() =>
                  navigate({
                    to:
                      location.pathname +
                      buildServiceDrawerSearch(location.search, {
                        name: service.name,
                        requestCount: service.requestCount,
                        errorCount: service.errorCount,
                        errorRate: service.errorRate,
                        avgLatency: service.avgLatency,
                        p95Latency: service.p95Latency,
                        p99Latency: service.p99Latency,
                      }),
                  })
                }
              >
                <HealthIndicator status={service.status} size={8} />
                <div className="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-foreground text-xs">
                  {service.name}
                </div>
                <div className="mt-0.5 text-[11px] text-foreground-muted">
                  {formatNumber(service.requestCount)} req
                </div>
                <div
                  className="mt-0.5 text-[11px]"
                  style={{
                    color: service.errorRate > 1 ? APP_COLORS.hex_f04438 : "var(--text-muted)",
                  }}
                >
                  {Math.max(0, Number(service.errorRate)).toFixed(2)}% err
                </div>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
          No services data available
        </div>
      )}
    </div>
  );
}
