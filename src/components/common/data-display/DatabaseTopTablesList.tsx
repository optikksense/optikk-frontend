import { formatNumber, formatDuration } from '@utils/formatters';

const CHART_COLORS = [
  '#5E60CE',
  '#48CAE4',
  '#06D6A0',
  '#FFD166',
  '#EF476F',
  '#118AB2',
  '#073B4C',
  '#F78C6B',
  '#83D483',
  '#5E35B1',
];

const DB_BADGE_COLORS = {
  postgresql: '#336791',
  mysql: '#00758F',
  redis: '#DC382D',
  mongodb: '#13AA52',
  elasticsearch: '#FEC514',
  memcached: '#6DB33F',
  cassandra: '#1287B1',
  mssql: '#CC2927',
  oracle: '#F80000',
  sqlite: '#0F80CC',
} as const;

type DatabaseSystem = keyof typeof DB_BADGE_COLORS;

interface DatabaseTopTableItem {
  key?: string;
  table_name?: string;
  service_name?: string;
  db_system?: string;
  query_count?: number;
  avg_query_latency_ms?: number;
}

interface DatabaseTopTablesListProps {
  tables?: DatabaseTopTableItem[];
  selectedTables?: string[];
  onToggle?: (tableKey: string) => void;
}

function isDatabaseSystem(system: string): system is DatabaseSystem {
  return system in DB_BADGE_COLORS;
}

function getBadgeColor(system: string | undefined): string {
  const normalizedSystem = (system ?? '').toLowerCase();
  if (!isDatabaseSystem(normalizedSystem)) return '#5E60CE';
  return DB_BADGE_COLORS[normalizedSystem];
}

/**
 * Renders top database table/collection metrics with system badges.
 * @param props Component props.
 * @returns Rendered database table list.
 */
export default function DatabaseTopTablesList({
  tables = [],
  selectedTables = [],
  onToggle,
}: DatabaseTopTablesListProps): JSX.Element | null {
  if (tables.length === 0) return null;

  return (
    <div style={{ marginTop: 0, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div
        style={{
          maxHeight: '280px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-color, #2D2D2D) transparent',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                color: '#8e8e8e',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>Table / Collection</th>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>System</th>
              <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>
                Queries
              </th>
              <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>
                Avg Latency
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table, index) => {
              const tableKey = table.key ?? `${table.table_name ?? 'unknown'}-${index}`;
              const isSelected = selectedTables.includes(tableKey);
              const isFaded = selectedTables.length > 0 && !isSelected;
              const selectedBg = 'rgba(94, 96, 206, 0.2)';
              const hoverBg = 'rgba(255, 255, 255, 0.05)';
              const latency = table.avg_query_latency_ms ?? 0;
              const latencyColor = latency > 100 ? '#F04438' : latency > 50 ? '#F79009' : '#e0e0e0';
              const seriesColor = CHART_COLORS[index % CHART_COLORS.length];
              const badgeColor = getBadgeColor(table.db_system);

              return (
                <tr
                  key={tableKey}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle?.(tableKey);
                  }}
                  style={{
                    background: isSelected ? selectedBg : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    opacity: isFaded ? 0.4 : 1,
                  }}
                  onMouseEnter={(event) => {
                    if (!isFaded) {
                      event.currentTarget.style.background = isSelected ? selectedBg : hoverBg;
                    }
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = isSelected ? selectedBg : 'transparent';
                  }}
                >
                  <td
                    style={{
                      padding: '5px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: seriesColor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 500 }}>
                        {table.table_name || 'unknown'}
                      </span>
                      {table.service_name && table.service_name !== 'unknown' && (
                        <span style={{ color: '#8e8e8e', fontSize: '11px' }}>
                          {table.service_name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '5px 8px' }}>
                    {table.db_system && table.db_system !== 'unknown' && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.3px',
                          color: badgeColor,
                          background: `${badgeColor}18`,
                          border: `1px solid ${badgeColor}33`,
                          textTransform: 'capitalize',
                        }}
                      >
                        {table.db_system}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '5px 8px',
                      textAlign: 'right',
                      color: '#e0e0e0',
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatNumber(table.query_count ?? 0)}
                  </td>
                  <td
                    style={{
                      padding: '5px 8px',
                      textAlign: 'right',
                      color: latencyColor,
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatDuration(latency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
