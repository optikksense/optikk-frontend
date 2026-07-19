import { SERVICE_HEALTH_THRESHOLDS } from "@shared/constants/healthThresholds";
import { Link, useLocation } from "@tanstack/react-router";
import { Database } from "lucide-react";

import { APP_COLORS } from "@config/colorLiterals";
import type { DashboardPanelRendererProps } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useDashboardData } from "@shared/components/ui/dashboard/hooks/useDashboardData";
import { buildDashboardDrawerSearch } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";
import { formatDuration, formatNumber, normalizePercentage } from "@shared/utils/formatters";

interface DbSystemRow extends Record<string, unknown> {
  readonly dbSystem: string;
  readonly avgLatencyMs?: number;
  readonly avgLatency?: number;
  readonly avgQueryLatencyMs?: number;
  readonly p95LatencyMs?: number;
  readonly p95QueryLatency?: number;
  readonly p95Latency?: number;
  readonly spanCount?: number;
  readonly queryCount?: number;
  readonly errorCount?: number;
}

const DB_SYSTEM_META: Record<string, { label: string; color: string; gradient: string }> = {
  postgresql: {
    label: "PostgreSQL",
    color: APP_COLORS.hex_336791,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_336791} 0%, ${APP_COLORS.hex_5e9ed6} 100%)`,
  },
  mysql: {
    label: "MySQL",
    color: APP_COLORS.hex_00758f,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_00758f} 0%, ${APP_COLORS.hex_f29111} 100%)`,
  },
  redis: {
    label: "Redis",
    color: APP_COLORS.hex_dc382d,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_dc382d} 0%, ${APP_COLORS.hex_ff6b6b} 100%)`,
  },
  mongodb: {
    label: "MongoDB",
    color: APP_COLORS.hex_13aa52,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_13aa52} 0%, ${APP_COLORS.hex_6edb8f} 100%)`,
  },
  elasticsearch: {
    label: "Elasticsearch",
    color: APP_COLORS.hex_fec514,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_00bfb3} 0%, ${APP_COLORS.hex_fec514} 100%)`,
  },
  memcached: {
    label: "Memcached",
    color: APP_COLORS.hex_6db33f,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_6db33f} 0%, ${APP_COLORS.hex_98d660} 100%)`,
  },
  cassandra: {
    label: "Cassandra",
    color: APP_COLORS.hex_1287b1,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_1287b1} 0%, ${APP_COLORS.hex_66c7e0} 100%)`,
  },
  mssql: {
    label: "SQL Server",
    color: APP_COLORS.hex_cc2927,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_cc2927} 0%, ${APP_COLORS.hex_e86b69} 100%)`,
  },
  oracle: {
    label: "Oracle",
    color: APP_COLORS.hex_f80000,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_f80000} 0%, ${APP_COLORS.hex_ff6b35} 100%)`,
  },
  sqlite: {
    label: "SQLite",
    color: APP_COLORS.hex_0f80cc,
    gradient: `linear-gradient(135deg, ${APP_COLORS.hex_0f80cc} 0%, ${APP_COLORS.hex_5eb8ff} 100%)`,
  },
};

function getDbMeta(system: string) {
  const key = (system || "unknown").toLowerCase();
  return (
    DB_SYSTEM_META[key] || {
      label: system || "Unknown",
      color: "#8e8e8e", // agnostic fallback icon hue (alpha-concatenated below)
      gradient: `linear-gradient(135deg, ${APP_COLORS.hex_5e60ce} 0%, ${APP_COLORS.hex_48cae4} 100%)`,
    }
  );
}

function n(value: unknown): number {
  return value == null || Number.isNaN(Number(value)) ? 0 : Number(value);
}

function DbSystemCard({ system }: { system: DbSystemRow }) {
  const meta = getDbMeta(system.dbSystem);
  const avgLatency = n(system.avgLatencyMs ?? system.avgLatency ?? system.avgQueryLatencyMs);
  const p95Latency = n(system.p95LatencyMs ?? system.p95QueryLatency ?? system.p95Latency);
  const spanCount = n(system.spanCount ?? system.queryCount);
  const errorCount = n(system.errorCount);
  const errorRate = spanCount > 0 ? normalizePercentage((errorCount / spanCount) * 100) : 0;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border-color)",
        borderRadius: "14px",
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: meta.gradient,
          borderRadius: "14px 14px 0 0",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: `${meta.color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Database size={18} color={meta.color} />
        </div>
        <div>
          <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "14px" }}>
            {meta.label}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>{system.dbSystem}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "11px", marginBottom: "2px" }}>
            Spans
          </div>
          <div
            className="font-mono"
            style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "16px" }}
          >
            {formatNumber(spanCount)}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "11px", marginBottom: "2px" }}>
            Avg Latency
          </div>
          <div
            style={{
              color:
                avgLatency > 100
                  ? APP_COLORS.hex_f04438
                  : avgLatency > 50
                    ? APP_COLORS.hex_f79009
                    : APP_COLORS.hex_12b76a,
              fontWeight: 600,
              fontSize: "16px",
            }}
            className="font-mono"
          >
            {formatDuration(avgLatency)}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "11px", marginBottom: "2px" }}>
            p95 Latency
          </div>
          <div
            className="font-mono"
            style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "14px" }}
          >
            {formatDuration(p95Latency)}
          </div>
        </div>
        {spanCount > 0 && (
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "11px", marginBottom: "2px" }}>
              Error Rate
            </div>
            <div
              style={{
                color:
                  errorRate > SERVICE_HEALTH_THRESHOLDS.unhealthy
                    ? APP_COLORS.hex_f04438
                    : errorRate > SERVICE_HEALTH_THRESHOLDS.degraded
                      ? APP_COLORS.hex_f79009
                      : APP_COLORS.hex_12b76a,
                fontWeight: 600,
                fontSize: "14px",
              }}
              className="font-mono"
            >
              {errorRate.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DbSystemsRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: systems } = useDashboardData(chartConfig, dataSources);
  const location = useLocation();

  if (!systems || systems.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
        No data
      </div>
    );
  }

  return (
    <div
      className="h-full min-h-0 overflow-y-auto pr-1"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 14,
        alignContent: "start",
      }}
    >
      {systems.map((record) => {
        const system = record as unknown as DbSystemRow;
        const search = buildDashboardDrawerSearch(
          location.search,
          chartConfig.drawerAction,
          system
        );
        const card = <DbSystemCard system={system} />;

        if (!search) {
          return <div key={system.dbSystem}>{card}</div>;
        }

        return (
          <Link
            key={system.dbSystem}
            to={location.pathname + search}
            style={{ display: "block", textDecoration: "none" }}
            aria-label={`Open ${system.dbSystem} database detail`}
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}
