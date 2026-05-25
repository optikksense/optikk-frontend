import { memo, useMemo, useRef, useState } from "react";

import { useTimezone } from "@/app/store/appStore";
import { aggregateSeverityTrend, toTrendBuckets } from "@/features/explorer/utils/trend";

import type { LogsTrendBucket } from "../../api/logsAnalyticsApi";

interface Props {
  readonly trend: readonly LogsTrendBucket[] | undefined;
  readonly zoomed?: boolean;
  readonly onTimeRangeChange?: (fromMs: number, toMs: number) => void;
  readonly minTimeMs?: number;
  readonly maxTimeMs?: number;
}

interface ChartBucket {
  readonly ts: number;
  readonly info: number;
  readonly warn: number;
  readonly err: number;
}

const W = 1000;
const H = 180;
const PAD_L = 36;
const PAD_R = 18;
const PAD_T = 12;
const PAD_B = 28;
const MIN_BAR_W = 2;
const BRUSH_THRESHOLD_PX = 8; // viewBox units (≈ same as px at 1:1 width)

function pickTimeFormat(spanMs: number): Intl.DateTimeFormatOptions {
  if (spanMs <= 3 * 60 * 60 * 1000) return { hour: "numeric", minute: "2-digit" };
  if (spanMs <= 36 * 60 * 60 * 1000) return { hour: "numeric", hour12: true };
  if (spanMs <= 14 * 24 * 60 * 60 * 1000)
    return { month: "short", day: "numeric", hour: "numeric", hour12: true };
  return { month: "short", day: "numeric" };
}

function pickTooltipFormat(spanMs: number): Intl.DateTimeFormatOptions {
  if (spanMs <= 36 * 60 * 60 * 1000)
    return { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
}

function compactY(v: number): string {
  if (v === 0) return "0";
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(v);
}

function inferBucketMs(buckets: readonly ChartBucket[]): number {
  if (buckets.length < 2) return 60_000;
  let minDiff = Number.POSITIVE_INFINITY;
  for (let i = 1; i < buckets.length; i++) {
    const d = buckets[i].ts - buckets[i - 1].ts;
    if (d > 0 && d < minDiff) minDiff = d;
  }
  return Number.isFinite(minDiff) ? minDiff : 60_000;
}

function LogsTrendChartComponent({
  trend,
  zoomed: _zoomed,
  onTimeRangeChange,
  minTimeMs,
  maxTimeMs,
}: Props) {
  const tz = useTimezone();
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Pending = pointerdown happened but movement is still under threshold.
  // Brushing = movement crossed threshold, capture is active.
  const [pending, setPending] = useState<{ x0: number } | null>(null);
  const [brush, setBrush] = useState<{ x0: number; x1: number } | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const buckets = useMemo<readonly ChartBucket[]>(() => {
    const aggregated = toTrendBuckets(aggregateSeverityTrend(trend));
    return aggregated.map((b) => {
      const errors = b.counts.errors ?? 0;
      const warnings = b.counts.warnings ?? 0;
      const total = b.counts.total ?? 0;
      return {
        ts: b.ts,
        info: Math.max(0, total - errors - warnings),
        warn: warnings,
        err: errors,
      };
    });
  }, [trend]);

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const isEmpty = buckets.length === 0;
  const dataMin = isEmpty ? 0 : buckets[0].ts;
  const dataMax = isEmpty ? 1 : buckets[buckets.length - 1].ts;
  const tsMin = minTimeMs ?? dataMin;
  const tsMax = Math.max((maxTimeMs ?? dataMax) || dataMax, tsMin + 1);
  const spanMs = tsMax - tsMin;

  const bucketMs = inferBucketMs(buckets);
  const barW = Math.max(MIN_BAR_W, (bucketMs / spanMs) * innerW - 1);
  const xOf = (ts: number) => PAD_L + ((ts - tsMin) / spanMs) * innerW;

  const max = isEmpty ? 1 : Math.max(1, ...buckets.map((d) => d.info + d.warn + d.err));
  const yScale = (v: number) => (v / max) * innerH;
  const yOf = (v: number) => PAD_T + innerH - yScale(v);

  const ticks = computeTicks(max);

  const labelCount = 7;
  const labelOpts = pickTimeFormat(spanMs);
  const fmt =
    tz !== "local"
      ? new Intl.DateTimeFormat("en-US", { ...labelOpts, timeZone: tz })
      : new Intl.DateTimeFormat("en-US", labelOpts);
  const xLabels = Array.from({ length: labelCount }, (_, i) => {
    const t = tsMin + (spanMs * i) / (labelCount - 1);
    return { x: PAD_L + (innerW * i) / (labelCount - 1), label: fmt.format(new Date(t)) };
  });

  const tooltipFmt =
    tz !== "local"
      ? new Intl.DateTimeFormat("en-US", { ...pickTooltipFormat(spanMs), timeZone: tz })
      : new Intl.DateTimeFormat("en-US", pickTooltipFormat(spanMs));

  const incidentIdx = isEmpty
    ? -1
    : buckets.reduce((best, b, i) => (b.err > buckets[best].err ? i : best), 0);
  const incidentBucket = incidentIdx >= 0 ? buckets[incidentIdx] : null;
  const incidentX =
    incidentBucket && incidentBucket.err > 0 ? xOf(incidentBucket.ts) + barW / 2 : null;
  const incidentHovered = incidentIdx >= 0 && hoverIdx === incidentIdx;

  const svgToDataX = (clientX: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const xVB = ((clientX - rect.left) / rect.width) * W;
    return Math.max(PAD_L, Math.min(W - PAD_R, xVB));
  };

  // Pick the bucket whose centre is closest to x (in viewBox units).
  const nearestBucketIdx = (x: number): number | null => {
    if (buckets.length === 0) return null;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < buckets.length; i++) {
      const bx = xOf(buckets[i].ts) + barW / 2;
      const d = Math.abs(bx - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  };

  // Pointer flow:
  //   pointerdown → record x0 in `pending` (no capture, no brush yet)
  //   pointermove past 8px → promote to `brush`, capture pointer
  //   pointermove inside chart → update hoverIdx (independent of brush)
  //   pointerup with brush → emit time range; otherwise no-op (click safe)
  const onHitPointerDown = (e: React.PointerEvent<SVGRectElement>) => {
    if (!onTimeRangeChange) return;
    e.preventDefault();
    setPending({ x0: svgToDataX(e.clientX) });
  };
  const onHitPointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const x = svgToDataX(e.clientX);
    setHoverIdx(nearestBucketIdx(x));
    if (brush) {
      setBrush({ ...brush, x1: x });
      return;
    }
    if (pending && Math.abs(x - pending.x0) > BRUSH_THRESHOLD_PX) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setBrush({ x0: pending.x0, x1: x });
      setPending(null);
    }
  };
  const onHitPointerUp = (e: React.PointerEvent<SVGRectElement>) => {
    if (brush && onTimeRangeChange) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      const [a, b] = brush.x0 < brush.x1 ? [brush.x0, brush.x1] : [brush.x1, brush.x0];
      if (b - a >= BRUSH_THRESHOLD_PX) {
        const fromMs = tsMin + ((a - PAD_L) / innerW) * spanMs;
        const toMs = tsMin + ((b - PAD_L) / innerW) * spanMs;
        onTimeRangeChange(Math.round(fromMs), Math.round(toMs));
      }
    }
    setPending(null);
    setBrush(null);
  };
  const onHitPointerLeave = () => {
    setHoverIdx(null);
  };
  const onHitPointerCancel = () => {
    setPending(null);
    setBrush(null);
    setHoverIdx(null);
  };

  const brushX = brush ? Math.min(brush.x0, brush.x1) : 0;
  const brushW = brush ? Math.abs(brush.x1 - brush.x0) : 0;

  const hoverBucket = hoverIdx != null ? buckets[hoverIdx] : null;
  const hoverX = hoverBucket ? xOf(hoverBucket.ts) + barW / 2 : null;
  const tipTotal = hoverBucket ? hoverBucket.info + hoverBucket.warn + hoverBucket.err : 0;
  // Tooltip width / height in viewBox units. Switch sides when near right edge.
  const TIP_W = 168;
  const TIP_H = 64;
  const tipX =
    hoverX != null ? (hoverX + TIP_W + 12 > W - PAD_R ? hoverX - TIP_W - 8 : hoverX + 8) : 0;
  const tipY = PAD_T + 4;

  return (
    <div className="ok-chart">
      <div className="ok-chart-h">
        <span className="ok-chart-t">Log Volume Over Time</span>
        <div className="ok-chart-leg">
          <span>
            <i className="dot" style={{ background: "var(--info-c)" }} />
            Info / Debug
          </span>
          <span>
            <i className="dot" style={{ background: "var(--warn-c)" }} />
            Warnings
          </span>
          <span>
            <i className="dot" style={{ background: "var(--err-c)" }} />
            Errors
          </span>
        </div>
      </div>
      <svg
        ref={svgRef}
        className="ok-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {/* Grid + axis frame — always rendered so the empty state still has scaffolding */}
        <g className="ok-chart-grid">
          {ticks.map((t) => (
            <line key={t} x1={PAD_L} y1={yOf(t)} x2={W - PAD_R} y2={yOf(t)} />
          ))}
        </g>
        <g className="ok-chart-axis">
          {ticks.map((t) => (
            <text key={t} x={PAD_L - 6} y={yOf(t) + 3} textAnchor="end">
              {compactY(t)}
            </text>
          ))}
          {xLabels.map((lab) => (
            <text key={lab.x} x={lab.x} y={H - 8} textAnchor="middle">
              {lab.label}
            </text>
          ))}
        </g>

        {!isEmpty &&
          buckets.map((d) => {
            if (d.ts < tsMin || d.ts > tsMax) return null;
            if (d.info + d.warn + d.err === 0) return null;
            const x = xOf(d.ts);
            const hi = yScale(d.info);
            const hw = yScale(d.warn);
            const he = yScale(d.err);
            const yi = PAD_T + innerH - hi;
            const yw = yi - hw;
            const ye = yw - he;
            return (
              <g key={d.ts} className="ok-chart-bar-g">
                {hi > 0 ? (
                  <rect
                    x={x}
                    y={yi}
                    width={barW}
                    height={hi}
                    className="ok-chart-bar ok-chart-bar-info"
                  />
                ) : null}
                {hw > 0 ? (
                  <rect
                    x={x}
                    y={yw}
                    width={barW}
                    height={hw}
                    className="ok-chart-bar ok-chart-bar-warn"
                  />
                ) : null}
                {he > 0 ? (
                  <rect
                    x={x}
                    y={ye}
                    width={barW}
                    height={he}
                    className="ok-chart-bar ok-chart-bar-err"
                  />
                ) : null}
              </g>
            );
          })}

        {/* Incident line is always present once data exists; label is hover-only. */}
        {incidentX != null ? (
          <line
            className="ok-chart-incident-l"
            x1={incidentX}
            y1={PAD_T}
            x2={incidentX}
            y2={H - PAD_B}
          />
        ) : null}
        {incidentX != null && incidentHovered ? (
          <text
            className="ok-chart-incident-t"
            x={Math.min(W - PAD_R - 150, incidentX + 6)}
            y={PAD_T + 10}
          >
            incident · error spike
          </text>
        ) : null}

        {/* Hover guide line at nearest bucket */}
        {hoverX != null ? (
          <line className="ok-chart-hover-g" x1={hoverX} y1={PAD_T} x2={hoverX} y2={H - PAD_B} />
        ) : null}

        {/* Brush rectangle (visible only while actively dragging) */}
        {brush ? (
          <rect className="ok-chart-brush" x={brushX} y={PAD_T} width={brushW} height={innerH} />
        ) : null}

        {/* Empty state — a single em-dash, no prose */}
        {isEmpty ? (
          <text
            x={PAD_L + innerW / 2}
            y={PAD_T + innerH / 2 + 4}
            textAnchor="middle"
            style={{ fill: "var(--fg-3)", fontSize: 14 }}
          >
            —
          </text>
        ) : null}

        {/* Tooltip (rendered last so it stacks on top) */}
        {hoverBucket && hoverX != null ? (
          <g className="ok-chart-tip" style={{ pointerEvents: "none" }}>
            <rect
              className="ok-chart-tip-bg"
              x={tipX}
              y={tipY}
              width={TIP_W}
              height={TIP_H}
              rx={5}
            />
            <text className="ok-chart-tip-t" x={tipX + 10} y={tipY + 16}>
              {tooltipFmt.format(new Date(hoverBucket.ts))}
            </text>
            <g>
              <circle cx={tipX + 12} cy={tipY + 30} r={3} fill="var(--info-c)" />
              <text className="ok-chart-tip-t" x={tipX + 22} y={tipY + 33}>
                info {hoverBucket.info.toLocaleString()}
              </text>
            </g>
            <g>
              <circle cx={tipX + 12} cy={tipY + 42} r={3} fill="var(--warn-c)" />
              <text className="ok-chart-tip-t" x={tipX + 22} y={tipY + 45}>
                warn {hoverBucket.warn.toLocaleString()}
              </text>
            </g>
            <g>
              <circle cx={tipX + 12} cy={tipY + 54} r={3} fill="var(--err-c)" />
              <text className="ok-chart-tip-t" x={tipX + 22} y={tipY + 57}>
                err {hoverBucket.err.toLocaleString()} · total {tipTotal.toLocaleString()}
              </text>
            </g>
          </g>
        ) : null}

        {/* Pointer hit area — confined to the chart body so axis/header clicks
            do nothing. Brush only emits when movement exceeds the threshold. */}
        <rect
          className="ok-chart-hit"
          x={PAD_L}
          y={PAD_T}
          width={innerW}
          height={innerH}
          fill="transparent"
          style={{ cursor: onTimeRangeChange ? "crosshair" : "default" }}
          onPointerDown={onHitPointerDown}
          onPointerMove={onHitPointerMove}
          onPointerUp={onHitPointerUp}
          onPointerLeave={onHitPointerLeave}
          onPointerCancel={onHitPointerCancel}
        />
      </svg>
    </div>
  );
}

function computeTicks(max: number): readonly number[] {
  const niceMax = niceCeil(max);
  const step = niceMax / 4;
  return [0, step, step * 2, step * 3, niceMax];
}

function niceCeil(n: number): number {
  if (n <= 1) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / pow;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * pow;
}

export const LogsTrendChart = memo(LogsTrendChartComponent);
