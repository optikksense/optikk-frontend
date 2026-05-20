import { memo, useMemo } from "react";

import { formatDuration } from "@shared/utils/formatters";

import type { TraceRecord } from "@shared/entities/trace/model";

interface Stats {
  readonly totalSpans: number;
  readonly duration: number;
  readonly services: Set<string>;
  readonly errors: number;
}

interface Props {
  readonly stats: Stats;
  readonly spans: readonly TraceRecord[];
  readonly criticalPathSpanIds: ReadonlySet<string>;
  /** p50 / p95 in ms — when provided, render the comparison baseline bar. */
  readonly p50Ms?: number;
  readonly p95Ms?: number;
}

interface RootSelfTimeResult {
  readonly selfMs: number;
  readonly root: TraceRecord | null;
}

function computeRootSelfTime(spans: readonly TraceRecord[]): RootSelfTimeResult {
  const root = spans.find((s) => !s.parent_span_id) ?? null;
  if (!root) return { selfMs: 0, root: null };
  const rootStart = root.start_time ? new Date(root.start_time).getTime() : 0;
  const rootEnd = root.end_time ? new Date(root.end_time).getTime() : 0;
  const rootDur = Math.max(0, rootEnd - rootStart);
  if (!rootDur) return { selfMs: 0, root };

  // merge direct-child intervals, subtract from root
  const children = spans
    .filter((s) => s.parent_span_id === root.span_id)
    .map((s) => ({
      start: s.start_time ? new Date(s.start_time).getTime() : 0,
      end: s.end_time ? new Date(s.end_time).getTime() : 0,
    }))
    .filter((iv) => iv.end > iv.start)
    .sort((a, b) => a.start - b.start);

  let merged = 0;
  let lastEnd = 0;
  for (const iv of children) {
    const s = Math.max(iv.start, lastEnd);
    if (iv.end > s) merged += iv.end - s;
    lastEnd = Math.max(lastEnd, iv.end);
  }
  return { selfMs: Math.max(0, rootDur - merged), root };
}

function summarizeCriticalPath(
  spans: readonly TraceRecord[],
  ids: ReadonlySet<string>,
  totalDurationMs: number
): { label: string; pct: number } {
  if (ids.size === 0) return { label: "—", pct: 0 };
  const onPath = spans.filter((s) => ids.has(s.span_id));
  // Build the longest-duration sequence label (root → … → leaf).
  const byId = new Map(onPath.map((s) => [s.span_id, s]));
  const childrenOf = new Map<string, TraceRecord[]>();
  for (const s of onPath) {
    const p = s.parent_span_id ?? "";
    if (!childrenOf.has(p)) childrenOf.set(p, []);
    childrenOf.get(p)!.push(s);
  }
  // Find the path root: a span on the path whose parent is not on the path.
  const pathRoots = onPath.filter((s) => !s.parent_span_id || !byId.has(s.parent_span_id));
  let cursor: TraceRecord | undefined = pathRoots.sort(
    (a, b) => (b.duration_ms ?? 0) - (a.duration_ms ?? 0)
  )[0];
  const labels: string[] = [];
  while (cursor) {
    labels.push(cursor.operation_name || cursor.service_name || cursor.span_id.slice(0, 6));
    const kids = childrenOf.get(cursor.span_id) ?? [];
    cursor = kids.sort((a, b) => (b.duration_ms ?? 0) - (a.duration_ms ?? 0))[0];
  }
  const pathMs = onPath.reduce((acc, s) => acc + (s.duration_ms ?? 0), 0);
  const pct = totalDurationMs > 0 ? Math.min(100, (pathMs / totalDurationMs) * 100) : 0;
  return {
    label: labels.slice(0, 4).join(" → "),
    pct,
  };
}

function KPIStripComponent({ stats, spans, criticalPathSpanIds, p50Ms, p95Ms }: Props) {
  const errors = stats.errors;
  const totalSpans = stats.totalSpans;
  const services = stats.services.size;
  const okCount = Math.max(0, totalSpans - errors);

  const { selfMs } = useMemo(() => computeRootSelfTime(spans), [spans]);
  const selfPct = stats.duration > 0 ? (selfMs / stats.duration) * 100 : 0;

  const critical = useMemo(
    () => summarizeCriticalPath(spans, criticalPathSpanIds, stats.duration),
    [spans, criticalPathSpanIds, stats.duration]
  );

  const showBaseline = !!p50Ms && !!p95Ms && p50Ms > 0 && p95Ms > 0;
  const slowFactor = showBaseline && p50Ms ? stats.duration / p50Ms : null;

  return (
    <div className="tdp-kpis">
      <div className="tdp-kpi tdp-kpi-hero">
        <div className="tdp-kpi-k">Duration</div>
        <div className="tdp-kpi-v">{formatDuration(stats.duration)}</div>
        {showBaseline && slowFactor != null && p95Ms != null && p50Ms != null ? (
          <>
            <div className={`tdp-kpi-delta ${stats.duration > p95Ms ? "tdp-kpi-delta-bad" : ""}`}>
              {slowFactor.toFixed(1)}× p50 · {stats.duration > p95Ms ? "above p95" : "below p95"}
            </div>
            <BaselineBar dur={stats.duration} p50={p50Ms} p95={p95Ms} />
          </>
        ) : (
          <div className="tdp-kpi-sub">end-to-end wall time</div>
        )}
      </div>

      <div className="tdp-kpi">
        <div className="tdp-kpi-k">Errors</div>
        <div className={`tdp-kpi-v ${errors > 0 ? "tdp-kpi-v-err" : ""}`}>{errors}</div>
        <div className="tdp-kpi-sub">{okCount} ok</div>
      </div>

      <div className="tdp-kpi">
        <div className="tdp-kpi-k">Services</div>
        <div className="tdp-kpi-v">{services}</div>
        <div className="tdp-kpi-sub">
          {totalSpans} span{totalSpans === 1 ? "" : "s"}
        </div>
      </div>

      <div className="tdp-kpi">
        <div className="tdp-kpi-k">Self time (root)</div>
        <div className="tdp-kpi-v">{formatDuration(selfMs)}</div>
        <div className="tdp-kpi-sub">{selfPct.toFixed(1)}% of total</div>
      </div>

      <div className="tdp-kpi tdp-kpi-wide">
        <div className="tdp-kpi-k">Critical path</div>
        <div className="tdp-kpi-v tdp-kpi-v-sm" title={critical.label}>
          {critical.label || "—"}
        </div>
        <div className="tdp-kpi-sub">
          {critical.pct > 0 ? `${critical.pct.toFixed(0)}% of total time on this path` : "—"}
        </div>
      </div>
    </div>
  );
}

function BaselineBar({ dur, p50, p95 }: { dur: number; p50: number; p95: number }) {
  const max = Math.max(dur, p95) * 1.1;
  const fillPct = Math.min(100, (dur / max) * 100);
  const p50Pct = Math.min(100, (p50 / max) * 100);
  const p95Pct = Math.min(100, (p95 / max) * 100);
  return (
    <div className="tdp-bbar">
      <div className="tdp-bbar-track">
        <div className="tdp-bbar-fill" style={{ width: `${fillPct}%` }} />
        <div
          className="tdp-bbar-p50"
          style={{ left: `${p50Pct}%` }}
          title={`p50 ${formatDuration(p50)}`}
        />
        <div
          className="tdp-bbar-p95"
          style={{ left: `${p95Pct}%` }}
          title={`p95 ${formatDuration(p95)}`}
        />
      </div>
      <div className="tdp-bbar-legend">
        <span>
          <i className="tdp-dot tdp-dot-p50" /> p50 {formatDuration(p50)}
        </span>
        <span>
          <i className="tdp-dot tdp-dot-p95" /> p95 {formatDuration(p95)}
        </span>
        <span>
          <i className="tdp-dot tdp-dot-now" /> this {formatDuration(dur)}
        </span>
      </div>
    </div>
  );
}

export const KPIStrip = memo(KPIStripComponent);
