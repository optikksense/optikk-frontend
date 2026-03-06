import { Card, Tabs } from 'antd';
import { BarChart3, Activity, AlertCircle, Clock } from 'lucide-react';
import { useMemo } from 'react';

import { PageHeader, StatCardsGrid } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { useDashboardConfig } from '@hooks/useDashboardConfig';

import { MetricsFilterBar } from '../../components/MetricsFilterBar';
import { useMetricsQueries } from '../../hooks/useMetricsQueries';
import { useMetricsState } from '../../hooks/useMetricsState';
import {
  normalizeMetricSummary,
  normalizeTimeSeriesPoint,
  normalizeEndpointMetric,
} from '../../utils/metricNormalizers';
import { calculateTrends } from '../../utils/trendCalculators';

/**
 *
 */
export default function MetricsPage() {
  const { config } = useDashboardConfig('metrics');

  // 1. URL and Filter State
  const {
    selectedService, setSelectedService,
    showErrorsOnly, setShowErrorsOnly,
    activeTab, onTabChange,
  } = useMetricsState();

  // 2. Data Fetching
  const {
    servicesData,
    summaryData, summaryLoading,
    metricsData, metricsLoading,
    endpointMetricsData,
    endpointTimeSeriesData,
  } = useMetricsQueries({ selectedService, showErrorsOnly, activeTab });

  // 3. Data Normalization
  const services = servicesData || [];

  const metricsPoints = useMemo(
    () => (Array.isArray(metricsData) ? metricsData : []).map(normalizeTimeSeriesPoint),
    [metricsData],
  );

  const metrics = showErrorsOnly ? metricsPoints.filter((m) => m.error_count > 0) : metricsPoints;
  const summary = useMemo(() => normalizeMetricSummary(summaryData || {}), [summaryData]);

  const endpointMetrics = useMemo(
    () => (Array.isArray(endpointMetricsData) ? endpointMetricsData : []).map(normalizeEndpointMetric),
    [endpointMetricsData],
  );

  const endpointTimeSeries = useMemo(
    () => (Array.isArray(endpointTimeSeriesData) ? endpointTimeSeriesData : []).map(normalizeTimeSeriesPoint),
    [endpointTimeSeriesData],
  );

  // 4. Derived Business Logic (Trends & Sparklines)
  const trends = useMemo(() => calculateTrends(metricsPoints), [metricsPoints]);

  const requestSparkline = useMemo(() => (metrics || []).map((m) => m.request_count || 0), [metrics]);

  const errorSparkline = useMemo(() => {
    return (metrics || []).map((m) => {
      const total = m.request_count || 0;
      const errors = m.error_count || 0;
      return total > 0 ? (errors / total) * 100 : 0;
    });
  }, [metrics]);

  const latencySparkline = useMemo(() => (metrics || []).map((m) => m.avg_latency || 0), [metrics]);

  // 5. UI Rendering Composition
  return (
    <div className="metrics-page">
      <PageHeader
        title="Metrics"
        icon={<BarChart3 size={24} />}
        subtitle="System-wide performance metrics"
      />

      <MetricsFilterBar
        services={services}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        showErrorsOnly={showErrorsOnly}
        setShowErrorsOnly={setShowErrorsOnly}
      />

      <StatCardsGrid
        style={{ marginBottom: 24 }}
        stats={[
          {
            title: 'Total Requests',
            value: summary.total_requests || 0,
            formatter: (val) => val.toLocaleString(),
            icon: <Activity size={20} />,
            iconColor: '#3B82F6',
            loading: summaryLoading,
            sparklineData: requestSparkline,
            sparklineColor: '#3B82F6',
            trend: trends.requestTrend,
            trendInverted: false,
          },
          {
            title: 'Error Rate',
            value: summary.error_rate || 0,
            formatter: (val) => `${Number(val).toFixed(2)}%`,
            icon: <AlertCircle size={20} />,
            iconColor: '#F04438',
            loading: summaryLoading,
            sparklineData: errorSparkline,
            sparklineColor: '#F04438',
            trend: trends.errorTrend,
            trendInverted: true,
          },
          {
            title: 'Avg Latency',
            value: summary.avg_latency || 0,
            formatter: (val) => `${val.toFixed(0)}ms`,
            icon: <Clock size={20} />,
            iconColor: '#10B981',
            loading: summaryLoading,
            sparklineData: latencySparkline,
            sparklineColor: '#10B981',
          },
          {
            title: 'P95 Latency',
            value: summary.p95_latency || 0,
            formatter: (val) => `${val.toFixed(0)}ms`,
            icon: <Clock size={20} />,
            iconColor: '#F59E0B',
            loading: summaryLoading,
          },
        ]}
      />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={[
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <ConfigurableDashboard
                  config={config}
                  dataSources={{
                    'metrics-summary': summary,
                    'metrics-timeseries': metrics,
                    'endpoints-timeseries': endpointTimeSeries,
                    'endpoints-metrics': endpointMetrics,
                  }}
                  isLoading={metricsLoading}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
