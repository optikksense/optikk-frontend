import { Row, Col, Card } from 'antd';
import {
  Gauge, Database, Radio, Cpu, GitPullRequest,
} from 'lucide-react';
import { useMemo } from 'react';

import StatCard from '@shared/components/ui/cards/StatCard';
import PageHeader from '@shared/components/ui/layout/PageHeader';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { saturationService } from '@shared/api/saturationService';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

import { formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';
import { KafkaSaturationTable } from '../../components/KafkaSaturationTable';
import './SaturationPage.css';

function normalizeKafkaMetric(row: any = {}) {
  return {
    ...row,
    queue: row.queue ?? row.topic ?? '',
    avg_consumer_lag: Number(row.avg_consumer_lag ?? 0),
    max_consumer_lag: Number(row.max_consumer_lag ?? 0),
    avg_queue_depth: Number(row.avg_queue_depth ?? 0),
    max_queue_depth: Number(row.max_queue_depth ?? 0),
    avg_publish_rate: Number(row.avg_publish_rate ?? 0),
    avg_receive_rate: Number(row.avg_receive_rate ?? 0),
  };
}

export default function SaturationPage() {
  const { config } = useDashboardConfig('saturation');

  const { data: kafkaLagRaw, isLoading: lagLoading } = useTimeRangeQuery(
    'saturation-kafka-lag',
    (teamId, start, end) => saturationService.getConsumerLagByGroup(teamId, start, end),
  );


  const kafkaLag = useMemo(() => {
    const raw = Array.isArray(kafkaLagRaw) ? kafkaLagRaw : [];
    return raw.map(normalizeKafkaMetric);
  }, [kafkaLagRaw]);



  const summary = useMemo(() => {
    const maxLag = kafkaLag.length ? Math.max(...kafkaLag.map((m) => Number(m.max_consumer_lag) || 0)) : 0;
    const maxQueue = kafkaLag.length ? Math.max(...kafkaLag.map((m) => Number(m.max_queue_depth) || 0)) : 0;

    return { maxLag, maxQueue, maxDbPool: 0, maxThread: 0 };
  }, [kafkaLag]);

  return (
    <div className="saturation-page">
      <PageHeader
        title="Saturation Metrics"
        subtitle="Leading indicators: queue depths, consumer lag, thread pools, and connection pool utilization"
        icon={<Gauge size={24} />}
      />

      {/* Summary stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            metric={{
              title: 'Max DB Pool Util',
              value: `${Number(summary.maxDbPool).toFixed(1)}%`,
            }}
            visuals={{
              icon: <Database size={20} />,
              iconColor: summary.maxDbPool > 80 ? APP_COLORS.hex_f04438 : summary.maxDbPool > 60 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            metric={{
              title: 'Max Consumer Lag',
              value: formatNumber(summary.maxLag),
            }}
            visuals={{
              icon: <Radio size={20} />,
              iconColor: summary.maxLag > 1000 ? APP_COLORS.hex_f04438 : summary.maxLag > 100 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            metric={{
              title: 'Max Thread Active',
              value: formatNumber(summary.maxThread),
            }}
            visuals={{
              icon: <Cpu size={20} />,
              iconColor: summary.maxThread > 200 ? APP_COLORS.hex_f04438 : summary.maxThread > 100 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            metric={{
              title: 'Max Queue Depth',
              value: formatNumber(summary.maxQueue),
            }}
            visuals={{
              icon: <GitPullRequest size={20} />,
              iconColor: summary.maxQueue > 1000 ? APP_COLORS.hex_f04438 : summary.maxQueue > 100 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
            }}
          />
        </Col>
      </Row>

      {/* Configurable timeseries charts */}
      <div style={{ marginBottom: 24 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={{
            'saturation-kafka-lag': kafkaLag,
          }}
          isLoading={lagLoading}
        />
      </div>



      {/* Kafka saturation table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                Kafka Queue / Consumer Lag
              </span>
            }
            className="sat-chart-card"
          >
            <KafkaSaturationTable data={kafkaLag} loading={lagLoading} />
          </Card>
        </Col>
      </Row>

      {/* Instrumentation guide */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Instrumentation Guide" className="sat-chart-card">
            <div className="sat-guide">
              <div className="sat-guide-intro">
                Saturation metrics are extracted from OpenTelemetry span <strong>attributes</strong>.
                Add these attributes to your spans to populate the charts above:
              </div>
              <div className="sat-guide-items">
                {[
                  { icon: <Database size={16} />, attr: 'db.connection_pool.utilization', desc: 'DB connection pool utilization (0–100)', example: '72.5', color: APP_COLORS.hex_06aed5 },
                  { icon: <Radio size={16} />, attr: 'messaging.kafka.consumer.lag', desc: 'Kafka consumer group lag (message count)', example: '3204', color: APP_COLORS.hex_f79009 },
                  { icon: <Cpu size={16} />, attr: 'thread.pool.active', desc: 'Number of active threads in the pool', example: '42', color: APP_COLORS.hex_5e60ce },
                  { icon: <Cpu size={16} />, attr: 'thread.pool.size', desc: 'Maximum thread pool capacity', example: '100', color: APP_COLORS.hex_5e60ce },
                  { icon: <GitPullRequest size={16} />, attr: 'queue.depth', desc: 'Internal queue depth / pending item count', example: '847', color: APP_COLORS.hex_e478fa },
                ].map((item, i) => (
                  <div key={i} className="sat-guide-item">
                    <div className="sat-guide-icon" style={{ color: item.color }}>{item.icon}</div>
                    <div className="sat-guide-content">
                      <code className="sat-guide-attr">{item.attr}</code>
                      <div className="sat-guide-desc">{item.desc}</div>
                    </div>
                    <div className="sat-guide-example">
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>e.g. </span>
                      <code style={{ fontSize: 11, color: item.color }}>{item.example}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
