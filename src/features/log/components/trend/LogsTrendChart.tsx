import { memo, useMemo, useRef, useState } from "react";

import { useTimezone } from "@/app/store/appStore";

import type { LogsTrendBucket } from "../../api/logsAnalyticsApi";
import { severityColor } from "../../utils/severity";

interface Props {
  readonly trend: readonly LogsTrendBucket[] | undefined;
  readonly zoomed?: boolean;
  readonly onTimeRangeChange?: (fromMs: number, toMs: number) => void;
  readonly minTimeMs?: number;
  readonly maxTimeMs?: number;
}

interface ChartBucket {
  readonly ts: number;
  readonly debug: number;
  readonly info: number;
  readonly warn: number;
  readonly err: number;
}

// Stacked severity series, bottom → top. Colors come from the shared severity
// palette (see utils/severity.ts) keyed by severity_bucket.
const DEBUG_COLOR = severityColor(1);
const INFO_COLOR = severityColor(2);
const WARN_COLOR = severityColor(3);
const ERROR_COLOR = severityColor(4);

function parseBucketMs(time_bucket: string, idx: number): number {
  const iso = time_bucket.includes("T") ? time_bucket : time_bucket.replace(" ", "T");
  // Backend grain is UTC; append Z when the string carries no zone so Date
  // parses it as UTC rather than local.
  const utc = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const ms = Date.parse(utc);
  return Number.isNaN(ms) ? idx : ms;
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
    if (!trend || trend.length === 0) return [];
    return trend
      .map((b, idx) => ({
        ts: parseBucketMs(b.time_bucket, idx),
        debug: b.debug,
        info: b.info,
        warn: b.warn,
        err: b.error,
      }))
      .sort((a, b) => a.ts - b.ts);
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

  const max = isEmpty ? 1 : Math.max(1, ...buckets.map((d) => d.debug + d.info + d.warn + d.err));
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
  const tipTotal = hoverBucket
    ? hoverBucket.debug + hoverBucket.info + hoverBucket.warn + hoverBucket.err
    : 0;
  // Tooltip width / height in viewBox units. Switch sides when near right edge.
  const TIP_W = 168;
  const TIP_H = 80;
  const tipX =
    hoverX != null ? (hoverX + TIP_W + 12 > W - PAD_R ? hoverX - TIP_W - 8 : hoverX + 8) : 0;
  const tipY = PAD_T + 4;

  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-[var(--bg-1)] pt-[14px] pr-[18px] pb-2 pl-[18px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-[var(--fg-0)] text-sm">Log Volume Over Time</span>
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: DEBUG_COLOR }} />
            Debug
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: INFO_COLOR }} />
            Info
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: WARN_COLOR }} />
            Warnings
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: ERROR_COLOR }} />
            Errors
          </span>
        </div>
      </div>
      <svg
        ref={svgRef}
        className="block h-[180px] w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {/* Grid + axis frame — always rendered so the empty state still has scaffolding */}
        <g>
          {ticks.map((t) => (
            <line
              key={t}
              x1={PAD_L}
              y1={yOf(t)}
              x2={W - PAD_R}
              y2={yOf(t)}
              style={{ stroke: "var(--line)", strokeDasharray: "2 4" }}
            />
          ))}
        </g>
        <g>
          {ticks.map((t) => (
            <text
              key={t}
              x={PAD_L - 6}
              y={yOf(t) + 3}
              textAnchor="end"
              style={{
                fill: "var(--fg-3)",
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10.5,
              }}
            >
              {compactY(t)}
            </text>
          ))}
          {xLabels.map((lab) => (
            <text
              key={lab.x}
              x={lab.x}
              y={H - 8}
              textAnchor="middle"
              style={{
                fill: "var(--fg-3)",
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10.5,
              }}
            >
              {lab.label}
            </text>
          ))}
        </g>

        {!isEmpty &&
          buckets.map((d) => {
            if (d.ts < tsMin || d.ts > tsMax) return null;
            if (d.debug + d.info + d.warn + d.err === 0) return null;
            const x = xOf(d.ts);
            const hd = yScale(d.debug);
            const hi = yScale(d.info);
            const hw = yScale(d.warn);
            const he = yScale(d.err);
            // Stack bottom → top: debug, info, warn, error.
            const yd = PAD_T + innerH - hd;
            const yi = yd - hi;
            const yw = yi - hw;
            const ye = yw - he;
            return (
              <g key={d.ts} className="group">
                {hd > 0 ? (
                  <rect
                    x={x}
                    y={yd}
                    width={barW}
                    height={hd}
                    className="transition-opacity duration-[120ms] group-hover:opacity-[0.85]"
                    style={{ fill: DEBUG_COLOR, opacity: 0.55 }}
                  />
                ) : null}
                {hi > 0 ? (
                  <rect
                    x={x}
                    y={yi}
                    width={barW}
                    height={hi}
                    className="transition-opacity duration-[120ms] group-hover:opacity-[0.85] [[data-theme=light]_&]:opacity-75"
                    style={{ fill: INFO_COLOR, opacity: 0.7 }}
                  />
                ) : null}
                {hw > 0 ? (
                  <rect
                    x={x}
                    y={yw}
                    width={barW}
                    height={hw}
                    className="transition-opacity duration-[120ms] group-hover:opacity-[0.85]"
                    style={{ fill: WARN_COLOR }}
                  />
                ) : null}
                {he > 0 ? (
                  <rect
                    x={x}
                    y={ye}
                    width={barW}
                    height={he}
                    className="transition-opacity duration-[120ms] group-hover:opacity-[0.85]"
                    style={{ fill: ERROR_COLOR }}
                  />
                ) : null}
              </g>
            );
          })}

        {/* Incident line is always present once data exists; label is hover-only. */}
        {incidentX != null ? (
          <line
            x1={incidentX}
            y1={PAD_T}
            x2={incidentX}
            y2={H - PAD_B}
            style={{
              stroke: "var(--err-c)",
              strokeWidth: 1,
              strokeDasharray: "3 3",
              opacity: 0.7,
            }}
          />
        ) : null}
        {incidentX != null && incidentHovered ? (
          <text
            x={Math.min(W - PAD_R - 150, incidentX + 6)}
            y={PAD_T + 10}
            style={{ fill: "var(--err-c)", fontFamily: "'Geist Mono', monospace", fontSize: 10 }}
          >
            incident · error spike
          </text>
        ) : null}

        {/* Hover guide line at nearest bucket */}
        {hoverX != null ? (
          <line
            x1={hoverX}
            y1={PAD_T}
            x2={hoverX}
            y2={H - PAD_B}
            style={{
              stroke: "var(--fg-3)",
              strokeWidth: 1,
              strokeDasharray: "2 3",
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />
        ) : null}

        {/* Brush rectangle (visible only while actively dragging) */}
        {brush ? (
          <rect
            x={brushX}
            y={PAD_T}
            width={brushW}
            height={innerH}
            style={{
              fill: "var(--accent)",
              opacity: 0.1,
              stroke: "var(--accent)",
              strokeWidth: 1,
            }}
          />
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
          <g style={{ pointerEvents: "none" }}>
            <rect
              x={tipX}
              y={tipY}
              width={TIP_W}
              height={TIP_H}
              rx={5}
              style={{ fill: "var(--bg-2)", stroke: "var(--line)", strokeWidth: 1 }}
            />
            <text
              x={tipX + 10}
              y={tipY + 16}
              style={{
                fill: "var(--fg-0)",
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
              }}
            >
              {tooltipFmt.format(new Date(hoverBucket.ts))}
            </text>
            <g>
              <circle cx={tipX + 12} cy={tipY + 30} r={3} fill={DEBUG_COLOR} />
              <text
                x={tipX + 22}
                y={tipY + 33}
                style={{
                  fill: "var(--fg-0)",
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11,
                }}
              >
                debug {hoverBucket.debug.toLocaleString()}
              </text>
            </g>
            <g>
              <circle cx={tipX + 12} cy={tipY + 42} r={3} fill={INFO_COLOR} />
              <text
                x={tipX + 22}
                y={tipY + 45}
                style={{
                  fill: "var(--fg-0)",
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11,
                }}
              >
                info {hoverBucket.info.toLocaleString()}
              </text>
            </g>
            <g>
              <circle cx={tipX + 12} cy={tipY + 54} r={3} fill={WARN_COLOR} />
              <text
                x={tipX + 22}
                y={tipY + 57}
                style={{
                  fill: "var(--fg-0)",
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11,
                }}
              >
                warn {hoverBucket.warn.toLocaleString()}
              </text>
            </g>
            <g>
              <circle cx={tipX + 12} cy={tipY + 66} r={3} fill={ERROR_COLOR} />
              <text
                x={tipX + 22}
                y={tipY + 69}
                style={{
                  fill: "var(--fg-0)",
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11,
                }}
              >
                err {hoverBucket.err.toLocaleString()} · total {tipTotal.toLocaleString()}
              </text>
            </g>
          </g>
        ) : null}

        {/* Pointer hit area — confined to the chart body so axis/header clicks
            do nothing. Brush only emits when movement exceeds the threshold. */}
        <rect
          className="outline-none"
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
  const pow = 10 ** Math.floor(Math.log10(n));
  const norm = n / pow;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * pow;
}

export const LogsTrendChart = memo(LogsTrendChartComponent);
