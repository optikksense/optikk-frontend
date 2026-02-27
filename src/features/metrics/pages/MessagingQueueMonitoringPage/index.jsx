import { Row, Col, Card, Empty } from 'antd';
import { useMemo } from 'react';
import { Activity, Radio, Layers3, Timer, TrendingUp, BarChart3 } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { PageHeader, StatCard } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { v1Service } from '@services/v1Service';
import { formatNumber, formatDuration } from '@utils/formatters';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

const MQ_SYSTEM_META = {
  kafka: { label: 'Apache Kafka', color: '#231F20', badgeColor: '#e0e0e0', gradient: 'linear-gradient(135deg, #231F20 0%, #666 100%)' },
  rabbitmq: { label: 'RabbitMQ', color: '#FF6600', badgeColor: '#FF6600', gradient: 'linear-gradient(135deg, #FF6600 0%, #FFB088 100%)' },
  activemq: { label: 'ActiveMQ', color: '#D32F2F', badgeColor: '#D32F2F', gradient: 'linear-gradient(135deg, #D32F2F 0%, #EF9A9A 100%)' },
  sqs: { label: 'Amazon SQS', color: '#FF9900', badgeColor: '#FF9900', gradient: 'linear-gradient(135deg, #FF9900 0%, #FFD599 100%)' },
  nats: { label: 'NATS', color: '#27AAE1', badgeColor: '#27AAE1', gradient: 'linear-gradient(135deg, #27AAE1 0%, #8DD8F8 100%)' },
  pulsar: { label: 'Apache Pulsar', color: '#188FFF', badgeColor: '#188FFF', gradient: 'linear-gradient(135deg, #188FFF 0%, #92CBFF 100%)' },
};

function getMqMeta(system) {
  const key = (system || '').toLowerCase();
  return MQ_SYSTEM_META[key] || {
    label: system || 'Queue',
    color: '#5E60CE',
    badgeColor: '#5E60CE',
    gradient: 'linear-gradient(135deg, #5E60CE 0%, #48CAE4 100%)',
  };
}

function TopQueuesTable({ queues = [] }) {
  if (!queues || queues.length === 0) {
    return <Empty description="No queue data in selected time range" style={{ padding: '40px 0' }} />;
  }

  return (
    <div style={{
      maxHeight: '320px', overflowY: 'auto',
      scrollbarWidth: 'thin', scrollbarColor: 'var(--border-color, #2D2D2D) transparent'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
        <thead>
          <tr style={{ color: '#8e8e8e', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>Queue / Topic</th>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>System</th>
            <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'right' }}>Avg Depth</th>
            <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'right' }}>Max Lag</th>
            <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'right' }}>Pub Rate</th>
            <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'right' }}>Recv Rate</th>
          </tr>
        </thead>
        <tbody>
          {queues.map((q, idx) => {
            const mqMeta = getMqMeta(q.messaging_system);
            const COLORS = ['#5E60CE', '#48CAE4', '#06D6A0', '#FFD166', '#EF476F', '#118AB2', '#073B4C', '#F78C6B'];
            const dotColor = COLORS[idx % COLORS.length];

            return (
              <tr
                key={`${q.queue_name}-${q.service_name}-${idx}`}
                style={{
                  transition: 'background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '6px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{q.queue_name || 'unknown'}</span>
                      {q.service_name && q.service_name !== 'unknown' && (
                        <div style={{ color: '#8e8e8e', fontSize: '10px' }}>{q.service_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '6px 10px' }}>
                  {q.messaging_system && (
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                      fontSize: '10px', fontWeight: 600, letterSpacing: '0.3px',
                      color: mqMeta.badgeColor,
                      background: `${mqMeta.badgeColor}18`,
                      border: `1px solid ${mqMeta.badgeColor}33`,
                      textTransform: 'capitalize',
                    }}>
                      {mqMeta.label}
                    </span>
                  )}
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#e0e0e0', fontFamily: 'monospace' }}>
                  {n(q.avg_queue_depth).toFixed(0)}
                </td>
                <td style={{
                  padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace',
                  color: n(q.max_consumer_lag) > 1000 ? '#F04438' : n(q.max_consumer_lag) > 100 ? '#F79009' : '#e0e0e0',
                }}>
                  {formatNumber(n(q.max_consumer_lag))}
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#48CAE4', fontFamily: 'monospace' }}>
                  {n(q.avg_publish_rate).toFixed(1)}/s
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#06D6A0', fontFamily: 'monospace' }}>
                  {n(q.avg_receive_rate).toFixed(1)}/s
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function MessagingQueueMonitoringPage() {
  const { config } = useDashboardConfig('messaging-queue');

  const { data, isLoading } = useTimeRangeQuery(
    'messaging-queue-insights',
    (teamId, start, end) => v1Service.getMessagingQueueInsights(teamId, start, end)
  );

  const summary = data?.summary || {};
  const topQueues = Array.isArray(data?.topQueues) ? data.topQueues : [];

  const dataSources = useMemo(() => ({ 'messaging-queue-insights': data }), [data]);

  // Detect unique messaging systems
  const messagingSystems = useMemo(() => {
    const systemSet = new Set();
    topQueues.forEach(q => { if (q.messaging_system) systemSet.add(q.messaging_system); });
    return [...systemSet];
  }, [topQueues]);

  return (
    <div>
      <PageHeader title="Messaging Queue Monitoring" icon={<Radio size={24} />} subtitle="Queue depth, consumer lag, publish and receive rates across messaging systems" />

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Queue Depth"
            value={formatNumber(n(summary.avg_queue_depth))}
            icon={<Layers3 size={18} />}
            loading={isLoading}
            description="Average pending messages"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Max Consumer Lag"
            value={formatNumber(n(summary.max_consumer_lag))}
            icon={<Timer size={18} />}
            loading={isLoading}
            description="Highest lag across all queues"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Publish Rate"
            value={`${n(summary.avg_publish_rate).toFixed(1)}/s`}
            icon={<TrendingUp size={18} />}
            loading={isLoading}
            description="Messages published per second"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Receive Rate"
            value={`${n(summary.avg_receive_rate).toFixed(1)}/s`}
            icon={<BarChart3 size={18} />}
            loading={isLoading}
            description="Messages consumed per second"
          />
        </Col>
      </Row>

      {/* Messaging systems detected pills */}
      {messagingSystems.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '16px', flexWrap: 'wrap',
        }}>
          <Activity size={14} color="#8e8e8e" />
          <span style={{ color: '#8e8e8e', fontSize: '12px', fontWeight: 500 }}>Systems:</span>
          {messagingSystems.map(sys => {
            const meta = getMqMeta(sys);
            return (
              <span key={sys} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '12px',
                fontSize: '11px', fontWeight: 600,
                color: meta.badgeColor,
                background: `${meta.badgeColor}12`,
                border: `1px solid ${meta.badgeColor}28`,
              }}>
                <Radio size={10} />
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Configurable dashboard charts */}
      <div style={{ marginBottom: 24 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={dataSources}
          isLoading={isLoading}
        />
      </div>

      {/* Top queues table */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} />
                Top Queues / Topics
              </span>
            }
            style={{ height: '100%' }}
            styles={{ body: { padding: '8px' } }}
          >
            <TopQueuesTable queues={topQueues} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
