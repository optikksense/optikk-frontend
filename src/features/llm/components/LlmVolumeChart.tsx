import { Tooltip } from "@/components/ui";
import { format as dateFnsFormat } from "date-fns";
import { useMemo } from "react";

import { formatNumber } from "@shared/utils/formatters";

import type { LlmTrendBucket } from "../types";

const STATUS_COLORS = {
  errors: "#FF5C5C",
  ok: "#33D391",
} as const;

function parseBucketDate(raw: string): Date | null {
  if (!raw) return null;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)
    ? `${raw.replace(" ", "T")}Z`
    : raw;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatBucketLabel(raw: string, variant: "axis" | "tooltip" = "axis"): string {
  const parsed = parseBucketDate(raw);
  if (!parsed) return raw;
  return dateFnsFormat(parsed, variant === "tooltip" ? "MMM d, HH:mm" : "HH:mm");
}

interface VolumeBarProps {
  bucket: LlmTrendBucket;
  maxTotal: number;
}

function VolumeBar({ bucket, maxTotal }: VolumeBarProps) {
  if (!maxTotal) return null;

  const totalCount = bucket.total_calls;
  const heightPct = totalCount > 0 ? Math.max((totalCount / maxTotal) * 100, 4) : 0;
  const label = formatBucketLabel(bucket.time_bucket, "tooltip");
  const errorCount = bucket.error_calls;
  const okCount = totalCount - errorCount;

  const tooltip = (
    <div className="flex flex-col gap-1">
      <strong>{label}</strong>
      <span>{formatNumber(totalCount)} calls</span>
      {errorCount > 0 && (
        <span className="text-[var(--color-error)]">Errors: {formatNumber(errorCount)}</span>
      )}
      {okCount > 0 && (
        <span className="text-[var(--color-success)]">OK: {formatNumber(okCount)}</span>
      )}
      <span className="text-[var(--text-muted)]">
        Avg latency: {bucket.avg_latency_ms.toFixed(0)}ms
      </span>
      {bucket.total_tokens > 0 && (
        <span className="text-[var(--text-muted)]">
          Tokens: {formatNumber(bucket.total_tokens)}
        </span>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltip} placement="top">
      <div
        className="relative flex flex-1 cursor-crosshair items-end justify-center"
        style={{ minWidth: 2 }}
      >
        {totalCount > 0 && (
          <div
            className="flex w-full flex-col overflow-hidden rounded-t-[2px]"
            style={{ height: `${heightPct}%`, minHeight: 2 }}
          >
            {errorCount > 0 && (
              <div style={{ flex: errorCount, background: STATUS_COLORS.errors }} />
            )}
            {okCount > 0 && <div style={{ flex: okCount, background: STATUS_COLORS.ok }} />}
          </div>
        )}
      </div>
    </Tooltip>
  );
}

function pickTickIndices(count: number, desired = 6): number[] {
  if (count <= desired) return Array.from({ length: count }, (_, i) => i);
  const indices: number[] = [];
  for (let i = 0; i < desired; i += 1) {
    indices.push(Math.round((i / (desired - 1)) * (count - 1)));
  }
  return [...new Set(indices)];
}

interface LlmVolumeChartProps {
  buckets: LlmTrendBucket[];
  isLoading: boolean;
}

export default function LlmVolumeChart({ buckets, isLoading }: LlmVolumeChartProps) {
  const maxTotal = useMemo(() => Math.max(...buckets.map((b) => b.total_calls), 1), [buckets]);
  const tickIndices = useMemo(() => pickTickIndices(buckets.length, 6), [buckets.length]);

  if (isLoading) {
    return (
      <div className="flex h-[120px] items-center justify-center text-[var(--text-muted)]">
        <div className="ok-spinner" />
      </div>
    );
  }

  if (buckets.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-[13px] text-[var(--text-muted)]">
        No trend data
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex h-[120px] items-end gap-[1px]">
        {buckets.map((bucket, index) => (
          <VolumeBar key={bucket.time_bucket || index} bucket={bucket} maxTotal={maxTotal} />
        ))}
      </div>
      <div className="relative flex h-4 text-[10px] text-[var(--text-muted)]">
        {tickIndices.map((index) => {
          const left = buckets.length <= 1 ? "0%" : `${(index / (buckets.length - 1)) * 100}%`;
          return (
            <span
              key={index}
              className="-translate-x-1/2 absolute"
              style={{
                left,
                ...(index === 0 ? { transform: "none" } : {}),
                ...(index === buckets.length - 1 ? { transform: "translateX(-100%)" } : {}),
              }}
            >
              {formatBucketLabel(buckets[index].time_bucket)}
            </span>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: STATUS_COLORS.ok }}
          />
          OK
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: STATUS_COLORS.errors }}
          />
          Error
        </div>
      </div>
    </div>
  );
}
