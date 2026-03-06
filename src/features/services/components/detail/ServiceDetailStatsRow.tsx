import { Col, Row } from 'antd';
import { Activity, AlertCircle, Clock, Zap } from 'lucide-react';
import React from 'react';

import StatCard from '@components/common/cards/StatCard';

import { formatDuration, formatNumber } from '@utils/formatters';

interface ServiceStats {
  totalRequests: number;
}

interface ServiceDetailStatsRowProps {
  stats: ServiceStats;
  errorRate: number;
  avgLatency: number;
  p95Latency: number;
  requestsSparkline: number[];
  errorSparkline: number[];
}

/**
 * KPI stats row shown above service detail tabs.
 */
export default function ServiceDetailStatsRow({
  stats,
  errorRate,
  avgLatency,
  p95Latency,
  requestsSparkline,
  errorSparkline,
}: ServiceDetailStatsRowProps): JSX.Element {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        {React.createElement(StatCard as any, {
          title: 'Total Requests',
          value: stats.totalRequests,
          formatter: formatNumber,
          trend: 0,
          icon: <Activity size={20} />,
          iconColor: '#1890ff',
          sparklineData: requestsSparkline,
          sparklineColor: '#1890ff',
        })}
      </Col>
      <Col xs={24} sm={12} lg={6}>
        {React.createElement(StatCard as any, {
          title: 'Error Rate',
          value: errorRate,
          formatter: (value: number) => `${value.toFixed(2)}%`,
          trend: 0,
          icon: <AlertCircle size={20} />,
          iconColor: errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#12B76A',
          sparklineData: errorSparkline,
          sparklineColor: '#F04438',
        })}
      </Col>
      <Col xs={24} sm={12} lg={6}>
        {React.createElement(StatCard as any, {
          title: 'Avg Latency',
          value: avgLatency,
          formatter: formatDuration,
          trend: 0,
          icon: <Clock size={20} />,
          iconColor: '#722ED1',
        })}
      </Col>
      <Col xs={24} sm={12} lg={6}>
        {React.createElement(StatCard as any, {
          title: 'P95 Latency',
          value: p95Latency,
          formatter: formatDuration,
          trend: 0,
          icon: <Zap size={20} />,
          iconColor: '#FA8C16',
        })}
      </Col>
    </Row>
  );
}

