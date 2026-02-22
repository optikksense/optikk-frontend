import { useState, useMemo, useEffect } from 'react';
import { Row, Col, Card, Spin, Empty, Switch, Tag, Tabs, Progress } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BarChart3, Activity, AlertCircle, Clock, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { v1Service } from '@services/v1Service';
import { dashboardService } from '@services/dashboardService';
import { PageHeader, FilterBar, StatCard, StatCardsGrid, TopEndpointsList } from '@components/common';
import RequestChart from '@components/charts/RequestChart';
import LatencyChart from '@components/charts/LatencyChart';
import ErrorRateChart from '@components/charts/ErrorRateChart';
import SparklineChart from '@components/charts/SparklineChart';
import { formatNumber, formatDuration } from '@utils/formatters';
import LatencyAnalysisPage from './LatencyAnalysisPage';

export default function MetricsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const [selectedService, setSelectedService] = useState(null);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'latency' ? 'latency' : 'overview');
  const [selectedEndpointsRequests, setSelectedEndpointsRequests] = useState([]);
  const [selectedEndpointsErrorRate, setSelectedEndpointsErrorRate] = useState([]);
  const [selectedEndpointsLatency, setSelectedEndpointsLatency] = useState([]);

  useEffect(() => {
    const queryTab = searchParams.get('tab') === 'latency' ? 'latency' : 'overview';
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab]);

  const getTimeRange = () => {
    const endTime = Date.now();
    const startTime = endTime - timeRange.minutes * 60 * 1000;
    return { startTime, endTime };
  };

  const { data: servicesData } = useQuery({
    queryKey: ['services', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return dashboardService.getServices(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['metrics-summary', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return v1Service.getMetricsSummary(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId,
  });

  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['metrics-timeseries', selectedTeamId, timeRange.value, selectedService, showErrorsOnly, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return v1Service.getMetricsTimeSeries(selectedTeamId, startTime, endTime, selectedService, '5m');
    },
    enabled: !!selectedTeamId,
  });

  const { data: serviceMetricsData } = useQuery({
    queryKey: ['service-metrics', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return v1Service.getServiceMetrics(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId && activeTab === 'services',
  });

  // Endpoint metrics for breakdown lists below charts
  const { data: endpointMetricsData } = useQuery({
    queryKey: ['endpoints-metrics', selectedTeamId, timeRange.value, selectedService, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return v1Service.getEndpointMetrics(selectedTeamId, startTime, endTime, selectedService);
    },
    enabled: !!selectedTeamId,
  });

  const services = servicesData || [];
  const metrics = showErrorsOnly ? metricsData?.filter(m => m.error_count > 0) || [] : metricsData || [];
  const summary = summaryData || {};
  const serviceMetrics = serviceMetricsData || [];
  const endpointMetrics = Array.isArray(endpointMetricsData) ? endpointMetricsData : [];

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

  // Calculate trends
  const trends = useMemo(() => {
    if (!metricsData || metricsData.length < 2) return {};
    const recent = metricsData.slice(-10);
    const older = metricsData.slice(0, 10);

    const recentAvg = recent.reduce((sum, m) => sum + (m.request_count || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + (m.request_count || 0), 0) / older.length;
    const requestTrend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    const recentErrorRate = recent.reduce((sum, m) => {
      const total = m.request_count || 0;
      const errors = m.error_count || 0;
      return sum + (total > 0 ? (errors / total) * 100 : 0);
    }, 0) / recent.length;
    const olderErrorRate = older.reduce((sum, m) => {
      const total = m.request_count || 0;
      const errors = m.error_count || 0;
      return sum + (total > 0 ? (errors / total) * 100 : 0);
    }, 0) / older.length;
    const errorTrend = olderErrorRate > 0 ? ((recentErrorRate - olderErrorRate) / olderErrorRate) * 100 : 0;

    return { requestTrend, errorTrend };
  }, [metricsData]);

  const serviceOptions = [
    { label: 'All Services', value: null },
    ...services.map((s) => ({ label: s.service_name || s.serviceName, value: s.service_name || s.serviceName })),
  ];

  const onTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const next = new URLSearchParams(searchParams);
    if (tabKey === 'latency') {
      next.set('tab', 'latency');
    } else {
      next.delete('tab');
    }
    setSearchParams(next, { replace: true });
  };

  // Build sparklines
  const requestSparkline = useMemo(() => {
    return (metrics || []).map(m => m.request_count || 0);
  }, [metrics]);

  const errorSparkline = useMemo(() => {
    return (metrics || []).map(m => {
      const total = m.request_count || 0;
      const errors = m.error_count || 0;
      return total > 0 ? (errors / total) * 100 : 0;
    });
  }, [metrics]);

  const latencySparkline = useMemo(() => {
    return (metrics || []).map(m => m.avg_latency || 0);
  }, [metrics]);

  return (
    <div className="metrics-page">
      <PageHeader
        title="Metrics"
        icon={<BarChart3 size={24} />}
        subtitle="System-wide performance metrics"
      />

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'service',
            placeholder: 'All Services',
            options: serviceOptions,
            value: selectedService,
            onChange: setSelectedService,
            width: 200,
          },
        ]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} style={{ color: showErrorsOnly ? '#F04438' : 'var(--text-muted)' }} />
            <span style={{ fontSize: 13, color: showErrorsOnly ? '#F04438' : 'var(--text-muted)' }}>Errors Only</span>
            <Switch size="small" checked={showErrorsOnly} onChange={setShowErrorsOnly} />
          </div>
        }
      />

      {/* Enhanced Stats Cards with Trends */}
      <StatCardsGrid
        style={{ marginBottom: 24 }}
        stats={[
          {
            title: "Total Requests",
            value: summary.total_requests || 0,
            formatter: (val) => val.toLocaleString(),
            icon: <Activity size={20} />,
            iconColor: "#3B82F6",
            loading: summaryLoading,
            sparklineData: requestSparkline,
            sparklineColor: "#3B82F6",
            trend: trends.requestTrend,
            trendInverted: false
          },
          {
            title: "Error Rate",
            value: summary.error_rate || 0,
            formatter: (val) => `${Number(val).toFixed(2)}%`,
            icon: <AlertCircle size={20} />,
            iconColor: "#F04438",
            loading: summaryLoading,
            sparklineData: errorSparkline,
            sparklineColor: "#F04438",
            trend: trends.errorTrend,
            trendInverted: true
          },
          {
            title: "Avg Latency",
            value: summary.avg_latency || 0,
            formatter: (val) => `${val.toFixed(0)}ms`,
            icon: <Clock size={20} />,
            iconColor: "#10B981",
            loading: summaryLoading,
            sparklineData: latencySparkline,
            sparklineColor: "#10B981"
          },
          {
            title: "P95 Latency",
            value: summary.p95_latency || 0,
            formatter: (val) => `${val.toFixed(0)}ms`,
            icon: <Clock size={20} />,
            iconColor: "#F59E0B",
            loading: summaryLoading
          }
        ]}
      />

      {/* Tabs for different views */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={[
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <>
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 100 }}>
                      <Spin size="large" />
                    </div>
                  ) : metrics.length === 0 ? (
                    <Empty description="No metrics data available for the selected time range" />
                  ) : (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} lg={12}>
                        <Card title="Request Rate" className="chart-card" styles={{ body: { padding: '8px' } }}>
                          <RequestChart
                            data={metrics}
                            endpoints={topEndpointsByRequests}
                            selectedEndpoints={selectedEndpointsRequests}
                          />
                          <TopEndpointsList
                            title="Requests"
                            type="requests"
                            endpoints={topEndpointsByRequests}
                            selectedEndpoints={selectedEndpointsRequests}
                            onToggle={handleEndpointToggleRequests}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Card title="Error Rate" className="chart-card" styles={{ body: { padding: '8px' } }}>
                          <ErrorRateChart
                            data={metrics.map(m => ({
                              ...m,
                              value: m.error_rate || (m.request_count > 0 ? (m.error_count / m.request_count) * 100 : 0),
                            }))}
                            endpoints={topEndpointsByErrorRate}
                            selectedEndpoints={selectedEndpointsErrorRate}
                          />
                          <TopEndpointsList
                            title="Error Rate"
                            type="errorRate"
                            endpoints={topEndpointsByErrorRate}
                            selectedEndpoints={selectedEndpointsErrorRate}
                            onToggle={handleEndpointToggleErrorRate}
                          />
                        </Card>
                      </Col>
                      <Col xs={24}>
                        <Card title="Latency Distribution" className="chart-card" styles={{ body: { padding: '8px' } }}>
                          <LatencyChart
                            data={metrics}
                            endpoints={topEndpointsByLatency}
                            selectedEndpoints={selectedEndpointsLatency}
                          />
                          <TopEndpointsList
                            title="Latency"
                            type="latency"
                            endpoints={topEndpointsByLatency}
                            selectedEndpoints={selectedEndpointsLatency}
                            onToggle={handleEndpointToggleLatency}
                          />
                        </Card>
                      </Col>
                    </Row>
                  )}
                </>
              ),
            },
            {
              key: 'services',
              label: `Services (${serviceMetrics.length})`,
              children: (
                <Row gutter={[16, 16]}>
                  {serviceMetrics.slice(0, 12).map((service) => {
                    const errorRate = service.request_count > 0
                      ? (service.error_count / service.request_count) * 100
                      : 0;
                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={service.service_name}>
                        <Card size="small" className="chart-card">
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                              {service.service_name}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                              <span>Requests</span>
                              <span>{formatNumber(service.request_count)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                              <span>Error Rate</span>
                              <span style={{ color: errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#73C991' }}>
                                {errorRate.toFixed(2)}%
                              </span>
                            </div>
                            <Progress
                              percent={Math.min(errorRate, 100)}
                              size="small"
                              strokeColor={errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#73C991'}
                              showInfo={false}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                            <span>Avg: {formatDuration(service.avg_latency)}</span>
                            <span>P95: {formatDuration(service.p95_latency)}</span>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ),
            },
            {
              key: 'latency',
              label: 'Latency',
              children: <LatencyAnalysisPage embedded />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
