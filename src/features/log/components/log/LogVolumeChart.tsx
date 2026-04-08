import { Tooltip } from "@/components/ui";
import { format as dateFnsFormat } from "date-fns";
import { useMemo } from "react";

import { formatNumber } from "@shared/utils/formatters";

import { APP_COLORS } from "@config/colorLiterals";

import type { LogVolumeBucket } from "../../types";

const LEVEL_COLORS: Record<
  "errors" | "warnings" | "infos" | "debugs" | "fatals" | "traces",
  string
> = {
  fatals: "#6F1B1B",
  errors: "#FF5C5C",
  warnings: "#FFB300",
  infos: "#2871E6",
  debugs: "#6C737A",
  traces: "#B0B8C4",
};

export { LEVEL_COLORS };

interface VolumeLegendTotals {
  fatals: number;
  errors: number;
  warnings: number;
  infos: number;
  debugs: number;
}

type VolumeLevelKey = keyof VolumeLegendTotals;

const EMPTY_TOTALS: VolumeLegendTotals = {
  fatals: 0,
  errors: 0,
  warnings: 0,
  infos: 0,
  debugs: 0,
};

function toCount(value: unknown): number {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

function getBucketTimeLabel(bucket: LogVolumeBucket): string {
  const raw = bucket.timeBucket ?? bucket.time_bucket;
  return typeof raw === "string" ? raw : "";
}

function getBucketLevelCount(bucket: LogVolumeBucket, key: VolumeLevelKey): number {
  return toCount(bucket[key]);
}

function getBucketTotal(bucket: LogVolumeBucket): number {
  return toCount(bucket.total);
}

function parseBucketDate(raw: string): Date | null {
  if (!raw) return null;

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)
    ? `${raw.replace(" ", "T")}Z`
    : raw;
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatBucketLabel(
  raw: string,
  step: string,
  variant: "axis" | "tooltip" = "axis"
): string {
  const parsed = parseBucketDate(raw);
  if (!parsed) return raw;

  if (step === "1d") {
    return dateFnsFormat(parsed, variant === "tooltip" ? "MMM d, yyyy" : "MMM d");
  }

  if (step === "1h") {
    return dateFnsFormat(parsed, variant === "tooltip" ? "MMM d, HH:mm" : "MMM d, HH");
  }

  return dateFnsFormat(parsed, "HH:mm");
}

interface VolumeBarProps {
  bucket: LogVolumeBucket;
  maxTotal: number;
  step: string;
}

function VolumeBar({ bucket, maxTotal, step }: VolumeBarProps) {
  if (!maxTotal) return null;

  const totalCount = getBucketTotal(bucket);
  const heightPct = totalCount > 0 ? Math.max((totalCount / maxTotal) * 100, 4) : 0;
  const rawLabel = getBucketTimeLabel(bucket);
  const label = formatBucketLabel(rawLabel, step, "tooltip");

  const fatals = getBucketLevelCount(bucket, "fatals");
  const errors = getBucketLevelCount(bucket, "errors");
  const warnings = getBucketLevelCount(bucket, "warnings");
  const infos = getBucketLevelCount(bucket, "infos");
  const debugs = getBucketLevelCount(bucket, "debugs");
  const hasLevels = fatals > 0 || errors > 0 || warnings > 0 || infos > 0 || debugs > 0;
  const tooltip = (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <strong>{label}</strong>
      <span>{formatNumber(totalCount)} logs</span>
      {fatals > 0 && <span>Fatal: {formatNumber(fatals)}</span>}
      {errors > 0 && <span>Error: {formatNumber(errors)}</span>}
      {warnings > 0 && <span>Warn: {formatNumber(warnings)}</span>}
      {infos > 0 && <span>Info: {formatNumber(infos)}</span>}
      {debugs > 0 && <span>Debug: {formatNumber(debugs)}</span>}
    </div>
  );

  return (
    <Tooltip content={tooltip} placement="top">
      <div
        className={`logs-volume-bar-wrapper${totalCount === 0 ? " logs-volume-bar-wrapper--empty" : ""}`}
      >
        {totalCount > 0 && (
          <div className="logs-volume-bar-stack" style={{ height: `${heightPct}%` }}>
            {fatals > 0 && <div style={{ flex: fatals, background: LEVEL_COLORS.fatals }} />}
            {errors > 0 && <div style={{ flex: errors, background: LEVEL_COLORS.errors }} />}
            {warnings > 0 && <div style={{ flex: warnings, background: LEVEL_COLORS.warnings }} />}
            {infos > 0 && <div style={{ flex: infos, background: LEVEL_COLORS.infos }} />}
            {debugs > 0 && <div style={{ flex: debugs, background: LEVEL_COLORS.debugs }} />}
            {!hasLevels && <div style={{ flex: 1, background: APP_COLORS.hex_98a2b3 }} />}
          </div>
        )}
      </div>
    </Tooltip>
  );
}

function pickTickIndices(count: number, desired = 5): number[] {
  if (count <= desired) return Array.from({ length: count }, (_, index) => index);

  const indices: number[] = [];
  for (let index = 0; index < desired; index += 1) {
    indices.push(Math.round((index / (desired - 1)) * (count - 1)));
  }

  return [...new Set(indices)];
}

function getTickPosition(index: number, count: number): string {
  if (count <= 1) return "0%";
  return `${(index / (count - 1)) * 100}%`;
}

interface LogVolumeChartProps {
  buckets: LogVolumeBucket[];
  step: string;
  isLoading: boolean;
}

export default function LogVolumeChart({ buckets, step, isLoading }: LogVolumeChartProps) {
  const maxTotal = useMemo(
    () => Math.max(...buckets.map((bucket: LogVolumeBucket) => getBucketTotal(bucket)), 1),
    [buckets]
  );
  const tickIndices = useMemo(() => pickTickIndices(buckets.length, 6), [buckets.length]);
  const tickLabels = useMemo(
    () =>
      tickIndices.map((index) => ({
        index,
        label: formatBucketLabel(getBucketTimeLabel(buckets[index]), step),
        position: getTickPosition(index, buckets.length),
        edge: index === 0 ? "start" : index === buckets.length - 1 ? "end" : "middle",
      })),
    [buckets, step, tickIndices]
  );

  if (isLoading)
    return (
      <div className="logs-chart-empty">
        <div className="ok-spinner" />
      </div>
    );
  if (buckets.length === 0) return <div className="logs-chart-empty">No volume data</div>;

  return (
    <div className="logs-volume-chart-wrap">
      <div className="logs-volume-chart">
        {buckets.map((bucket: LogVolumeBucket, index: number) => (
          <VolumeBar
            key={getBucketTimeLabel(bucket) || index}
            bucket={bucket}
            maxTotal={maxTotal}
            step={step}
          />
        ))}
      </div>
      <div className="logs-volume-axis">
        {tickLabels.map(({ index, label, position, edge }) => {
          const justifyContent =
            edge === "start" ? "flex-start" : edge === "end" ? "flex-end" : "center";

          return (
            <div
              key={index}
              className="logs-volume-axis-tick"
              style={{ left: position, justifyContent }}
            >
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface VolumeLegendProps {
  buckets: LogVolumeBucket[];
}

export function VolumeLegend({ buckets }: VolumeLegendProps) {
  if (!buckets.length) return null;

  const totals = buckets.reduce<VolumeLegendTotals>(
    (accumulator: VolumeLegendTotals, bucket: LogVolumeBucket) => ({
      fatals: accumulator.fatals + getBucketLevelCount(bucket, "fatals"),
      errors: accumulator.errors + getBucketLevelCount(bucket, "errors"),
      warnings: accumulator.warnings + getBucketLevelCount(bucket, "warnings"),
      infos: accumulator.infos + getBucketLevelCount(bucket, "infos"),
      debugs: accumulator.debugs + getBucketLevelCount(bucket, "debugs"),
    }),
    EMPTY_TOTALS
  );

  const legendItems: Array<{ key: VolumeLevelKey; label: string; color: string }> = [
    { key: "fatals", label: "Fatal", color: LEVEL_COLORS.fatals },
    { key: "errors", label: "Error", color: LEVEL_COLORS.errors },
    { key: "warnings", label: "Warn", color: LEVEL_COLORS.warnings },
    { key: "infos", label: "Info", color: LEVEL_COLORS.infos },
    { key: "debugs", label: "Debug", color: LEVEL_COLORS.debugs },
  ];
  const items = legendItems.filter((item) => totals[item.key] > 0);

  if (!items.length) return null;

  return (
    <div className="logs-volume-legend">
      {items.map(({ key, label, color }) => (
        <div key={key} className="logs-volume-legend-item">
          <span className="logs-volume-legend-dot" style={{ background: color }} />
          <span>{label}</span>
          <span className="logs-volume-legend-count">{formatNumber(totals[key])}</span>
        </div>
      ))}
    </div>
  );
}
