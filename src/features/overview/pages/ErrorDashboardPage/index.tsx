import { Badge, Select, Skeleton, Surface, Tooltip, SimpleTable } from '@/components/ui';
import { AlertCircle, ExternalLink, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '@shared/components/ui/layout/PageHeader';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { metricsService } from '@shared/api/metricsService';
import type {
  ErrorGroupDto,
  MetricsTimeSeriesPointDto,
} from '@shared/api/schemas/metricsSchemas';
import type { ServiceSummary } from '@shared/api/schemas/servicesSchemas';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

import { formatNumber, formatRelativeTime } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

const n = (value: unknown) => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

const normalizeErrorGroup = (row: ErrorGroupDto) => ({
  service_name: row.service_name,
  operation_name: row.operation_name,
  status_message: row.status_message,
  http_status_code: row.http_status_code,
  error_count: row.error_count,
  last_occurrence: row.last_occurrence,
  sample_trace_id: row.sample_trace_id,
});

const normalizeServiceMetric = (row: ServiceSummary) => ({
  service_name: row.service_name,
  request_count: row.request_count,
  error_count: row.error_count,
  avg_latency: row.avg_latency,
  p95_latency: row.p95_latency,
  p99_latency: row.p99_latency,
});

const normalizeTimeSeriesPoint = (row: MetricsTimeSeriesPointDto) => ({
  timestamp: row.timestamp || row.time_bucket || '',
  service_name: row.service_name,
  request_count: row.request_count,
  error_count: row.error_count,
  avg_latency: row.avg_latency,
});

/**
 *
 */
export default function ErrorDashboardPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { config } = useDashboardConfig('error-dashboard');

  const { data: serviceErrorRateRaw, isLoading: errorRateLoading } = useTimeRangeQuery(
    'overview-service-error-rate',
    (teamId, start, end) =>
      metricsService.getServiceErrorRate(teamId, start, end, selectedService || undefined, '5m'),
    { extraKeys: [selectedService] },
  );

  const { data: errorVolumeRaw, isLoading: errorVolumeLoading } = useTimeRangeQuery(
    'overview-error-volume',
    (teamId, start, end) =>
      metricsService.getErrorVolume(teamId, start, end, selectedService || undefined, '5m'),
    { extraKeys: [selectedService] },
  );

  const { data: latencyWindowsRaw, isLoading: latencyLoading } = useTimeRangeQuery(
    'overview-error-latency-windows',
    (teamId, start, end) =>
      metricsService.getLatencyDuringErrorWindows(teamId, start, end, selectedService || undefined, '5m'),
    { extraKeys: [selectedService] },
  );

  const { data: errorGroupsRaw, isLoading: groupsLoading } = useTimeRangeQuery(
    'error-groups-global',
    (teamId, start, end) =>
      metricsService.getOverviewErrorGroups(teamId, start, end, { serviceName: selectedService as string, limit: 100 }),
    { extraKeys: [selectedService] },
  );

  // Service metrics for the filter dropdown and breakdown list
  const { data: serviceMetricsRaw } = useTimeRangeQuery(
    'overview-services-errors',
    (teamId, start, end) => metricsService.getOverviewServices(teamId, start, end),
  );

  const errorGroups = useMemo(() => {
    if (!errorGroupsRaw) return [];
    return Array.isArray(errorGroupsRaw) ? errorGroupsRaw.map(normalizeErrorGroup) : [];
  }, [errorGroupsRaw]);

  const normalizedServiceMetrics = useMemo(
    () => (Array.isArray(serviceMetricsRaw) ? serviceMetricsRaw.map(normalizeServiceMetric) : []),
    [serviceMetricsRaw],
  );
  const normalizedServiceErrorRate = useMemo(
    () => (Array.isArray(serviceErrorRateRaw) ? serviceErrorRateRaw.map(normalizeTimeSeriesPoint) : []),
    [serviceErrorRateRaw],
  );
  const normalizedErrorVolume = useMemo(
    () => (Array.isArray(errorVolumeRaw) ? errorVolumeRaw.map(normalizeTimeSeriesPoint) : []),
    [errorVolumeRaw],
  );
  const normalizedLatencyWindows = useMemo(
    () => (Array.isArray(latencyWindowsRaw) ? latencyWindowsRaw.map(normalizeTimeSeriesPoint) : []),
    [latencyWindowsRaw],
  );

  const services = useMemo(() => {
    return normalizedServiceMetrics.map((s) => s.service_name).filter(Boolean);
  }, [normalizedServiceMetrics]);

  const statusColor = (code: any) => {
    const n = Number(code);
    if (n >= 500) return APP_COLORS.hex_f04438;
    if (n >= 400) return APP_COLORS.hex_f79009;
    return APP_COLORS.hex_98a2b3;
  };

  const columns: any[] = [
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (v: string) => (
        <Badge variant="default" style={{ background: APP_COLORS.rgba_94_96_206_0p15_2, color: APP_COLORS.hex_5e60ce, border: `1px solid ${APP_COLORS.rgba_94_96_206_0p3_2}` }}>
          {v}
        </Badge>
      ),
      filters: services.map((s) => ({ text: s, value: s })),
      onFilter: (value: any, record: any) => record.service_name === value,
    },
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      render: (v: string) => (
        <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{v}</span>
      ),
    },
    {
      title: 'HTTP',
      dataIndex: 'http_status_code',
      key: 'http_status_code',
      width: 70,
      render: (v: any) => v ? (
        <Badge variant="default" style={{ color: statusColor(v), borderColor: statusColor(v), background: 'transparent' }}>
          {v}
        </Badge>
      ) : '-',
    },
    {
      title: 'Error Message',
      dataIndex: 'status_message',
      key: 'status_message',
      ellipsis: true,
      render: (v: string) => (
        <Tooltip content={v}>
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {v || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'error_count',
      key: 'error_count',
      width: 100,
      align: 'right',
      sorter: (a: any, b: any) => Number(a.error_count) - Number(b.error_count),
      defaultSortOrder: 'descend' as const,
      render: (v: any) => (
        <span style={{ fontWeight: 700, color: APP_COLORS.hex_f04438, fontSize: 13 }}>
          {formatNumber(Number(v))}
        </span>
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_occurrence',
      key: 'last_occurrence',
      width: 130,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {v ? formatRelativeTime(v) : '-'}
        </span>
      ),
    },
    {
      title: 'Sample Trace',
      dataIndex: 'sample_trace_id',
      key: 'sample_trace_id',
      width: 120,
      render: (v: string) => v ? (
        <span
          style={{ color: APP_COLORS.hex_5e60ce, cursor: 'pointer', fontSize: 12 }}
          onClick={() => navigate(`/traces/${v}`)}
        >
          <ExternalLink size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          View Trace
        </span>
      ) : '-',
    },
  ];

  return (
    <div className="p-0">
      <PageHeader
        title="Error Dashboard"
        subtitle="Error trends, breakdowns, and grouped error logs across all services"
        icon={<AlertCircle size={24} />}
        actions={
          <Select
            placeholder="All Services"
            allowClear
            style={{ width: 200 }}
            value={selectedService}
            onChange={setSelectedService}
            options={services.map((s) => ({ label: s, value: s }))}
          />
        }
      />

      {/* Configurable Dashboard Charts */}
      <ConfigurableDashboard
        config={config}
        dataSources={{
          'service-error-rate': normalizedServiceErrorRate,
          'error-volume': normalizedErrorVolume,
          'latency-during-error-windows': normalizedLatencyWindows,
          'error-groups': errorGroups,
        }}
        isLoading={errorRateLoading || errorVolumeLoading || latencyLoading}
      />

      {/* Error Groups Table */}
      <div style={{ marginTop: 16 }}>
        <Surface elevation={1} padding="md" className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
          <h4>
            Error Groups
            {!groupsLoading && (
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 12 }}>
                {errorGroups.length} groups
              </span>
            )}
          </h4>
            {groupsLoading ? (
              <Skeleton />
            ) : errorGroups.length === 0 ? (
              <div className="text-muted" style={{textAlign:'center',padding:32}}>No errors in selected time range</div>
            ) : (
              <SimpleTable
                dataSource={errorGroups.map((g: any, i: number) => ({ ...g, key: i }))}
                columns={columns}
                size="small"
                pagination={{ pageSize: 20, showSizeChanger: true }}
                scroll={{ x: 900 }}
                rowClassName={(record: any) =>
                  Number(record.error_count) > 100 ? 'high-error-row' : ''
                }
              />
            )}
        </Surface>
      </div>
    </div>
  );
}
