import { useMemo, useRef } from "react";

interface HeatmapCell {
  readonly time_bucket: string;
  readonly bucket_ms: number;
  readonly count: number;
}

interface Props {
  readonly cells: readonly HeatmapCell[];
  readonly height?: number;
}

interface Grid {
  readonly times: string[];
  readonly buckets: number[];
  readonly counts: Map<string, number>;
  readonly maxCount: number;
}

function buildGrid(cells: readonly HeatmapCell[]): Grid {
  const timeSet = new Set<string>();
  const bucketSet = new Set<number>();
  const counts = new Map<string, number>();
  let maxCount = 0;
  for (const c of cells) {
    timeSet.add(c.time_bucket);
    bucketSet.add(c.bucket_ms);
    const key = `${c.time_bucket}|${c.bucket_ms}`;
    counts.set(key, c.count);
    if (c.count > maxCount) maxCount = c.count;
  }
  const times = [...timeSet].sort();
  const buckets = [...bucketSet].sort((a, b) => a - b);
  return { times, buckets, counts, maxCount };
}

function colorFor(count: number, max: number): string {
  if (max <= 0 || count <= 0) return "rgba(255,255,255,0.04)";
  const t = Math.sqrt(count / max);
  const hue = 220 - 220 * t;
  const lightness = 30 + 30 * t;
  return `hsl(${hue.toFixed(0)}, 80%, ${lightness.toFixed(0)}%)`;
}

function fmtMs(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}s`;
  return `${Math.round(v)}ms`;
}

function HeatmapCellView({
  time,
  bucket,
  count,
  maxCount,
  width,
  rowHeight,
}: {
  time: string;
  bucket: number;
  count: number;
  maxCount: number;
  width: number;
  rowHeight: number;
}) {
  return (
    <div
      title={`${time}\n${fmtMs(bucket)} → ${count.toLocaleString()}`}
      style={{
        width,
        height: rowHeight,
        background: colorFor(count, maxCount),
        borderRight: "1px solid rgba(0,0,0,0.15)",
        borderBottom: "1px solid rgba(0,0,0,0.15)",
      }}
    />
  );
}

export function LatencyHeatmap({ cells, height = 240 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { times, buckets, counts, maxCount } = useMemo(() => buildGrid(cells), [cells]);

  if (cells.length === 0 || times.length === 0 || buckets.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[12px] text-[var(--text-muted)]"
        style={{ height }}
      >
        No latency data in this window.
      </div>
    );
  }

  const cellWidth = Math.max(2, Math.floor(800 / times.length));
  const rowHeight = Math.max(8, Math.floor(height / buckets.length));

  return (
    <div ref={ref} style={{ height }} className="overflow-auto">
      <div className="flex">
        <div className="flex flex-col text-[10px] text-[var(--text-muted)]" style={{ width: 60 }}>
          {[...buckets].reverse().map((b) => (
            <div key={b} style={{ height: rowHeight }} className="px-2 py-0.5 text-right">
              {fmtMs(b)}
            </div>
          ))}
        </div>
        <div>
          {[...buckets].reverse().map((b) => (
            <div key={b} className="flex">
              {times.map((t) => (
                <HeatmapCellView
                  key={`${t}|${b}`}
                  time={t}
                  bucket={b}
                  count={counts.get(`${t}|${b}`) ?? 0}
                  maxCount={maxCount}
                  width={cellWidth}
                  rowHeight={rowHeight}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
