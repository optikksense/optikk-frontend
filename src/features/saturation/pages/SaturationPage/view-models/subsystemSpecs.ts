import { ROUTES } from "@/shared/constants/routes";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type {
  DatastoreSummary,
  DatastoreSystemRow,
  KafkaSummary,
} from "../../../api/saturationApi";

import { formatBytesPerSecond } from "../formatUtils";
import { type Tone, toneFromHealth } from "./saturationScore";

export type SubsystemCardSpec = {
  id: "kafka" | "database" | "redis";
  label: string;
  href: string;
  sub: string;
  tone: Tone;
  statusText: string;
  primary: string;
  secondary: string;
  iconName: "kafka" | "db" | "cache";
};

function chipStatus(tone: Tone, count: number, what: string): string {
  if (tone === "ok") return "healthy";
  if (tone === "err") return `${count} ${what} hot`;
  return `${count} ${what} elevated`;
}

export function buildKafkaCardSpec(summary: KafkaSummary | undefined): SubsystemCardSpec {
  const bps = summary?.bytes_per_sec ?? 0;
  const topics = summary?.topic_count ?? 0;
  const groups = summary?.group_count ?? 0;
  const hasData = summary !== undefined && (bps > 0 || topics > 0 || groups > 0);
  return {
    id: "kafka",
    label: "Kafka",
    href: ROUTES.saturationKafkaOverview,
    sub: `${formatNumber(topics)} topics · ${formatNumber(groups)} groups`,
    tone: hasData ? "ok" : "neutral",
    statusText: hasData ? "streaming" : "no data",
    primary: `${formatBytesPerSecond(bps)} traffic`,
    secondary: `${formatNumber(summary?.assigned_partitions ?? 0)} partitions assigned`,
    iconName: "kafka",
  };
}

function categorizedRows(rows: DatastoreSystemRow[], category: string) {
  return rows.filter((row) => row.category === category);
}

function reduceCategory(rows: DatastoreSystemRow[]) {
  if (rows.length === 0) {
    return { qps: 0, p95: 0, errorRate: 0, conns: 0, slow: 0 };
  }
  let totalQps = 0;
  let weightedLatency = 0;
  let totalErrors = 0;
  let totalConns = 0;
  let slow = 0;
  for (const row of rows) {
    const qps = row.query_count ?? 0;
    totalQps += qps;
    weightedLatency += (row.p95_latency_ms ?? 0) * Math.max(qps, 1);
    totalErrors += (row.error_rate ?? 0) * Math.max(qps, 1);
    totalConns += row.active_connections ?? 0;
    if ((row.p95_latency_ms ?? 0) >= 100) slow += 1;
  }
  const denom = Math.max(1, totalQps);
  return {
    qps: totalQps,
    p95: weightedLatency / denom,
    errorRate: totalErrors / denom,
    conns: totalConns,
    slow,
  };
}

function categoryCardSpec(
  id: "database" | "redis",
  label: string,
  rows: DatastoreSystemRow[]
): SubsystemCardSpec {
  const stats = reduceCategory(rows);
  const hasData = rows.length > 0;
  const tone = hasData ? toneFromHealth(stats.p95, stats.errorRate) : "neutral";
  const what = id === "database" ? "instance" : "shard";
  return {
    id,
    label,
    href: ROUTES.saturation,
    sub: `${formatNumber(rows.length)} systems · ${formatNumber(stats.conns)} conns`,
    tone,
    statusText: hasData ? chipStatus(tone, stats.slow, what) : "no data",
    primary: `${formatNumber(stats.qps)} qps · ${formatDuration(stats.p95)} p95`,
    secondary: `${formatPercentage(stats.errorRate, 2)} errors`,
    iconName: id === "database" ? "db" : "cache",
  };
}

export function buildDatabaseCardSpec(rows: DatastoreSystemRow[]): SubsystemCardSpec {
  return categoryCardSpec("database", "Database", categorizedRows(rows, "database"));
}

export type OverviewSummary = {
  totalSystems: number;
  totalQueries: number;
  p95LatencyMs: number;
  errorRate: number;
  tone: Tone;
  statusText: string;
  subline: string;
};

export function buildOverviewSummary(
  ds: DatastoreSummary | undefined,
  kafka: KafkaSummary | undefined
): OverviewSummary {
  const totalSystems = ds?.total_systems ?? 0;
  const totalQueries = ds?.query_count ?? 0;
  const p95 = ds?.p95_latency_ms ?? 0;
  const err = ds?.error_rate ?? 0;
  const hasData = ds !== undefined || kafka !== undefined;
  const tone = hasData ? toneFromHealth(p95, err) : "neutral";
  const subsystemCount = (totalSystems > 0 ? 2 : 0) + (kafka?.topic_count ? 1 : 0);
  const statusText = !hasData
    ? "no data"
    : tone === "ok"
      ? "healthy"
      : tone === "warn"
        ? "elevated latency"
        : "degraded";
  return {
    totalSystems,
    totalQueries,
    p95LatencyMs: p95,
    errorRate: err,
    tone,
    statusText,
    subline: `${formatNumber(totalSystems)} datastores · ${subsystemCount} subsystems · ${formatNumber(totalQueries)} ops in range`,
  };
}
