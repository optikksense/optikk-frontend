import { useMemo, useState } from 'react';
import { Row, Col, Card, Skeleton, Empty, Progress, Tag, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, Clock, Zap, Bell, Pencil } from 'lucide-react';
import { v1Service } from '@services/v1Service';
import { alertService } from '@services/alertService';
import { formatNumber, formatDuration, formatRelativeTime } from '@utils/formatters';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig, useSaveDashboardConfig } from '@hooks/useDashboardConfig';
import { useTemplateVariables } from '@hooks/useTemplateVariables';
import { useAppStore } from '@store/appStore';
import { useDashboardBuilderStore } from '@store/dashboardBuilderStore';
import { PageHeader, StatCard, StatCardsGrid, HealthIndicator } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import DashboardBuilder from '@components/dashboard/DashboardBuilder';
import TemplateVariableBar from '@components/dashboard/TemplateVariableBar';
import VersionHistory from '@components/dashboard/VersionHistory';
import ShareDashboardModal from '@components/dashboard/ShareDashboardModal';
import { configToYaml } from '@utils/yamlHelpers';
import './OverviewPage.css';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { config } = useDashboardConfig('overview');
  const saveMutation = useSaveDashboardConfig('overview');
  const { isEditMode, enterEditMode, exitEditMode, dirtyConfig } = useDashboardBuilderStore();
  const templateVars = useTemplateVariables(config?.variables || []);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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

  // Per-endpoint timeseries from backend
  const { data: endpointTimeseriesRaw } = useTimeRangeQuery(
    'endpoints-timeseries',
    (teamId, start, end) => v1Service.getEndpointTimeSeries(teamId, start, end)
  );

  // Service metrics for health grid
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
  const summary = useMemo(() => {
    if (!summaryRaw) return {};
    return {
      total_requests: summaryRaw.total_requests || 0,
      error_count: summaryRaw.error_count || 0,
      error_rate: summaryRaw.error_rate || 0,
      avg_latency: summaryRaw.avg_latency || 0,
      p95_latency: summaryRaw.p95_latency || 0,
      p99_latency: summaryRaw.p99_latency || 0,
    };
  }, [summaryRaw]);

  const timeseries = useMemo(() => {
    if (!timeseriesRaw) return [];
    return Array.isArray(timeseriesRaw) ? timeseriesRaw : [];
  }, [timeseriesRaw]);

  // Build sparkline data from timeseries
  const requestsSparkline = useMemo(
    () => timeseries.map((d) => Number(d.request_count || 0)),
    [timeseries]
  );
  const errorsSparkline = useMemo(
    () => timeseries.map((d) => {
      const total = Number(d.request_count || 0);
      const errors = Number(d.error_count || 0);
      return total > 0 ? (errors / total * 100) : 0;
    }),
    [timeseries]
  );
  const latencySparkline = useMemo(
    () => timeseries.map((d) => Number(d.avg_latency || 0)),
    [timeseries]
  );

  // Services
  const services = useMemo(() => {
    if (!servicesRaw) return [];
    return Array.isArray(servicesRaw) ? servicesRaw : [];
  }, [servicesRaw]);

  // Compute SLO metrics
  const sloMetrics = useMemo(() => {
    const errorRate = summary.error_rate || 0;
    const availability = Math.max(0, 100 - errorRate);
    const p95 = summary.p95_latency || 0;
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

  const alerts = useMemo(() => {
    const raw = Array.isArray(alertsData) ? alertsData : alertsData?.content || [];
    return raw.slice(0, 5);
  }, [alertsData]);

  // Data sources for ConfigurableDashboard
  const dataSources = useMemo(() => ({
    'metrics-summary': summaryRaw,
    'metrics-timeseries': timeseries,
    'endpoints-timeseries': Array.isArray(endpointTimeseriesRaw) ? endpointTimeseriesRaw : [],
    'endpoints-metrics': Array.isArray(endpointMetricsRaw) ? endpointMetricsRaw : [],
  }), [summaryRaw, timeseries, endpointTimeseriesRaw, endpointMetricsRaw]);

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
        actions={
          !isEditMode && (
            <Button
              icon={<Pencil size={14} />}
              onClick={() => config && enterEditMode(config)}
              disabled={!config}
              size="small"
            >
              Edit Dashboard
            </Button>
          )
        }
      />

      {/* Key Metrics with Sparklines */}
      <StatCardsGrid
        stats={[
          {
            title: "Total Requests",
            value: summary.total_requests || 0,
            formatter: formatNumber,
            trendInverted: false,
            icon: <Activity size={20} />,
            iconColor: "#5E60CE",
            loading: summaryLoading,
            sparklineData: requestsSparkline,
            sparklineColor: "#5E60CE"
          },
          {
            title: "Error Rate",
            value: Number((summary.error_rate || 0).toFixed(2)),
            trendInverted: true,
            icon: <AlertCircle size={20} />,
            iconColor: "#F04438",
            loading: summaryLoading,
            suffix: "%",
            sparklineData: errorsSparkline,
            sparklineColor: "#F04438"
          },
          {
            title: "Avg Latency",
            value: summary.avg_latency || 0,
            formatter: formatDuration,
            trendInverted: true,
            icon: <Clock size={20} />,
            iconColor: "#F79009",
            loading: summaryLoading,
            sparklineData: latencySparkline,
            sparklineColor: "#F79009"
          },
          {
            title: "P95 Latency",
            value: summary.p95_latency || 0,
            formatter: formatDuration,
            trendInverted: true,
            icon: <Zap size={20} />,
            iconColor: "#06AED5",
            loading: summaryLoading
          }
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

      {/* Template Variables */}
      {!isEditMode && config?.variables?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <TemplateVariableBar
            variables={templateVars.variablesWithOptions}
            values={templateVars.values}
            onChange={templateVars.setVariable}
          />
        </div>
      )}

      {/* Charts — driven by YAML config */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          {isEditMode ? (
            <DashboardBuilder
              pageId="overview"
              dataSources={dataSources}
              onSave={(yamlStr) => saveMutation.mutateAsync(yamlStr)}
              onExit={exitEditMode}
              onVersionHistory={() => setVersionHistoryOpen(true)}
              onShare={() => setShareOpen(true)}
              templateVariables={templateVars}
            />
          ) : (
            <ConfigurableDashboard
              config={config}
              dataSources={dataSources}
              isLoading={summaryLoading}
            />
          )}
        </Col>
      </Row>

      {/* Service Health Grid + Recent Alerts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Service Health" className="chart-card">
            {serviceHealth.length > 0 ? (
              <Row gutter={[16, 16]}>
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

      {/* Version History Drawer */}
      <VersionHistory
        open={versionHistoryOpen}
        pageId="overview"
        currentYaml={dirtyConfig ? configToYaml(dirtyConfig) : (config ? configToYaml(config) : '')}
        onClose={() => setVersionHistoryOpen(false)}
        onRollback={exitEditMode}
      />

      {/* Share Modal */}
      <ShareDashboardModal
        open={shareOpen}
        pageId="overview"
        templateVariables={templateVars}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
