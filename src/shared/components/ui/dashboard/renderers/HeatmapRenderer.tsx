import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import { useDashboardData } from '../hooks/useDashboardData';

/**
 *
 */
export function HeatmapRenderer({
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

  const xKey = chartConfig.xKey || 'operation_name';
  const yKey = chartConfig.yKey || 'service_name';
  const valueKey = chartConfig.valueKey || 'error_rate';

  const xValues = Array.from(new Set(rows.map((r: any) => String(r[xKey] ?? '')))).slice(0, 20);
  const yValues = Array.from(new Set(rows.map((r: any) => String(r[yKey] ?? ''))));
  const lookup: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    const x = String(row[xKey] ?? '');
    const y = String(row[yKey] ?? '');
    if (!lookup[y]) lookup[y] = {};
    lookup[y][x] = Number(row[valueKey]) || 0;
  }
  const maxVal = Math.max(...rows.map((r: any) => Number(r[valueKey]) || 0), 1);
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 8px', textAlign: 'left' }}></th>
            {xValues.map((x) => (
              <th
                key={x}
                style={{
                  padding: '4px 6px',
                  fontWeight: 400,
                  maxWidth: 80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={x}
              >
                {x.slice(0, 12)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yValues.map((y) => (
            <tr key={y}>
              <td style={{ padding: '4px 8px', fontWeight: 500, whiteSpace: 'nowrap' }}>{y}</td>
              {xValues.map((x) => {
                const val = lookup[y]?.[x] ?? 0;
                const intensity = Math.min(1, val / maxVal);
                const bg = `rgba(240,68,56,${intensity.toFixed(2)})`;
                return (
                  <td
                    key={x}
                    style={{
                      background: bg,
                      padding: '4px 6px',
                      textAlign: 'center',
                      color: intensity > 0.5 ? '#fff' : 'inherit',
                    }}
                  >
                    {val > 0 ? (val < 1 ? val.toFixed(2) : val.toFixed(0)) : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
