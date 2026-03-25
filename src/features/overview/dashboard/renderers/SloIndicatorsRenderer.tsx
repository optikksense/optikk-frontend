import { useMemo } from 'react';

import { Surface } from '@/components/ui';

import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import { APP_COLORS } from '@config/colorLiterals';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';

function SloGauge({
  value,
  label,
  subtitle,
  thresholds,
}: {
  value: number;
  label: string;
  subtitle: string;
  thresholds: { good: number; warn: number };
}) {
  const color =
    value >= thresholds.good
      ? APP_COLORS.hex_73c991
      : value >= thresholds.warn
        ? APP_COLORS.hex_f79009
        : APP_COLORS.hex_f04438;

  const dashLen = (Math.min(100, Math.max(0, value)) / 100) * 213.6;

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg viewBox="0 0 80 80" width={80} height={80}>
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--bg-tertiary, #2d2d2d)"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dashLen} 213.6`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {value.toFixed(label === 'Availability' ? 2 : 0)}%
        </div>
      </div>
      <div className="text-[13px] font-semibold text-[var(--text-primary)] mt-1">{label}</div>
      <div className="text-[11px] text-[var(--text-muted)]">{subtitle}</div>
    </div>
  );
}

export function SloIndicatorsRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
}) {
  const { data: services } = useDashboardData(chartConfig, dataSources);

  const sloMetrics = useMemo(() => {
    let totalRequests = 0;
    let totalErrors = 0;
    let p95Max = 0;

    for (const s of services) {
      const req = Number(s.request_count ?? 0);
      totalRequests += req;
      totalErrors += Number(s.error_count ?? 0);
      p95Max = Math.max(p95Max, Number(s.p95_latency ?? 0));
    }

    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const availability = Math.max(0, 100 - errorRate);
    const p95Target = 500;
    const p95Score = p95Max > 0 ? Math.min(100, (p95Target / p95Max) * 100) : 100;
    const errorBudget = Math.max(0, ((0.1 - errorRate / 100) / 0.1) * 100);

    return { availability, p95Score, errorBudget };
  }, [services]);

  return (
    <Surface
      elevation={1}
      padding="md"
      className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg h-full"
    >
      <h4>SLO Indicators</h4>
      <div className="flex justify-around items-center py-2">
        <SloGauge
          value={sloMetrics.availability}
          label="Availability"
          subtitle="Target: 99.9%"
          thresholds={{ good: 99.9, warn: 99 }}
        />
        <SloGauge
          value={sloMetrics.p95Score}
          label="P95 Latency"
          subtitle="Target: <500ms"
          thresholds={{ good: 90, warn: 70 }}
        />
        <SloGauge
          value={sloMetrics.errorBudget}
          label="Error Budget"
          subtitle="Remaining"
          thresholds={{ good: 50, warn: 20 }}
        />
      </div>
    </Surface>
  );
}
