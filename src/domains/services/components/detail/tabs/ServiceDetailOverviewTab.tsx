import { APP_COLORS } from '@config/colorLiterals';
import { Card, Col, Row } from 'antd';

import DataTable from '@components/common/data-display/DataTable';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import type { DashboardRenderConfig } from '@/types/dashboardConfig';

import { formatDuration } from '@utils/formatters';

interface ServiceDetailOverviewTabProps {
  config: DashboardRenderConfig | null;
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
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
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
        </Col>
      </Row>

      {endpoints.length > 0 && (
        <Card title="Top Endpoints by Latency" style={{ marginBottom: 24 }} className="chart-card" size="small">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...endpoints]
              .sort((left, right) => right.avg_latency - left.avg_latency)
              .slice(0, 10)
              .map((endpoint) => {
                const maxLatency = Math.max(...endpoints.map((item) => item.avg_latency || 0), 1);
                const percentage = (endpoint.avg_latency / maxLatency) * 100;
                return (
                  <div key={`${endpoint.operation_name}-${endpoint.http_method}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 200, fontSize: 12, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {endpoint.operation_name}
                    </div>
                    <div style={{ flex: 1, height: 20, background: `var(--bg-tertiary, ${APP_COLORS.hex_1a1a1a_2})`, borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: endpoint.avg_latency > 500 ? APP_COLORS.hex_f04438 : endpoint.avg_latency > 200 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
                          borderRadius: 4,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}>
                      {formatDuration(endpoint.avg_latency)}
                    </span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      <Card title="Endpoints Breakdown" className="chart-card" size="small">
        <DataTable
          columns={endpointColumns}
          data={endpoints}
          loading={endpointsLoading}
          rowKey={(record: any) => `${record.operation_name}-${record.http_method}`}
        />
      </Card>
    </>
  );
}
