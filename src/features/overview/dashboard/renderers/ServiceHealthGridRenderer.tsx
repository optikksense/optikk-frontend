import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { HealthIndicator } from '@shared/components/ui';
import { formatNumber } from '@shared/utils/formatters';
import { APP_COLORS } from '@config/colorLiterals';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';
import type { DashboardPanelRendererProps } from '@shared/components/ui/dashboard/dashboardPanelRegistry';

export function ServiceHealthGridRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const navigate = useNavigate();
  const { data: services } = useDashboardData(chartConfig, dataSources);

  const serviceHealth = useMemo(() => {
    return services.slice(0, 8).map((s: any) => {
      const requestCount = Number(s.request_count ?? 0);
      const errorCount = Number(s.error_count ?? 0);
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
      const status = errorRate > 5 ? 'unhealthy' : errorRate > 1 ? 'degraded' : 'healthy';
      return {
        name: s.service_name,
        status,
        requestCount,
        errorRate,
      };
    });
  }, [services]);

  return (
    <div className="h-full min-h-0 overflow-y-auto p-2">
      {serviceHealth.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 8,
            alignContent: 'start',
          }}
        >
          {serviceHealth.map((service) => (
            <div key={service.name}>
              <div
                className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-3 cursor-pointer transition-all duration-200 text-center hover:border-[var(--color-primary)] hover:-translate-y-px"
                onClick={() => navigate({ to: `/services/${encodeURIComponent(service.name)}` })}
              >
                <HealthIndicator status={service.status} size={8} />
                <div className="text-xs font-semibold text-[var(--text-primary)] mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  {service.name}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {formatNumber(service.requestCount)} req
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{
                    color: service.errorRate > 1 ? APP_COLORS.hex_f04438 : 'var(--text-muted)',
                  }}
                >
                  {Math.max(0, Number(service.errorRate)).toFixed(2)}% err
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
          No services data available
        </div>
      )}
    </div>
  );
}
