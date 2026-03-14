import { Row, Col, Card, Skeleton, Empty, Progress } from 'antd';
import { Activity, AlertCircle, Clock, Zap, Server } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  normalizeMetricSummary,
  normalizeTimeSeriesPoint,
  normalizeServiceMetric,
  normalizeEndpointMetric,
} from '@features/metrics/utils/metricNormalizers';

import { PageHeader, StatCardsGrid, HealthIndicator } from '@shared/components/ui';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { metricsService } from '@shared/api/metricsService';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

import { formatNumber, formatDuration } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';
import './OverviewPage.css';

/**
 *
 */
export default function OverviewPage() {
  const navigate = useNavigate();
  const { config } = useDashboardConfig('overview');

  // Metrics summary (primary source — spans table via v1 API)
  const { data: summaryRaw, isLoading: summaryLoading, error: summaryError } = useTimeRangeQuery(
    'metrics-summary',
    (teamId, start, end) => metricsService.getOverviewSummary(teamId, start, end),
  );

  // Metrics timeseries for charts
  const { data: timeseriesRaw } = useTimeRangeQuery(
    'metrics-timeseries',
    (teamId, start, end) => metricsService.getOverviewTimeSeries(teamId, start, end, undefined, '5m'),
  );

  // Per-endpoint timeseries from backend
  const { data: endpointTimeseriesRaw } = useTimeRangeQuery(
    'endpoints-timeseries',
    (teamId, start, end) => metricsService.getOverviewEndpointTimeSeries(teamId, start, end),
  );

  // Service metrics for health grid
  const { data: servicesRaw } = useTimeRangeQuery(
    'services-metrics',
    (teamId, startTime, endTime) => metricsService.getOverviewServices(teamId, startTime, endTime),
  );

  // Endpoint metrics for breakdown lists below charts
  const { data: endpointMetricsRaw } = useTimeRangeQuery(
    'endpoints-metrics',
    (teamId, startTime, endTime) => metricsService.getOverviewEndpointMetrics(teamId, startTime, endTime),
  );

  // === Normalize data shapes ===
  const summary = useMemo(() => {
    return normalizeMetricSummary(summaryRaw ?? {});
  }, [summaryRaw]);

  const timeseries = useMemo(() => {
    if (!timeseriesRaw) return [];
    return Array.isArray(timeseriesRaw) ? timeseriesRaw.map(normalizeTimeSeriesPoint) : [];
  }, [timeseriesRaw]);

  // Build sparkline data from timeseries
  const requestsSparkline = useMemo(
    () => timeseries.map((d) => Number(d.request_count || 0)),
    [timeseries],
  );
  const errorsSparkline = useMemo(
    () => timeseries.map((d) => {
      const total = Number(d.request_count || 0);
      const errors = Number(d.error_count || 0);
      return total > 0 ? (errors / total * 100) : 0;
    }),
    [timeseries],
  );
  const latencySparkline = useMemo(
    () => timeseries.map((d) => Number(d.avg_latency || 0)),
    [timeseries],
  );

  // Services
  const services = useMemo(() => {
    if (!servicesRaw) return [];
    return Array.isArray(servicesRaw) ? servicesRaw.map(normalizeServiceMetric) : [];
  }, [servicesRaw]);

  // Compute SLO metrics
  const sloMetrics = useMemo(() => {
    const errorRate = (summary).error_rate || 0;
    const availability = Math.max(0, 100 - errorRate);
    const p95 = (summary).p95_latency || 0;
    const p95Target = 500;
    const p95Score = p95 > 0 ? Math.min(100, (p95Target / p95) * 100) : 100;
    const errorBudget = Math.max(0, (0.1 - errorRate / 100) / 0.1 * 100);
    return { availability, p95Score, errorBudget };
  }, [summary]);

  // Service health grid data
  const serviceHealth = useMemo(() => {
    return services.slice(0, 8).map((s) => {
      const requestCount = Number(s.request_count || 0);
      const errorCount = Number(s.error_count || 0);
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
      const status = errorRate > 5 ? 'unhealthy' : errorRate > 1 ? 'degraded' : 'healthy';
      return { name: s.service_name, status, requestCount, errorRate, avgLatency: Number(s.avg_latency || 0) };
    });
  }, [services]);

  // Data sources for ConfigurableDashboard
  const dataSources = useMemo(() => ({
    'metrics-summary': summary,
    'metrics-timeseries': timeseries,
    'endpoints-timeseries': Array.isArray(endpointTimeseriesRaw) ? endpointTimeseriesRaw.map(normalizeTimeSeriesPoint) : [],
    'endpoints-metrics': Array.isArray(endpointMetricsRaw) ? endpointMetricsRaw.map(normalizeEndpointMetric) : [],
  }), [summary, timeseries, endpointTimeseriesRaw, endpointMetricsRaw]);

  if (summaryLoading && timeseries.length === 0) {
    return (
      <div className="overview-page">
        <PageHeader title="Overview" subtitle="Monitor your system health" icon={<Activity size={24} />} />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card><Skeleton active paragraph={{ rows: 2 }} /></Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
          <Col xs={24} lg={12}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
        </Row>
      </div>
    );
  }

  if (summaryError && timeseries.length === 0) {
    return (
      <div className="page-error">
        <Empty description={summaryError.message || 'Failed to load overview data'} />
      </div>
    );
  }

  return (
    <div className="overview-page">
      <PageHeader
        title="Overview"
        subtitle="Monitor your system health"
        icon={<Activity size={24} />}
      />

      {/* Key Metrics with Sparklines */}
      <StatCardsGrid
        style={{ marginBottom: 24 }}
        className="overview-stats-grid"
        stats={[
          {
            metric: {
              title: 'Total Requests',
              value: (summary).total_requests || 0,
              formatter: formatNumber,
            },
            trend: { value: 0 },
            visuals: {
              icon: <Activity size={20} />,
              iconColor: APP_COLORS.hex_5e60ce,
              loading: summaryLoading,
              sparklineData: requestsSparkline,
              sparklineColor: APP_COLORS.hex_5e60ce,
            },
          },
          {
            metric: {
              title: 'Error Rate',
              value: Number(Math.max(0, (summary).error_rate || 0).toFixed(2)),
              suffix: '%',
            },
            trend: { value: 0, inverted: true },
            visuals: {
              icon: <AlertCircle size={20} />,
              iconColor: APP_COLORS.hex_f04438,
              loading: summaryLoading,
              sparklineData: errorsSparkline,
              sparklineColor: APP_COLORS.hex_f04438,
            },
          },
          {
            metric: {
              title: 'Avg Latency',
              value: (summary).avg_latency || 0,
              formatter: formatDuration,
            },
            trend: { value: 0, inverted: true },
            visuals: {
              icon: <Clock size={20} />,
              iconColor: APP_COLORS.hex_f79009,
              loading: summaryLoading,
              sparklineData: latencySparkline,
              sparklineColor: APP_COLORS.hex_f79009,
            },
          },
          {
            metric: {
              title: 'P95 Latency',
              value: (summary).p95_latency || 0,
              formatter: formatDuration,
            },
            trend: { value: 0, inverted: true },
            visuals: {
              icon: <Zap size={20} />,
              iconColor: APP_COLORS.hex_06aed5,
              loading: summaryLoading,
            },
          },
        ]}
      />

      {/* SLO Indicators */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="SLO Indicators" className="chart-card">
            <div className="slo-row">
              <div className="slo-item">
                <Progress
                  type="circle"
                  percent={Number(sloMetrics.availability.toFixed(2))}
                  size={80}
                  strokeColor={sloMetrics.availability >= 99.9 ? APP_COLORS.hex_73c991 : sloMetrics.availability >= 99 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_f04438}
                  format={(p) => `${p}%`}
                />
                <div className="slo-label">Availability</div>
                <div className="slo-target">Target: 99.9%</div>
              </div>
              <div className="slo-item">
                <Progress
                  type="circle"
                  percent={Number(sloMetrics.p95Score.toFixed(0))}
                  size={80}
                  strokeColor={sloMetrics.p95Score >= 90 ? APP_COLORS.hex_73c991 : sloMetrics.p95Score >= 70 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_f04438}
                  format={(p) => `${p}%`}
                />
                <div className="slo-label">P95 Latency</div>
                <div className="slo-target">Target: &lt;500ms</div>
              </div>
              <div className="slo-item">
                <Progress
                  type="circle"
                  percent={Number(Math.max(0, sloMetrics.errorBudget).toFixed(0))}
                  size={80}
                  strokeColor={sloMetrics.errorBudget >= 50 ? APP_COLORS.hex_73c991 : sloMetrics.errorBudget >= 20 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_f04438}
                  format={(p) => `${p}%`}
                />
                <div className="slo-label">Error Budget</div>
                <div className="slo-target">Remaining</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts — driven by YAML config */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <ConfigurableDashboard
            config={config}
            dataSources={dataSources}
            isLoading={summaryLoading}
          />
        </Col>
      </Row>

      {/* Service Health Grid */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={24}>
          <Card title={<span><Server style={{ marginRight: 8, verticalAlign: 'middle' }} />Services Overview</span>} className="services-overview-card" bodyStyle={{ padding: 0 }}>
            {serviceHealth.length > 0 ? (
              <Row gutter={[16, 16]}>
                {serviceHealth.map((service) => (
                  <Col xs={12} sm={8} md={6} key={service.name}>
                    <div
                      className="service-health-card"
                      onClick={() => navigate(`/services/${encodeURIComponent(service.name)}`)}
                    >
                      <HealthIndicator status={service.status} size={8} />
                      <div className="service-health-name">{service.name}</div>
                      <div className="service-health-metric">
                        {formatNumber(service.requestCount)} req
                      </div>
                      <div
                        className={service.errorRate >= 99.5 ? 'error-badge' : 'service-health-metric'}
                        style={service.errorRate < 99.5 ? { color: service.errorRate > 1 ? APP_COLORS.hex_f04438 : 'var(--text-muted)' } : undefined}
                      >
                        {Math.max(0, Number(service.errorRate)).toFixed(2)}% err
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No services data available" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
