import { useMemo, useState } from 'react';
import { Row, Col, Card, Skeleton, Empty, Progress, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, Clock, Zap, Bell } from 'lucide-react';
import { v1Service } from '@services/v1Service';
import { alertService } from '@services/alertService';
import { formatNumber, formatDuration, formatRelativeTime } from '@utils/formatters';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useAppStore } from '@store/appStore';
import PageHeader from '@components/common/PageHeader';
import StatCard from '@components/common/StatCard';
import HealthIndicator from '@components/common/HealthIndicator';
import RequestChart from '@components/charts/RequestChart';
import ErrorRateChart from '@components/charts/ErrorRateChart';
import LatencyChart from '@components/charts/LatencyChart';
import './OverviewPage.css';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { selectedTeamId, timeRange } = useAppStore();
  const [selectedEndpointsRequests, setSelectedEndpointsRequests] = useState([]);
  const [selectedEndpointsErrorRate, setSelectedEndpointsErrorRate] = useState([]);
  const [selectedEndpointsLatency, setSelectedEndpointsLatency] = useState([]);

  // Metrics summary (primary source — spans table via v1 API)
  const { data: summaryRaw, isLoading: summaryLoading, error: summaryError } = useTimeRangeQuery(
    'metrics-summary',
    (teamId, start, end) => v1Service.getMetricsSummary(teamId, start, end)
  );

  // Metrics timeseries for charts
  const { data: timeseriesRaw } = useTimeRangeQuery(
    'metrics-timeseries',
    (teamId, start, end) => v1Service.getMetricsTimeSeries(teamId, start, end, null, '5m')
  );

  // Per-service timeseries from spans table
  const { data: serviceTimeseriesRaw } = useTimeRangeQuery(
    'service-timeseries',
    (teamId, start, end) => v1Service.getServiceTimeSeries(teamId, start, end, '5m')
  );

  // Service metrics for health grid - returns raw array
  const { data: servicesRaw } = useTimeRangeQuery(
    'services-metrics',
    (teamId, startTime, endTime) => v1Service.getServiceMetrics(teamId, startTime, endTime)
  );

  // Endpoint metrics for breakdown lists below charts
  const { data: endpointMetricsRaw } = useTimeRangeQuery(
    'endpoints-metrics',
    (teamId, startTime, endTime) => v1Service.getEndpointMetrics(teamId, startTime, endTime)
  );

  // Recent alerts (time-range aware)
  const { data: alertsData } = useTimeRangeQuery(
    'alerts-recent',
    (teamId, startTime, endTime) => alertService.getAlerts({ teamId, startTime, endTime })
  );

  // === Normalize data shapes ===

  // Summary from v1 API: flat {total_requests, error_rate, avg_latency, p95_latency, p99_latency}
  const summary = useMemo(() => {
    if (!summaryRaw) return {};
    const raw = summaryRaw;
    return {
      total_requests: raw.total_requests || 0,
      error_count: raw.error_count || 0,
      error_rate: raw.error_rate || 0,
      avg_latency: raw.avg_latency || 0,
      p95_latency: raw.p95_latency || 0,
      p99_latency: raw.p99_latency || 0,
    };
  }, [summaryRaw]);

  // Timeseries: v2 API returns array of {timestamp, request_count, error_count, avg_latency}
  const timeseries = useMemo(() => {
    if (!timeseriesRaw) return [];
    return Array.isArray(timeseriesRaw) ? timeseriesRaw : [];
  }, [timeseriesRaw]);

  // Per-service timeseries: group flat array into Map<serviceName, [{timestamp, request_count, error_count, avg_latency}]>
  const serviceTimeseriesMap = useMemo(() => {
    const raw = Array.isArray(serviceTimeseriesRaw) ? serviceTimeseriesRaw : [];
    const map = {};
    for (const row of raw) {
      const svc = row.service_name || 'unknown';
      if (!map[svc]) map[svc] = [];
      map[svc].push(row);
    }
    return map;
  }, [serviceTimeseriesRaw]);

  // Build chart-ready timeseries data
  const requestsTimeseries = useMemo(
    () => timeseries.map((d) => ({
      timestamp: d.timestamp,
      value: Number(d.request_count || 0),
    })),
    [timeseries]
  );

  const errorsTimeseries = useMemo(
    () => timeseries.map((d) => {
      const total = Number(d.request_count || 0);
      const errors = Number(d.error_count || 0);
      return {
        timestamp: d.timestamp,
        value: total > 0 ? (errors / total * 100) : 0,
      };
    }),
    [timeseries]
  );

  const latencyTimeseries = useMemo(
    () => timeseries.map((d) => {
      const avg = Number(d.avg_latency || 0);
      return {
        timestamp: d.timestamp,
        value: avg,
        // Use real backend percentiles when available (new dual-source backend), else approximate
        p50: Number(d.p50_latency || 0) || avg * 0.7,
        p95: Number(d.p95_latency || 0) || avg * 2.0,
        p99: Number(d.p99_latency || 0) || avg * 3.5,
      };
    }),
    [timeseries]
  );

  // Services: v2 API returns raw array
  const services = useMemo(() => {
    if (!servicesRaw) return [];
    return Array.isArray(servicesRaw) ? servicesRaw : [];
  }, [servicesRaw]);

  // Endpoint metrics: v2 API returns raw array
  const endpointMetrics = useMemo(() => {
    if (!endpointMetricsRaw) return [];
    return Array.isArray(endpointMetricsRaw) ? endpointMetricsRaw : [];
  }, [endpointMetricsRaw]);

  // Top endpoints sorted by request count
  const topEndpointsByRequests = useMemo(() => {
    return [...endpointMetrics]
      .sort((a, b) => (b.request_count || 0) - (a.request_count || 0))
      .slice(0, 10)
      .map(ep => ({
        ...ep,
        endpoint: `${ep.http_method || 'N/A'} ${ep.operation_name || ep.endpoint_name || 'Unknown'}`,
        service: ep.service_name,
        key: `${ep.http_method || 'N/A'}_${ep.operation_name || ep.endpoint_name || 'Unknown'}_${ep.service_name || ''}`,
      }));
  }, [endpointMetrics]);

  const handleEndpointToggleRequests = (endpointKey) => {
    setSelectedEndpointsRequests(prev => {
      if (prev.includes(endpointKey)) {
        return prev.filter(key => key !== endpointKey);
      } else {
        return [...prev, endpointKey];
      }
    });
  };

  // Top endpoints sorted by error rate
  const topEndpointsByErrorRate = useMemo(() => {
    return [...endpointMetrics]
      .map(ep => {
        const errorRate = ep.request_count > 0 ? (ep.error_count / ep.request_count) * 100 : 0;
        return { ...ep, errorRate };
      })
      .filter(ep => ep.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10)
      .map(ep => ({
        ...ep,
        endpoint: `${ep.http_method || 'N/A'} ${ep.operation_name || ep.endpoint_name || 'Unknown'}`,
        service: ep.service_name,
        key: `${ep.http_method || 'N/A'}_${ep.operation_name || ep.endpoint_name || 'Unknown'}_${ep.service_name || ''}`,
      }));
  }, [endpointMetrics]);

  const handleEndpointToggleErrorRate = (endpointKey) => {
    setSelectedEndpointsErrorRate(prev => {
      if (prev.includes(endpointKey)) {
        return prev.filter(key => key !== endpointKey);
      } else {
        return [...prev, endpointKey];
      }
    });
  };

  // Top endpoints sorted by latency
  const topEndpointsByLatency = useMemo(() => {
    return [...endpointMetrics]
      .sort((a, b) => (b.avg_latency || b.p95_latency || 0) - (a.avg_latency || a.p95_latency || 0))
      .slice(0, 10)
      .map(ep => ({
        ...ep,
        endpoint: `${ep.http_method || 'N/A'} ${ep.operation_name || ep.endpoint_name || 'Unknown'}`,
        service: ep.service_name,
        latency: ep.avg_latency || ep.p95_latency || 0,
        key: `${ep.http_method || 'N/A'}_${ep.operation_name || ep.endpoint_name || 'Unknown'}_${ep.service_name || ''}`,
      }));
  }, [endpointMetrics]);

  const handleEndpointToggleLatency = (endpointKey) => {
    setSelectedEndpointsLatency(prev => {
      if (prev.includes(endpointKey)) {
        return prev.filter(key => key !== endpointKey);
      } else {
        return [...prev, endpointKey];
      }
    });
  };

  const alerts = useMemo(() => {
    const raw = Array.isArray(alertsData) ? alertsData : alertsData?.content || [];
    return raw.slice(0, 5);
  }, [alertsData]);

  // Build sparkline data from timeseries
  const requestsSparkline = useMemo(
    () => requestsTimeseries.map((d) => d.value),
    [requestsTimeseries]
  );
  const errorsSparkline = useMemo(
    () => errorsTimeseries.map((d) => d.value),
    [errorsTimeseries]
  );
  const latencySparkline = useMemo(
    () => latencyTimeseries.map((d) => d.value),
    [latencyTimeseries]
  );

  // Compute SLO metrics
  const sloMetrics = useMemo(() => {
    const errorRate = summary.error_rate || 0;
    const availability = Math.max(0, 100 - errorRate);
    const p95 = summary.p95_latency || 0;
    const p95Target = 500; // 500ms target
    const p95Score = p95 > 0 ? Math.min(100, (p95Target / p95) * 100) : 100;
    const errorBudget = Math.max(0, (0.1 - errorRate / 100) / 0.1 * 100); // 99.9% SLO
    return { availability, p95Score, errorBudget };
  }, [summary]);

  // Service health grid data
  const serviceHealth = useMemo(() => {
    return services.slice(0, 8).map((s) => {
      const requestCount = Number(s.request_count || 0);
      const errorCount = Number(s.error_count || 0);
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
      const status = errorRate > 5 ? 'unhealthy' : errorRate > 1 ? 'degraded' : 'healthy';
      return {
        name: s.service_name,
        status,
        requestCount,
        errorRate,
        avgLatency: Number(s.avg_latency || 0),
      };
    });
  }, [services]);

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

  const severityColor = (sev) => {
    const colors = { critical: '#F04438', warning: '#F79009', info: '#06AED5' };
    return colors[sev?.toLowerCase()] || '#98A2B3';
  };

  return (
    <div className="overview-page">
      <PageHeader
        title="Overview"
        subtitle="Monitor your system health"
        icon={<Activity size={24} />}
      />

      {/* Key Metrics with Sparklines */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Requests"
            value={summary.total_requests || 0}
            formatter={formatNumber}
            trendInverted={false}
            icon={<Activity size={20} />}
            iconColor="#5E60CE"
            loading={summaryLoading}
            sparklineData={requestsSparkline}
            sparklineColor="#5E60CE"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Error Rate"
            value={Number((summary.error_rate || 0).toFixed(2))}
            trendInverted={true}
            icon={<AlertCircle size={20} />}
            iconColor="#F04438"
            loading={summaryLoading}
            suffix="%"
            sparklineData={errorsSparkline}
            sparklineColor="#F04438"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Latency"
            value={summary.avg_latency || 0}
            formatter={formatDuration}
            trendInverted={true}
            icon={<Clock size={20} />}
            iconColor="#F79009"
            loading={summaryLoading}
            sparklineData={latencySparkline}
            sparklineColor="#F79009"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="P95 Latency"
            value={summary.p95_latency || 0}
            formatter={formatDuration}
            trendInverted={true}
            icon={<Zap size={20} />}
            iconColor="#06AED5"
            loading={summaryLoading}
          />
        </Col>
      </Row>

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
                  strokeColor={sloMetrics.availability >= 99.9 ? '#73C991' : sloMetrics.availability >= 99 ? '#F79009' : '#F04438'}
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
                  strokeColor={sloMetrics.p95Score >= 90 ? '#73C991' : sloMetrics.p95Score >= 70 ? '#F79009' : '#F04438'}
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
                  strokeColor={sloMetrics.errorBudget >= 50 ? '#73C991' : sloMetrics.errorBudget >= 20 ? '#F79009' : '#F04438'}
                  format={(p) => `${p}%`}
                />
                <div className="slo-label">Error Budget</div>
                <div className="slo-target">Remaining</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Request Rate" className="chart-card">
            <RequestChart
              data={requestsTimeseries}
              endpoints={topEndpointsByRequests}
              selectedEndpoints={selectedEndpointsRequests}
              serviceTimeseriesMap={serviceTimeseriesMap}
            />
            {topEndpointsByRequests.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color, #2D2D2D)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Top Endpoints by Requests
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  paddingRight: 4,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border-color, #2D2D2D) var(--bg-secondary, #0D0D0D)'
                }}>
                  {topEndpointsByRequests.map((ep, idx) => {
                    const isSelected = selectedEndpointsRequests.includes(ep.key);
                    const isFaded = selectedEndpointsRequests.length > 0 && !isSelected;
                    return (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEndpointToggleRequests(ep.key);
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: isSelected ? 'rgba(94, 96, 206, 0.2)' : 'var(--bg-secondary, #0D0D0D)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          opacity: isFaded ? 0.3 : 1,
                          border: isSelected ? '1px solid #5E60CE' : '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isFaded) {
                            e.currentTarget.style.background = isSelected ? 'rgba(94, 96, 206, 0.3)' : 'var(--bg-tertiary, #1A1A1A)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isSelected ? 'rgba(94, 96, 206, 0.2)' : 'var(--bg-secondary, #0D0D0D)';
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ep.endpoint}
                          </div>
                          {ep.service && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {ep.service}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1890ff', marginLeft: 12 }}>
                          {formatNumber(ep.request_count || 0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Error Rate" className="chart-card">
            <ErrorRateChart
              data={errorsTimeseries}
              endpoints={topEndpointsByErrorRate}
              selectedEndpoints={selectedEndpointsErrorRate}
              serviceTimeseriesMap={serviceTimeseriesMap}
            />
            {topEndpointsByErrorRate.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color, #2D2D2D)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Top Endpoints by Error Rate
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  paddingRight: 4,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border-color, #2D2D2D) var(--bg-secondary, #0D0D0D)'
                }}>
                  {topEndpointsByErrorRate.map((ep, idx) => {
                    const isSelected = selectedEndpointsErrorRate.includes(ep.key);
                    const isFaded = selectedEndpointsErrorRate.length > 0 && !isSelected;
                    return (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEndpointToggleErrorRate(ep.key);
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: isSelected ? 'rgba(240, 68, 56, 0.2)' : 'var(--bg-secondary, #0D0D0D)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          opacity: isFaded ? 0.3 : 1,
                          border: isSelected ? '1px solid #F04438' : '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isFaded) {
                            e.currentTarget.style.background = isSelected ? 'rgba(240, 68, 56, 0.3)' : 'var(--bg-tertiary, #1A1A1A)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isSelected ? 'rgba(240, 68, 56, 0.2)' : 'var(--bg-secondary, #0D0D0D)';
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ep.endpoint}
                          </div>
                          {ep.service && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {ep.service}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: ep.errorRate > 5 ? '#F04438' : ep.errorRate > 1 ? '#F79009' : '#F79009', marginLeft: 12 }}>
                          {Number(ep.errorRate).toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Latency Distribution" className="chart-card">
            <LatencyChart
              data={latencyTimeseries}
              endpoints={topEndpointsByLatency}
              selectedEndpoints={selectedEndpointsLatency}
              serviceTimeseriesMap={serviceTimeseriesMap}
            />
            {topEndpointsByLatency.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color, #2D2D2D)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Top Endpoints by Latency
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  paddingRight: 4,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border-color, #2D2D2D) var(--bg-secondary, #0D0D0D)'
                }}>
                  {topEndpointsByLatency.map((ep, idx) => {
                    const isSelected = selectedEndpointsLatency.includes(ep.key);
                    const isFaded = selectedEndpointsLatency.length > 0 && !isSelected;
                    return (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEndpointToggleLatency(ep.key);
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: isSelected ? 'rgba(247, 144, 9, 0.2)' : 'var(--bg-secondary, #0D0D0D)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          opacity: isFaded ? 0.3 : 1,
                          border: isSelected ? '1px solid #F79009' : '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isFaded) {
                            e.currentTarget.style.background = isSelected ? 'rgba(247, 144, 9, 0.3)' : 'var(--bg-tertiary, #1A1A1A)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isSelected ? 'rgba(247, 144, 9, 0.2)' : 'var(--bg-secondary, #0D0D0D)';
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ep.endpoint}
                          </div>
                          {ep.service && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {ep.service}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: ep.latency > 500 ? '#F04438' : ep.latency > 200 ? '#F79009' : '#73C991', marginLeft: 12 }}>
                          {formatDuration(ep.latency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Service Health Grid + Recent Alerts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Service Health" className="chart-card">
            {serviceHealth.length > 0 ? (
              <Row gutter={[8, 8]}>
                {serviceHealth.map((service) => (
                  <Col xs={12} sm={8} md={6} key={service.name}>
                    <div
                      className="service-health-card"
                      onClick={() => navigate(`/services/${encodeURIComponent(service.name)}`)}
                    >
                      <HealthIndicator status={service.status} size="small" />
                      <div className="service-health-name">{service.name}</div>
                      <div className="service-health-metric">
                        {formatNumber(service.requestCount)} req
                      </div>
                      <div className="service-health-metric" style={{ color: service.errorRate > 1 ? '#F04438' : 'var(--text-muted)' }}>
                        {Number(service.errorRate).toFixed(2)}% err
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

        <Col xs={24} lg={12}>
          <Card
            title={<span><Bell size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Recent Alerts</span>}
            className="chart-card"
          >
            {alerts.length > 0 ? (
              <div className="recent-alerts-list">
                {alerts.map((alert, index) => (
                  <div key={alert.id || index} className="recent-alert-item">
                    <span
                      className="alert-severity-dot"
                      style={{ backgroundColor: severityColor(alert.severity) }}
                    />
                    <div className="alert-info">
                      <div className="alert-name">{alert.name}</div>
                      <div className="alert-meta">
                        {alert.serviceName && <Tag style={{ fontSize: 11 }}>{alert.serviceName}</Tag>}
                        <span className="alert-time">
                          {alert.triggeredAt ? formatRelativeTime(alert.triggeredAt) : ''}
                        </span>
                      </div>
                    </div>
                    <Tag
                      color={alert.status === 'ACTIVE' ? 'error' : alert.status === 'ACKNOWLEDGED' ? 'warning' : 'success'}
                      style={{ fontSize: 11 }}
                    >
                      {alert.status}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No recent alerts" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
