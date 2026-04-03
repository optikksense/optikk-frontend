import { useMemo } from 'react';

import { Surface } from '@/components/ui';
import SparklineChart from '@shared/components/ui/charts/micro/SparklineChart';

import type { ServiceOverviewStats, ServiceTimeSeriesPoint } from '../../types';

/** Apdex = (satisfied + tolerating/2) / total */
function computeApdex(
  timeSeries: ServiceTimeSeriesPoint[],
  targetMs: number
): { score: number; satisfied: number; tolerating: number; frustrated: number } {
  let satisfied = 0;
  let tolerating = 0;
  let frustrated = 0;

  for (const p of timeSeries) {
    if (p.avgLatencyMs <= targetMs) {
      satisfied += p.requestCount;
    } else if (p.avgLatencyMs <= targetMs * 4) {
      tolerating += p.requestCount;
    } else {
      frustrated += p.requestCount;
    }
  }

  const total = satisfied + tolerating + frustrated;
  const score = total > 0 ? (satisfied + tolerating / 2) / total : 1;
  return { score, satisfied, tolerating, frustrated };
}

function apdexColor(score: number): string {
  if (score >= 0.94) return '#35d68f';
  if (score >= 0.85) return '#64dfdf';
  if (score >= 0.7) return '#f7b63a';
  return '#ff4d5a';
}

function apdexLabel(score: number): string {
  if (score >= 0.94) return 'Excellent';
  if (score >= 0.85) return 'Good';
  if (score >= 0.7) return 'Fair';
  if (score >= 0.5) return 'Poor';
  return 'Unacceptable';
}

interface ServiceSLOProps {
  stats: ServiceOverviewStats | null;
  timeSeries: ServiceTimeSeriesPoint[];
  errorRateSparkline: number[];
  loading: boolean;
}

export default function ServiceSLO({
  stats,
  timeSeries,
  errorRateSparkline,
  loading,
}: ServiceSLOProps) {
  // Apdex with 500ms target (configurable later)
  const apdexTarget = 500;
  const apdex = useMemo(
    () => computeApdex(timeSeries, apdexTarget),
    [timeSeries]
  );

  // Error budget: assume 99.9% SLO → 0.1% error budget
  const sloTarget = 99.9;
  const errorBudgetTotal = 100 - sloTarget; // 0.1%
  const errorBudgetUsed = stats?.errorRate ?? 0;
  const errorBudgetRemaining = Math.max(errorBudgetTotal - errorBudgetUsed, 0);
  const errorBudgetPct =
    errorBudgetTotal > 0
      ? Math.min((errorBudgetUsed / errorBudgetTotal) * 100, 100)
      : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Surface key={i} elevation={1} padding="sm" className="h-[140px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Apdex Score */}
      <Surface elevation={1} padding="md">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Apdex Score
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span
            className="text-3xl font-light tabular-nums"
            style={{ color: apdexColor(apdex.score) }}
          >
            {apdex.score.toFixed(3)}
          </span>
          <span className="mb-1 text-xs" style={{ color: apdexColor(apdex.score) }}>
            {apdexLabel(apdex.score)}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-[var(--text-muted)]">
          Target: {apdexTarget}ms · Satisfied: {apdex.satisfied.toLocaleString()} · Tolerating: {apdex.tolerating.toLocaleString()} · Frustrated: {apdex.frustrated.toLocaleString()}
        </div>
      </Surface>

      {/* Error Budget */}
      <Surface elevation={1} padding="md">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Error Budget ({sloTarget}% SLO)
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span
            className="text-3xl font-light tabular-nums"
            style={{
              color: errorBudgetPct > 80 ? '#ff4d5a' : errorBudgetPct > 50 ? '#f7b63a' : '#35d68f',
            }}
          >
            {errorBudgetRemaining.toFixed(3)}%
          </span>
          <span className="mb-1 text-xs text-[var(--text-muted)]">remaining</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${errorBudgetPct}%`,
              backgroundColor:
                errorBudgetPct > 80 ? '#ff4d5a' : errorBudgetPct > 50 ? '#f7b63a' : '#35d68f',
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-[var(--text-muted)]">
          <span>Used: {errorBudgetUsed.toFixed(3)}%</span>
          <span>Budget: {errorBudgetTotal.toFixed(1)}%</span>
        </div>
      </Surface>

      {/* Error Rate Trend */}
      <Surface elevation={1} padding="md">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Error Rate Trend
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span
            className={`text-3xl font-light tabular-nums ${
              (stats?.errorRate ?? 0) > 5
                ? 'text-red-400'
                : (stats?.errorRate ?? 0) > 1
                  ? 'text-yellow-400'
                  : 'text-green-400'
            }`}
          >
            {(stats?.errorRate ?? 0).toFixed(2)}%
          </span>
        </div>
        <div className="mt-3">
          <SparklineChart
            data={errorRateSparkline}
            color={(stats?.errorRate ?? 0) > 5 ? '#ff4d5a' : '#35d68f'}
            width={200}
            height={40}
          />
        </div>
      </Surface>
    </div>
  );
}
