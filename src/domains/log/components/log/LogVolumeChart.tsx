import { APP_COLORS } from '@config/colorLiterals';
import { Spin } from 'antd';
import { useMemo } from 'react';

import { formatNumber } from '@utils/formatters';
import type { LogVolumeBucket } from '../../types';

/* ─── Level colours ───────────────────────────────────────────────────────── */
const LEVEL_COLORS: Record<'errors' | 'warnings' | 'infos' | 'debugs' | 'fatals' | 'traces', string> = {
  errors: APP_COLORS.hex_f04438,
  warnings: APP_COLORS.hex_f79009,
  infos: APP_COLORS.hex_06aed5,
  debugs: APP_COLORS.hex_5e60ce,
  fatals: APP_COLORS.hex_d92d20,
  traces: APP_COLORS.hex_98a2b3,
};

export { LEVEL_COLORS };

type VolumeLegendTotals = {
  fatals: number;
  errors: number;
  warnings: number;
  infos: number;
  debugs: number;
};

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
  return typeof raw === 'string' ? raw : '';
}

function getBucketLevelCount(bucket: LogVolumeBucket, key: VolumeLevelKey): number {
  return toCount(bucket[key]);
}

function getBucketTotal(bucket: LogVolumeBucket): number {
  return toCount(bucket.total);
}

/* ─── VolumeBar ───────────────────────────────────────────────────────────── */
interface VolumeBarProps {
  bucket: LogVolumeBucket;
  maxTotal: number;
}

function VolumeBar({ bucket, maxTotal }: VolumeBarProps) {
  if (!maxTotal) return null;

  const totalCount = getBucketTotal(bucket);
  const heightPct = totalCount > 0 ? Math.max((totalCount / maxTotal) * 100, 4) : 0;
  const label = getBucketTimeLabel(bucket).replace(/:00$/, '');

  const fatals = getBucketLevelCount(bucket, 'fatals');
  const errors = getBucketLevelCount(bucket, 'errors');
  const warnings = getBucketLevelCount(bucket, 'warnings');
  const infos = getBucketLevelCount(bucket, 'infos');
  const debugs = getBucketLevelCount(bucket, 'debugs');
  const hasLevels = fatals > 0 || errors > 0 || warnings > 0 || infos > 0 || debugs > 0;

  return (
    <div
      className={`logs-volume-bar-wrapper${totalCount === 0 ? ' logs-volume-bar-wrapper--empty' : ''}`}
      title={totalCount > 0 ? `${label}  •  ${totalCount.toLocaleString()} logs` : label}
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
  );
}

/* ─── Axis tick helpers ───────────────────────────────────────────────────── */
function pickTickIndices(count: number, desired = 5): number[] {
  if (count <= desired) return Array.from({ length: count }, (_, index) => index);

  const indices: number[] = [];
  for (let index = 0; index < desired; index += 1) {
    indices.push(Math.round((index / (desired - 1)) * (count - 1)));
  }

  return [...new Set(indices)];
}

function shortTimeLabel(raw: string): string {
  if (!raw) return '';

  const parts = raw.split(' ');
  if (parts.length < 2) return raw;

  return parts[1].slice(0, 5);
}

/* ─── LogVolumeChart ──────────────────────────────────────────────────────── */
/**
 *
 * @param root0
 * @param root0.buckets
 * @param root0.isLoading
 */
interface LogVolumeChartProps {
  buckets: LogVolumeBucket[];
  isLoading: boolean;
}

export default function LogVolumeChart({ buckets, isLoading }: LogVolumeChartProps) {
  const maxTotal = useMemo(
    () => Math.max(...buckets.map((bucket: LogVolumeBucket) => getBucketTotal(bucket)), 1),
    [buckets],
  );

  if (isLoading) return <div className="logs-chart-empty"><Spin size="small" /></div>;
  if (buckets.length === 0) return <div className="logs-chart-empty">No volume data</div>;

  const tickIndices = new Set(pickTickIndices(buckets.length, 6));

  return (
    <div className="logs-volume-chart-wrap">
      <div className="logs-volume-chart">
        {buckets.map((bucket: LogVolumeBucket, index: number) => (
          <VolumeBar key={getBucketTimeLabel(bucket) || index} bucket={bucket} maxTotal={maxTotal} />
        ))}
      </div>
      <div className="logs-volume-axis">
        {buckets.map((bucket: LogVolumeBucket, index: number) => {
          const label = getBucketTimeLabel(bucket);
          return (
            <div
              key={index}
              className="logs-volume-axis-tick"
              style={{ visibility: tickIndices.has(index) ? 'visible' : 'hidden' }}
            >
              {shortTimeLabel(label)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── VolumeLegend ────────────────────────────────────────────────────────── */
/**
 *
 * @param root0
 * @param root0.buckets
 */
interface VolumeLegendProps {
  buckets: LogVolumeBucket[];
}

export function VolumeLegend({ buckets }: VolumeLegendProps) {
  if (!buckets.length) return null;

  const totals = buckets.reduce<VolumeLegendTotals>(
    (accumulator: VolumeLegendTotals, bucket: LogVolumeBucket) => ({
      fatals: accumulator.fatals + getBucketLevelCount(bucket, 'fatals'),
      errors: accumulator.errors + getBucketLevelCount(bucket, 'errors'),
      warnings: accumulator.warnings + getBucketLevelCount(bucket, 'warnings'),
      infos: accumulator.infos + getBucketLevelCount(bucket, 'infos'),
      debugs: accumulator.debugs + getBucketLevelCount(bucket, 'debugs'),
    }),
    EMPTY_TOTALS,
  );

  const legendItems: Array<{ key: VolumeLevelKey; label: string; color: string }> = [
    { key: 'fatals', label: 'Fatal', color: LEVEL_COLORS.fatals },
    { key: 'errors', label: 'Error', color: LEVEL_COLORS.errors },
    { key: 'warnings', label: 'Warn', color: LEVEL_COLORS.warnings },
    { key: 'infos', label: 'Info', color: LEVEL_COLORS.infos },
    { key: 'debugs', label: 'Debug', color: LEVEL_COLORS.debugs },
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
