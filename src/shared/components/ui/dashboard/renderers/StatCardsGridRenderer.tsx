import { Activity, AlertCircle, Clock, Zap } from 'lucide-react';
import { useMemo } from 'react';

import { StatCardsGrid } from '@shared/components/ui';
import { formatDuration, formatNumber } from '@shared/utils/formatters';
import { APP_COLORS } from '@config/colorLiterals';

import { useDashboardData } from '../hooks/useDashboardData';

import type { DashboardPanelRendererProps } from '../dashboardPanelRegistry';

export function StatCardsGridRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: services } = useDashboardData(chartConfig, dataSources);

  const summary = useMemo(() => {
    let totalRequests = 0;
    let totalErrors = 0;
    let latencySum = 0;
    let p95Max = 0;

    for (const s of services) {
      const req = Number(s.request_count ?? 0);
      totalRequests += req;
      totalErrors += Number(s.error_count ?? 0);
      latencySum += Number(s.avg_latency ?? 0) * req;
      p95Max = Math.max(p95Max, Number(s.p95_latency ?? 0));
    }

    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const avgLatency = totalRequests > 0 ? latencySum / totalRequests : 0;

    return { totalRequests, errorRate, avgLatency, p95Latency: p95Max };
  }, [services]);

  return (
    <div className="h-full min-h-0 overflow-y-auto p-2">
      <StatCardsGrid
        stats={[
          {
            metric: {
              title: 'Total Requests',
              value: summary.totalRequests,
              formatter: formatNumber,
            },
            visuals: { icon: <Activity size={20} />, iconColor: APP_COLORS.hex_5e60ce },
          },
          {
            metric: {
              title: 'Error Rate',
              value: Number(Math.max(0, summary.errorRate).toFixed(2)),
              suffix: '%',
            },
            visuals: { icon: <AlertCircle size={20} />, iconColor: APP_COLORS.hex_f04438 },
          },
          {
            metric: { title: 'Avg Latency', value: summary.avgLatency, formatter: formatDuration },
            visuals: { icon: <Clock size={20} />, iconColor: APP_COLORS.hex_f79009 },
          },
          {
            metric: { title: 'P95 Latency', value: summary.p95Latency, formatter: formatDuration },
            visuals: { icon: <Zap size={20} />, iconColor: APP_COLORS.hex_06aed5 },
          },
        ]}
      />
    </div>
  );
}
