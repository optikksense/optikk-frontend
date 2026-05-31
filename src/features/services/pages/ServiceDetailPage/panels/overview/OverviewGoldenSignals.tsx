import { isRelativeRange, resolveTimeRangeBounds } from "@/types";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { useMemo, useState } from "react";
import { fmtNum } from "../../formatters";
import { useErrorRateSeries } from "../../hooks/useErrorRateSeries";
import { useLatencyPercentiles } from "../../hooks/useLatencyPercentiles";
import { useServiceSaturation } from "../../hooks/useServiceSaturation";
import { useStatusTimeseries } from "../../hooks/useStatusTimeseries";

interface GoldenSignalChartProps {
  readonly title: string;
  readonly unit: string;
  readonly legend: string;
  readonly timestamps: number[];
  readonly series: {
    label: string;
    values: number[];
    color: string;
    soft?: string;
    isMain?: boolean;
  }[];
  readonly height?: number;
  readonly hoveredIndex: number | null;
  readonly onHoverChange: (idx: number | null) => void;
  readonly xAxisTicks: string[];
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatOffset(mins: number): string {
  if (mins === 0) return "now";
  if (mins >= 1440) {
    const days = Math.floor(mins / 1440);
    const remMins = Math.round(mins % 1440);
    const hours = Math.round(remMins / 60);
    if (hours === 0) return `−${days}d`;
    return `−${days}d ${hours}h`;
  }
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = Math.round(mins % 60);
    if (remMins === 0) return `−${hours}h`;
    return `−${hours}h ${remMins}m`;
  }
  if (mins % 1 === 0) {
    return `−${mins}m`;
  }
  const wholeMins = Math.floor(mins);
  const secs = Math.round((mins - wholeMins) * 60);
  if (wholeMins === 0) return `−${secs}s`;
  return `−${wholeMins}m ${secs}s`;
}

function formatAbsoluteTime(ts: number, showDate = false): string {
  const d = new Date(ts);
  const timeStr = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (showDate) {
    const dateStr = d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
    return `${dateStr} ${timeStr}`;
  }
  return timeStr;
}

function GoldenSignalChart({
  title,
  unit,
  legend,
  timestamps,
  series,
  height = 96,
  hoveredIndex,
  onHoverChange,
  xAxisTicks,
}: GoldenSignalChartProps) {
  const minTs = timestamps[0] ?? 0;
  const maxTs = timestamps[timestamps.length - 1] ?? 1;
  const tsRange = Math.max(1, maxTs - minTs);

  // Find overall maximum value across all series to scale the Y-axis
  const maxVal = useMemo(() => {
    let currentMax = 0;
    for (const s of series) {
      for (const val of s.values) {
        if (val > currentMax) currentMax = val;
      }
    }
    return currentMax > 0 ? currentMax : 1;
  }, [series]);

  // Compute Y-axis ticks dynamically
  const yTicks = useMemo(() => {
    if (unit === "%") {
      return [`${maxVal.toFixed(1)}%`, `${(maxVal / 2).toFixed(1)}%`, "0%"];
    }
    if (unit === "ms") {
      return [`${Math.round(maxVal)}ms`, `${Math.round(maxVal / 2)}ms`, "0ms"];
    }
    return [fmtNum(Math.round(maxVal)), fmtNum(Math.round(maxVal / 2)), "0"];
  }, [maxVal, unit]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timestamps.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.round(pct * (timestamps.length - 1));
    onHoverChange(idx);
  };

  const handleMouseLeave = () => {
    onHoverChange(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11.5px] text-foreground-muted">
        <span>
          {title} <span className="font-mono text-[10px]">({unit})</span>
        </span>
        <span className="font-medium text-[10.5px]">{legend}</span>
      </div>

      <div className="mt-1.5 grid grid-cols-[42px_1fr]">
        {/* Y-axis Ticks */}
        <div className="flex h-24 flex-col justify-between pr-2 text-right">
          {yTicks.map((t) => (
            <span key={t} className="font-mono text-[9px] text-foreground-muted leading-none">
              {t}
            </span>
          ))}
        </div>

        {/* Framed Plot Area with Gridlines */}
        <div
          className="relative h-24 cursor-crosshair overflow-hidden border-border border-b border-l bg-muted/10"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="pointer-events-none absolute top-0 right-0 left-0 border-border/60 border-t border-dashed" />
          <div className="pointer-events-none absolute top-1/2 right-0 left-0 border-border/60 border-t border-dashed" />

          {/* SVG Plot */}
          <svg
            className="pointer-events-none absolute inset-0 block"
            width="100%"
            height={height}
            viewBox={`0 0 320 ${height}`}
            preserveAspectRatio="none"
            role="presentation"
          >
            {/* Draw filled areas and lines */}
            {series.map((s, idx) => {
              if (timestamps.length === 0) return null;
              const points = s.values.map((val, i) => {
                const ts = timestamps[i] ?? minTs;
                const x = ((ts - minTs) / tsRange) * 320;
                const y = 6 + (1 - val / maxVal) * (height - 12);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });

              const pathString = `M ${points.join(" L ")}`;
              const fillString = `M 0,${height} L ${points.join(" L ")} L 320,${height} Z`;

              return (
                <g key={idx}>
                  {s.soft && <path d={fillString} fill={s.soft} opacity="0.65" />}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.isMain ? "1.6" : "1.0"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* Sync Hover Indicator Overlay */}
            {hoveredIndex !== null &&
              hoveredIndex < timestamps.length &&
              (() => {
                const hoverX = (hoveredIndex / (timestamps.length - 1)) * 320;
                return (
                  <>
                    {/* Vertical Indicator Line */}
                    <line
                      x1={hoverX}
                      y1={0}
                      x2={hoverX}
                      y2={height}
                      stroke="var(--color-primary, #6366f1)"
                      strokeWidth={1.25}
                      strokeDasharray="2,2"
                      opacity={0.8}
                    />
                    {/* Hover Overlaid Dots */}
                    {series.map((s, idx) => {
                      const val = s.values[hoveredIndex];
                      if (val == null) return null;
                      const y = 6 + (1 - val / maxVal) * (height - 12);
                      return (
                        <circle
                          key={idx}
                          cx={hoverX}
                          cy={y}
                          r={3.2}
                          fill={s.color}
                          stroke="var(--color-bg, #0d0e12)"
                          strokeWidth={1.5}
                        />
                      );
                    })}
                  </>
                );
              })()}
          </svg>
        </div>

        {/* X-axis Ticks */}
        <div className="col-start-2 mt-1 flex justify-between px-0.5 font-mono text-[9px] text-foreground-muted">
          {xAxisTicks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OverviewGoldenSignals({ serviceName }: { serviceName: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { timeRange } = useTimeRange();

  const statusQ = useStatusTimeseries(serviceName);
  const errorQ = useErrorRateSeries(serviceName);
  const latencyQ = useLatencyPercentiles(serviceName);
  const saturationQ = useServiceSaturation(serviceName);

  const xAxisTicks = useMemo(() => {
    if (isRelativeRange(timeRange)) {
      const mins = timeRange.minutes;
      return [
        formatOffset(mins),
        formatOffset(mins * 0.75),
        formatOffset(mins * 0.5),
        formatOffset(mins * 0.25),
        "now",
      ];
    }

    const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
    const durationMs = Number(endTime) - Number(startTime);
    const showDate = durationMs > 24 * 60 * 60 * 1000;

    return [
      startTime,
      startTime + durationMs * 0.25,
      startTime + durationMs * 0.5,
      startTime + durationMs * 0.75,
      endTime,
    ].map((ts) => formatAbsoluteTime(ts, showDate));
  }, [timeRange]);

  const loading =
    statusQ.isPending || errorQ.isPending || latencyQ.isPending || saturationQ.isPending;

  const data = useMemo(() => {
    if (loading || !statusQ.data || !errorQ.data || !latencyQ.data || !saturationQ.data) {
      return null;
    }

    // Process status timeseries (Request Rate)
    const reqTimestamps = statusQ.data.map((d) => new Date(d.timestamp).getTime() / 1000);
    const reqValues = statusQ.data.map(
      (d) => d.status_2xx + d.status_4xx + d.status_5xx + d.status_other
    );

    // Process error rate timeseries
    const errTimestamps = errorQ.data.map((d) => new Date(d.timestamp).getTime() / 1000);
    const errValues = errorQ.data.map((d) =>
      d.request_count > 0 ? (d.error_count / d.request_count) * 100 : 0
    );

    // Process latency timeseries (p50/p95/p99)
    const latTimestamps = latencyQ.data.map((d) => new Date(d.timestamp).getTime() / 1000);
    const p50Values = latencyQ.data.map((d) => d.p50_ms);
    const p95Values = latencyQ.data.map((d) => d.p95_ms);
    const p99Values = latencyQ.data.map((d) => d.p99_ms);

    // Process saturation timeseries (CPU Util)
    const satTimestamps = saturationQ.data.map((d) => new Date(d.timestamp).getTime() / 1000);
    const satValues = saturationQ.data.map((d) => d.value);

    return {
      reqTimestamps,
      reqValues,
      errTimestamps,
      errValues,
      latTimestamps,
      p50Values,
      p95Values,
      p99Values,
      satTimestamps,
      satValues,
    };
  }, [loading, statusQ.data, errorQ.data, latencyQ.data, saturationQ.data]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="font-semibold text-[14px] text-foreground">Golden signals</h3>
        <div className="py-12 text-center text-[12.5px] text-foreground-muted">
          No metrics available for this service.
        </div>
      </div>
    );
  }

  // Calculate live/latest values to show in the legend when not hovered
  const latestReq = data.reqValues[data.reqValues.length - 1] ?? 0;
  const latestErr = data.errValues[data.errValues.length - 1] ?? 0;
  const latestP50 = data.p50Values[data.p50Values.length - 1] ?? 0;
  const latestP95 = data.p95Values[data.p95Values.length - 1] ?? 0;
  const latestP99 = data.p99Values[data.p99Values.length - 1] ?? 0;
  const latestSat = data.satValues[data.satValues.length - 1] ?? 0;

  const reqLegend =
    hoveredIndex !== null && hoveredIndex < data.reqValues.length
      ? `at ${formatTime(data.reqTimestamps[hoveredIndex])}: ${fmtNum(
          data.reqValues[hoveredIndex]
        )} rps`
      : `avg ${fmtNum(Math.round(latestReq))} rps`;

  const errLegend =
    hoveredIndex !== null && hoveredIndex < data.errValues.length
      ? `at ${formatTime(data.errTimestamps[hoveredIndex])}: ${data.errValues[hoveredIndex].toFixed(
          2
        )}%`
      : `curr ${latestErr.toFixed(2)}%`;

  const latLegend =
    hoveredIndex !== null && hoveredIndex < data.p50Values.length
      ? `at ${formatTime(data.latTimestamps[hoveredIndex])}: p50 ${Math.round(
          data.p50Values[hoveredIndex]
        )}ms · p99 ${Math.round(data.p99Values[hoveredIndex])}ms`
      : `p50 ${Math.round(latestP50)}ms · p99 ${Math.round(latestP99)}ms`;

  const satLegend =
    hoveredIndex !== null && hoveredIndex < data.satValues.length
      ? `at ${formatTime(data.satTimestamps[hoveredIndex])}: ${data.satValues[hoveredIndex].toFixed(
          1
        )}%`
      : `curr ${latestSat.toFixed(1)}%`;

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div>
        <h3 className="font-semibold text-[14px] text-foreground">Golden signals</h3>
        <p className="mt-0.5 text-[12px] text-foreground-muted">
          Request · errors · latency · saturation
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Request Rate */}
        <GoldenSignalChart
          title="Request rate"
          unit="rps"
          legend={reqLegend}
          timestamps={data.reqTimestamps}
          series={[
            {
              label: "Requests",
              values: data.reqValues,
              color: "var(--chart-1)",
              soft: "var(--chart-1-soft)",
              isMain: true,
            },
          ]}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          xAxisTicks={xAxisTicks}
        />

        {/* Error Rate */}
        <GoldenSignalChart
          title="Error rate"
          unit="%"
          legend={errLegend}
          timestamps={data.errTimestamps}
          series={[
            {
              label: "Errors",
              values: data.errValues,
              color: "var(--warn)",
              soft: "var(--warn-soft)",
              isMain: true,
            },
          ]}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          xAxisTicks={xAxisTicks}
        />

        {/* Latency */}
        <GoldenSignalChart
          title="Latency p50/p95/p99"
          unit="ms"
          legend={latLegend}
          timestamps={data.latTimestamps}
          series={[
            {
              label: "p50",
              values: data.p50Values,
              color: "var(--ok)",
            },
            {
              label: "p95",
              values: data.p95Values,
              color: "var(--warn)",
            },
            {
              label: "p99",
              values: data.p99Values,
              color: "var(--err)",
              soft: "var(--err-soft)",
              isMain: true,
            },
          ]}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          xAxisTicks={xAxisTicks}
        />

        {/* Saturation */}
        <GoldenSignalChart
          title="Saturation (CPU)"
          unit="%"
          legend={satLegend}
          timestamps={data.satTimestamps}
          series={[
            {
              label: "Saturation",
              values: data.satValues,
              color: "var(--chart-2)",
              soft: "var(--chart-2-soft)",
              isMain: true,
            },
          ]}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          xAxisTicks={xAxisTicks}
        />
      </div>
    </div>
  );
}
