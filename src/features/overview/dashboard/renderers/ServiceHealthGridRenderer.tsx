import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { buildServiceDrawerSearch } from "@/features/overview/components/serviceDrawerState";
import { APP_COLORS } from "@config/colorLiterals";
import { HealthIndicator } from "@shared/components/ui";
import type { DashboardPanelRendererProps } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useDashboardData } from "@shared/components/ui/dashboard/hooks/useDashboardData";
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
    return services.slice(0, 8).map((s: any) => {
      const requestCount = Number(s.request_count ?? 0);
      const errorCount = Number(s.error_count ?? 0);
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
      const status = errorRate > 5 ? "unhealthy" : errorRate > 1 ? "degraded" : "healthy";
      return {
        name: s.service_name,
        status,
        requestCount,
        errorCount,
        errorRate,
        avgLatency: Number(s.avg_latency ?? 0),
        p95Latency: Number(s.p95_latency ?? 0),
        p99Latency: Number(s.p99_latency ?? 0),
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
              <div
                className="hover:-translate-y-px cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-center transition-all duration-200 hover:border-[var(--color-primary)]"
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
                <div className="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[var(--text-primary)] text-xs">
                  {service.name}
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
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
              </div>
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
