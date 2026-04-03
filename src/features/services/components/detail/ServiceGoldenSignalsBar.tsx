import { Activity, AlertTriangle, Clock, Zap } from 'lucide-react';

import StatCard from '@shared/components/ui/cards/StatCard';
import { APP_COLORS } from '@config/colorLiterals';
import { timeRangeDurationMs } from '@/types';
import { useAppStore } from '@store/appStore';

import type { ServiceOverviewStats } from '../../types';
import type { ServiceMetric } from '@shared/api/metricsService';

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(1);
}

function formatMs(ms: number): string {
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

function trendPercent(current: number, previous: number | undefined): number | null {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function errorRateColor(rate: number): string {
  if (rate > 5) return APP_COLORS.hex_ff4d5a ?? '#ff4d5a';
  if (rate > 1) return APP_COLORS.hex_f7b63a ?? '#f7b63a';
  return APP_COLORS.hex_35d68f ?? '#35d68f';
}

interface ServiceGoldenSignalsBarProps {
  stats: ServiceOverviewStats | null;
  prevStats: ServiceMetric | null;
  requestSparkline: number[];
  errorRateSparkline: number[];
  avgLatencySparkline: number[];
  loading: boolean;
}

export default function ServiceGoldenSignalsBar({
  stats,
  prevStats,
  requestSparkline,
  errorRateSparkline,
  avgLatencySparkline,
  loading,
}: ServiceGoldenSignalsBarProps) {
  const timeRange = useAppStore((s) => s.timeRange);
  const durationSec = timeRangeDurationMs(timeRange) / 1000;
  const reqPerSec = stats ? stats.requestCount / Math.max(durationSec, 1) : 0;
  const prevReqPerSec = prevStats ? prevStats.requestCount / Math.max(durationSec, 1) : undefined;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        metric={{ title: 'Requests / sec', value: formatNum(reqPerSec) }}
        trend={{ value: trendPercent(reqPerSec, prevReqPerSec) }}
        visuals={{
          icon: <Activity size={18} />,
          iconColor: APP_COLORS.hex_5e60ce,
          sparklineData: requestSparkline,
          sparklineColor: APP_COLORS.hex_5e60ce,
          loading,
        }}
      />
      <StatCard
        metric={{
          title: 'Error Rate',
          value: stats ? `${stats.errorRate.toFixed(2)}%` : '—',
        }}
        trend={{
          value: trendPercent(stats?.errorRate ?? 0, prevStats?.errorRate),
          inverted: true,
        }}
        visuals={{
          icon: <AlertTriangle size={18} />,
          iconColor: stats ? errorRateColor(stats.errorRate) : undefined,
          sparklineData: errorRateSparkline,
          sparklineColor: stats ? errorRateColor(stats.errorRate) : undefined,
          loading,
        }}
      />
      <StatCard
        metric={{
          title: 'Avg Latency',
          value: stats ? formatMs(stats.avgLatencyMs) : '—',
        }}
        trend={{
          value: trendPercent(stats?.avgLatencyMs ?? 0, prevStats?.avgLatency),
          inverted: true,
        }}
        visuals={{
          icon: <Clock size={18} />,
          iconColor: '#64dfdf',
          sparklineData: avgLatencySparkline,
          sparklineColor: '#64dfdf',
          loading,
        }}
      />
      <StatCard
        metric={{
          title: 'P95 Latency',
          value: stats ? formatMs(stats.p95LatencyMs) : '—',
        }}
        trend={{
          value: trendPercent(stats?.p95LatencyMs ?? 0, prevStats?.p95Latency),
          inverted: true,
        }}
        visuals={{
          icon: <Zap size={18} />,
          iconColor: APP_COLORS.hex_f7b63a,
          sparklineData: avgLatencySparkline, // reuse; p95-specific sparkline TBD
          sparklineColor: APP_COLORS.hex_f7b63a,
          loading,
        }}
      />
    </div>
  );
}
