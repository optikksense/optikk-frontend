import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import { APP_COLORS } from '@config/colorLiterals';

import { useDashboardData } from '../hooks/useDashboardData';

/**
 *
 */
export function ScorecardRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
}) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  if (rows.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
        No data
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 8 }}>
      {rows.map((row: any, i: number) => {
        const name = row.service_name || row.service || `Service ${i + 1}`;
        const rps = Number(row.rps ?? 0).toFixed(1);
        const errPct = Number(row.error_pct ?? row.error_rate ?? 0).toFixed(1);
        const p95 = Number(row.p95_ms ?? row.p95 ?? 0).toFixed(0);
        return (
          <div
            key={name}
            style={{
              background: 'var(--glass-bg, rgba(255,255,255,0.05))',
              border: '1px solid var(--glass-border, #333)',
              borderRadius: 8,
              padding: '8px 12px',
              minWidth: 160,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary, #888)' }}>
              <span style={{ marginRight: 8 }}>{rps} rps</span>
              <span
                style={{
                  marginRight: 8,
                  color: Number(errPct) > 1 ? APP_COLORS.hex_f04438 : undefined,
                }}
              >
                {errPct}% err
              </span>
              <span>{p95}ms p95</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
