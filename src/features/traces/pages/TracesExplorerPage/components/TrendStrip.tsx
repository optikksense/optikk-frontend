import type { TrendBucket } from "@shared/search/components/trend/TrendHistogramStrip";
import { formatNumber, formatTimestamp } from "@shared/utils/formatters";
import { useState } from "react";

interface Props {
  buckets: readonly TrendBucket[];
  startTime: number;
  endTime: number;
}

const PLOT_H = 160;

// Status classes (HTTP 2xx / 4xx / 5xx → ok / warn / error), drawn bottom→top.
const SEGMENTS = [
  { key: "ok", label: "OK", color: "var(--color-success)" },
  { key: "warn", label: "Warn", color: "var(--color-warning)" },
  { key: "error", label: "Error", color: "var(--color-error)" },
] as const;

export function TrendStrip({ buckets, startTime, endTime }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const maxTotal = Math.max(...buckets.map((b) => Number(b.counts?.total) || 0), 1);
  const durationMs = Math.max(endTime - startTime, 1);

  let bucketMs = 5 * 60 * 1000;
  if (buckets.length > 1) {
    let minGap = Number.POSITIVE_INFINITY;
    for (let i = 1; i < buckets.length; i++) {
      const gap = buckets[i].ts - buckets[i - 1].ts;
      if (gap > 0 && gap < minGap) minGap = gap;
    }
    if (Number.isFinite(minGap)) bucketMs = minGap;
  }
  const widthPct = Math.max((bucketMs / durationMs) * 100, 0.5);

  return (
    <div className="bg-card border border-border rounded-lg p-[18px] mb-4">
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="text-[14.5px] font-bold text-foreground">Trace Volume Over Time</div>
        <div className="flex flex-row items-center gap-4">
          {SEGMENTS.map((s) => (
            <LegendDot key={s.key} color={s.color} label={s.label} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[34px_1fr] gap-2">
        <div
          className="font-mono text-foreground-muted"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: PLOT_H,
            fontSize: 11,
            textAlign: "right",
          }}
        >
          <div>{formatNumber(maxTotal)}</div>
          <div>{formatNumber(maxTotal / 2)}</div>
          <div>0</div>
        </div>

        <div>
          <div style={{ position: "relative", height: PLOT_H }} onMouseLeave={() => setHover(null)}>
            {[0, 0.5, 1].map((g) => (
              <div
                key={g}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: g * PLOT_H,
                  borderTop: "1px dashed var(--line)",
                }}
              />
            ))}
            {buckets.map((b, i) => {
              const total = Number(b.counts?.total) || 0;
              const errors = Number(b.counts?.errors) || 0;
              const warnings = Number(b.counts?.warnings) || 0;
              if (total === 0 && errors === 0 && warnings === 0) return null;
              const seg = {
                ok: Math.max(total - errors - warnings, 0),
                warn: warnings,
                error: errors,
              };
              const leftRaw = ((b.ts - startTime) / durationMs) * 100;
              const leftPct = Math.max(0, Math.min(100 - widthPct, leftRaw));
              const active = hover === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  className="flex flex-col justify-end"
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                >
                  <div
                    className="flex flex-col-reverse"
                    style={{
                      height: `${(total / maxTotal) * 100}%`,
                      width: "calc(100% - 1px)",
                      outline: active ? "1px solid var(--fg-3)" : "none",
                      opacity: hover === null || active ? 1 : 0.55,
                    }}
                  >
                    {SEGMENTS.map((s) => (
                      <div
                        key={s.key}
                        style={{ height: `${(seg[s.key] / total) * 100}%`, background: s.color }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {hover !== null && buckets[hover] ? (
              <Tooltip
                bucket={buckets[hover]}
                widthPct={widthPct}
                durationMs={durationMs}
                startTime={startTime}
              />
            ) : null}
          </div>
          <div
            className="flex flex-row justify-between text-foreground-muted"
            style={{ marginTop: 6, fontSize: 11 }}
          >
            <span>{formatTimestamp(startTime)}</span>
            <span>{formatTimestamp((startTime + endTime) / 2)}</span>
            <span>{formatTimestamp(endTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tooltip({
  bucket,
  widthPct,
  durationMs,
  startTime,
}: {
  bucket: TrendBucket;
  widthPct: number;
  durationMs: number;
  startTime: number;
}) {
  const total = Number(bucket.counts?.total) || 0;
  const errors = Number(bucket.counts?.errors) || 0;
  const warnings = Number(bucket.counts?.warnings) || 0;
  const rows = [
    { label: "OK", color: "var(--color-success)", value: Math.max(total - errors - warnings, 0) },
    { label: "Warn", color: "var(--color-warning)", value: warnings },
    { label: "Error", color: "var(--color-error)", value: errors },
  ];
  const centerPct = Math.max(
    0,
    Math.min(100, ((bucket.ts - startTime) / durationMs) * 100 + widthPct / 2)
  );

  return (
    <div
      className="bg-card"
      style={{
        position: "absolute",
        bottom: PLOT_H + 6,
        left: `${centerPct}%`,
        transform: "translateX(-50%)",
        border: "1px solid var(--line)",
        borderRadius: 6,
        padding: "8px 10px",
        boxShadow: "var(--shadow-md, 0 4px 12px rgba(0,0,0,0.12))",
        fontSize: 11.5,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <div className="font-mono text-foreground-muted" style={{ marginBottom: 4 }}>
        {formatTimestamp(bucket.ts)}
      </div>
      <div style={{ fontWeight: 700, color: "var(--fg-0)", marginBottom: 4 }}>
        {formatNumber(total)} traces
      </div>
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex flex-row items-center justify-between"
          style={{ gap: 12 }}
        >
          <span className="flex flex-row items-center" style={{ gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.color }} />
            <span style={{ color: "var(--fg-1)" }}>{r.label}</span>
          </span>
          <span className="font-mono" style={{ color: "var(--fg-0)" }}>
            {formatNumber(r.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-row items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[12.5px] text-foreground-secondary">{label}</span>
    </div>
  );
}
