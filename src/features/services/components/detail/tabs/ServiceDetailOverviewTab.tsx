import { Surface } from '@/components/ui';

import type { DashboardTabDocument } from '@/types/dashboardConfig';

import DataTable from '@shared/components/ui/data-display/DataTable';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { formatDuration } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

interface ServiceDetailOverviewTabProps {
  config: DashboardTabDocument | null;
  timeSeries: any[];
  endpoints: any[];
  timeSeriesLoading: boolean;
  endpointsLoading: boolean;
  endpointColumns: any[];
}

/**
 * Overview tab for service detail page.
 */
export default function ServiceDetailOverviewTab({
  config,
  timeSeries,
  endpoints,
  timeSeriesLoading,
  endpointsLoading,
  endpointColumns,
}: ServiceDetailOverviewTabProps): JSX.Element {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={{
            'metrics-timeseries': timeSeries,
            'service-timeseries': timeSeries,
            'services-timeseries': timeSeries,
            'endpoint-breakdown': endpoints,
            'endpoint-metrics': endpoints,
            'endpoints-metrics': endpoints,
          }}
          isLoading={timeSeriesLoading}
        />
      </div>

      {endpoints.length > 0 && (
        <Surface elevation={1} padding="md" style={{ marginBottom: 24 }} className="chart-card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Top Endpoints by Latency</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...endpoints]
              .sort((left, right) => right.avg_latency - left.avg_latency)
              .slice(0, 10)
              .map((endpoint) => {
                const maxLatency = Math.max(...endpoints.map((item) => item.avg_latency || 0), 1);
                const percentage = (endpoint.avg_latency / maxLatency) * 100;
                return (
                  <div
                    key={`${endpoint.operation_name}-${endpoint.http_method}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div
                      className="font-mono"
                      style={{
                        width: 200,
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {endpoint.operation_name}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 20,
                        background: `var(--bg-tertiary, ${APP_COLORS.hex_1a1a1a_2})`,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background:
                            endpoint.avg_latency > 500
                              ? APP_COLORS.hex_f04438
                              : endpoint.avg_latency > 200
                                ? APP_COLORS.hex_f79009
                                : APP_COLORS.hex_73c991,
                          borderRadius: 4,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        minWidth: 60,
                        textAlign: 'right',
                      }}
                    >
                      {formatDuration(endpoint.avg_latency)}
                    </span>
                  </div>
                );
              })}
          </div>
        </Surface>
      )}

      <Surface elevation={1} padding="md" className="chart-card">
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Endpoints Breakdown</div>
        <DataTable
          data={{
            columns: endpointColumns,
            rows: endpoints,
            loading: endpointsLoading,
            rowKey: (record: any) => `${record.operation_name}-${record.http_method}`,
          }}
        />
      </Surface>
    </>
  );
}
