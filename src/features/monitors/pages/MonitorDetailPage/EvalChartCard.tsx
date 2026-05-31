import { memo, useMemo } from "react";

import type { MonitorSeriesResponse } from "../../api/monitorsApi";

interface Props {
  readonly data: MonitorSeriesResponse | undefined;
  readonly loading: boolean;
}

const HEIGHT = 180;
const PADDING = 8;

interface Point {
  readonly x: number;
  readonly y: number;
}

function buildPath(points: readonly Point[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
}

function EvalChartCard({ data, loading }: Props) {
  const chart = useMemo(() => {
    if (!data || data.points.length === 0) return null;
    const values = data.points.map((p) => p.value);
    const min = Math.min(0, ...values);
    let max = Math.max(...values);
    if (data.alert_threshold !== undefined) max = Math.max(max, data.alert_threshold * 1.2);
    if (max === min) max = min + 1;
    const yScale = (v: number) =>
      HEIGHT - PADDING - ((v - min) / (max - min)) * (HEIGHT - PADDING * 2);
    const xScale = (i: number) =>
      data.points.length === 1 ? 0 : (i / (data.points.length - 1)) * 100;
    const pts: Point[] = data.points.map((p, i) => ({ x: xScale(i), y: yScale(p.value) }));
    return {
      path: buildPath(pts),
      area: `${buildPath(pts)} L100,${HEIGHT} L0,${HEIGHT} Z`,
      yAlert: data.alert_threshold !== undefined ? yScale(data.alert_threshold) : undefined,
      yWarn: data.warn_threshold !== undefined ? yScale(data.warn_threshold) : undefined,
    };
  }, [data]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-medium text-foreground text-sm">Evaluation · last 1 hour</div>
          <div className="text-[11px] text-foreground-muted">
            line is monitor value · bands show thresholds
          </div>
        </div>
        {data && (
          <div className="flex items-center gap-3 text-[11px] text-foreground-muted">
            {data.warn_threshold !== undefined && (
              <span className="font-mono">warn ≥ {data.warn_threshold}</span>
            )}
            {data.alert_threshold !== undefined && (
              <span className="font-mono">alert ≥ {data.alert_threshold}</span>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 h-[180px] w-full">
        {loading && !data ? (
          <div className="flex h-full items-center justify-center text-foreground-muted text-xs">
            Loading…
          </div>
        ) : !chart ? (
          <div className="flex h-full items-center justify-center text-foreground-muted text-xs">
            No data yet for this monitor.
          </div>
        ) : (
          <svg viewBox={`0 0 100 ${HEIGHT}`} preserveAspectRatio="none" className="h-full w-full">
            <path d={chart.area} fill="rgba(239,68,68,0.12)" stroke="none" />
            <path d={chart.path} fill="none" stroke="#ef4444" strokeWidth={0.6} />
            {chart.yWarn !== undefined && (
              <line
                x1="0"
                y1={chart.yWarn}
                x2="100"
                y2={chart.yWarn}
                stroke="#f59e0b"
                strokeWidth={0.4}
                strokeDasharray="1.5,1.5"
              />
            )}
            {chart.yAlert !== undefined && (
              <line
                x1="0"
                y1={chart.yAlert}
                x2="100"
                y2={chart.yAlert}
                stroke="#ef4444"
                strokeWidth={0.4}
                strokeDasharray="1.5,1.5"
              />
            )}
          </svg>
        )}
      </div>
    </div>
  );
}

export default memo(EvalChartCard);
