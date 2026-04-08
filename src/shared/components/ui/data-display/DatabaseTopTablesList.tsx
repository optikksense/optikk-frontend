import { formatDuration, formatNumber } from "@shared/utils/formatters";

import { APP_COLORS } from "@config/colorLiterals";

const CHART_COLORS = [
  APP_COLORS.hex_5e60ce,
  APP_COLORS.hex_48cae4,
  APP_COLORS.hex_06d6a0,
  APP_COLORS.hex_ffd166,
  APP_COLORS.hex_ef476f,
  APP_COLORS.hex_118ab2,
  APP_COLORS.hex_073b4c,
  APP_COLORS.hex_f78c6b,
  APP_COLORS.hex_83d483,
  APP_COLORS.hex_5e35b1,
];

const DB_BADGE_COLORS = {
  postgresql: APP_COLORS.hex_336791,
  mysql: APP_COLORS.hex_00758f,
  redis: APP_COLORS.hex_dc382d,
  mongodb: APP_COLORS.hex_13aa52,
  elasticsearch: APP_COLORS.hex_fec514,
  memcached: APP_COLORS.hex_6db33f,
  cassandra: APP_COLORS.hex_1287b1,
  mssql: APP_COLORS.hex_cc2927,
  oracle: APP_COLORS.hex_f80000,
  sqlite: APP_COLORS.hex_0f80cc,
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
  const normalizedSystem = (system ?? "").toLowerCase();
  if (!isDatabaseSystem(normalizedSystem)) return APP_COLORS.hex_5e60ce;
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
    <div style={{ marginTop: 0, borderTop: `1px solid ${APP_COLORS.rgba_255_255_255_0p05}` }}>
      <div
        style={{
          maxHeight: "280px",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: `var(--border-color, ${APP_COLORS.hex_2d2d2d}) transparent`,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                color: APP_COLORS.hex_8e8e8e,
                borderBottom: `1px solid ${APP_COLORS.rgba_255_255_255_0p05}`,
              }}
            >
              <th style={{ padding: "6px 8px", fontWeight: 500 }}>Table / Collection</th>
              <th style={{ padding: "6px 8px", fontWeight: 500 }}>System</th>
              <th style={{ padding: "6px 8px", fontWeight: 500, textAlign: "right" }}>Queries</th>
              <th style={{ padding: "6px 8px", fontWeight: 500, textAlign: "right" }}>
                Avg Latency
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table, index) => {
              const tableKey = table.key ?? `${table.table_name ?? "unknown"}-${index}`;
              const isSelected = selectedTables.includes(tableKey);
              const isFaded = selectedTables.length > 0 && !isSelected;
              const selectedBg = APP_COLORS.rgba_94_96_206_0p2;
              const hoverBg = APP_COLORS.rgba_255_255_255_0p05;
              const latency = table.avg_query_latency_ms ?? 0;
              const latencyColor =
                latency > 100
                  ? APP_COLORS.hex_f04438
                  : latency > 50
                    ? APP_COLORS.hex_f79009
                    : APP_COLORS.hex_e0e0e0;
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
                    background: isSelected ? selectedBg : "transparent",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    opacity: isFaded ? 0.4 : 1,
                  }}
                  onMouseEnter={(event) => {
                    if (!isFaded) {
                      event.currentTarget.style.background = isSelected ? selectedBg : hoverBg;
                    }
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = isSelected ? selectedBg : "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "5px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: seriesColor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ color: APP_COLORS.hex_e0e0e0, fontWeight: 500 }}>
                        {table.table_name || "unknown"}
                      </span>
                      {table.service_name && table.service_name !== "unknown" && (
                        <span style={{ color: APP_COLORS.hex_8e8e8e, fontSize: "11px" }}>
                          {table.service_name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "5px 8px" }}>
                    {table.db_system && table.db_system !== "unknown" && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.3px",
                          color: badgeColor,
                          background: `${badgeColor}18`,
                          border: `1px solid ${badgeColor}33`,
                          textTransform: "capitalize",
                        }}
                      >
                        {table.db_system}
                      </span>
                    )}
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      padding: "5px 8px",
                      textAlign: "right",
                      color: APP_COLORS.hex_e0e0e0,
                    }}
                  >
                    {formatNumber(table.query_count ?? 0)}
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      padding: "5px 8px",
                      textAlign: "right",
                      color: latencyColor,
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
