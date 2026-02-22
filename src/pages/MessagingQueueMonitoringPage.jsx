import { Row, Col, Card, Spin } from 'antd';
import { Network, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers, Clock } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, StatCard } from '@components/common';
import { v1Service } from '@services/v1Service';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { BASE_CHART_OPTIONS, createLineDataset, getChartColor } from '@utils/chartHelpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

// Common charting options to emulate the Grafana dense panel layout
const chartOptions = {
  ...BASE_CHART_OPTIONS,
  plugins: {
    ...BASE_CHART_OPTIONS.plugins,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#8e8e8e',
        font: { size: 11, family: 'Inter, sans-serif' },
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
      }
    },
  },
};

export default function MessagingQueueMonitoringPage() {
  const { data, isLoading } = useTimeRangeQuery(
    'messaging-queue-insights',
    (teamId, start, end) => v1Service.getMessagingQueueInsights(teamId, start, end, '5m')
  );

  const summary = data?.summary || {};
  const ts = Array.isArray(data?.timeseries) ? data.timeseries : [];

  // 1. Determine unique queues and assign a consistent color to each
  const uniqueQueues = [...new Set(ts.map(r => r.queue_name || 'unknown'))].sort();
  const queueColorMap = {};
  uniqueQueues.forEach((q, idx) => {
    queueColorMap[q] = getChartColor(idx);
  });

  // 2. Extract unique timestamps and sort them
  const labels = [...new Set(ts.map(r => r.timestamp))].sort();

  // 3. Helper to format dataset for a specific metric key across all queues
  const buildDatasetConfig = (metricKey, queues) => {
    return queues.map(queueName => {
      const dataPoints = labels.map(t => {
        const point = ts.find(r => r.timestamp === t && r.queue_name === queueName);
        return point ? n(point[metricKey]) : null;
      });

      return createLineDataset(queueName, dataPoints, queueColorMap[queueName]);
    });
  };

  // Build the 4 chart data objects
  const productionData = { labels, datasets: buildDatasetConfig('avg_publish_rate', uniqueQueues) };
  const consumptionData = { labels, datasets: buildDatasetConfig('avg_receive_rate', uniqueQueues) };
  const consumerLagData = { labels, datasets: buildDatasetConfig('avg_consumer_lag', uniqueQueues) };
  const topicLagData = { labels, datasets: buildDatasetConfig('avg_queue_depth', uniqueQueues) };

  return (
    <div>
      <PageHeader
        title="Messaging / Queue Monitoring"
        icon={<Network size={24} />}
        subtitle="Throughput rates, consumer lag, queue depth, and processing errors per queue"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Avg Queue Depth" value={n(summary.avg_queue_depth).toFixed(1)} icon={<Layers size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Max Consumer Lag" value={n(summary.max_consumer_lag).toFixed(1)} icon={<Clock size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Avg Processing Errors" value={n(summary.processing_errors).toFixed(0)} icon={<AlertTriangle size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Queues" value={uniqueQueues.length} icon={<Network size={18} />} loading={isLoading} />
        </Col>
      </Row>

      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span><ArrowUpRight size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Production Rate (msg/s)</span>} className="chart-card" styles={{ body: { padding: '8px' } }}>
              <div style={{ height: 280 }}>
                <Line data={productionData} options={{ ...chartOptions, maintainAspectRatio: false }} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span><ArrowDownRight size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Consumption Rate (msg/s)</span>} className="chart-card" styles={{ body: { padding: '8px' } }}>
              <div style={{ height: 280 }}>
                <Line data={consumptionData} options={{ ...chartOptions, maintainAspectRatio: false }} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span><Clock size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Consumer Group Lag</span>} className="chart-card" styles={{ body: { padding: '8px' } }}>
              <div style={{ height: 280 }}>
                <Line data={consumerLagData} options={{ ...chartOptions, maintainAspectRatio: false }} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span><Layers size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Topic Lag (Queue Depth)</span>} className="chart-card" styles={{ body: { padding: '8px' } }}>
              <div style={{ height: 280 }}>
                <Line data={topicLagData} options={{ ...chartOptions, maintainAspectRatio: false }} />
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
