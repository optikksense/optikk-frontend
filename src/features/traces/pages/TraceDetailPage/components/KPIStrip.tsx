import { memo, useMemo } from "react";

import { cn } from "@shared/lib/utils";
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

function computeMaxDepth(spans: readonly TraceRecord[]): number {
  if (spans.length === 0) return 0;
  const byId = new Map<string, TraceRecord>();
  for (const s of spans) byId.set(s.span_id, s);
  const depthCache = new Map<string, number>();
  const depthOf = (span: TraceRecord, seen: Set<string>): number => {
    const cached = depthCache.get(span.span_id);
    if (cached != null) return cached;
    const parentId = span.parent_span_id;
    let d = 1;
    if (parentId && byId.has(parentId) && !seen.has(parentId)) {
      seen.add(span.span_id);
      d = depthOf(byId.get(parentId)!, seen) + 1;
    }
    depthCache.set(span.span_id, d);
    return d;
  };
  let max = 1;
  for (const s of spans) max = Math.max(max, depthOf(s, new Set<string>([s.span_id])));
  return max;
}

function summarizeCriticalPath(
  spans: readonly TraceRecord[],
  ids: ReadonlySet<string>,
  totalDurationMs: number
): { label: string; pct: number } {
  if (ids.size === 0) return { label: "—", pct: 0 };
  const onPath = spans.filter((s) => ids.has(s.span_id));
  const byId = new Map(onPath.map((s) => [s.span_id, s]));
  const childrenOf = new Map<string, TraceRecord[]>();
  for (const s of onPath) {
    const p = s.parent_span_id ?? "";
    if (!childrenOf.has(p)) childrenOf.set(p, []);
    childrenOf.get(p)!.push(s);
  }
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

const kpiBase = "bg-background px-[18px] py-[14px] flex flex-col gap-1 min-w-0";
const kpiK = "text-[10.5px] tracking-[0.06em] uppercase text-foreground-caption";
const kpiV =
  "text-[24px] font-semibold text-foreground tracking-[-0.015em] font-mono whitespace-nowrap [font-feature-settings:'tnum']";
const kpiSub = "text-[11.5px] text-foreground-caption";

function KPIStripComponent({ stats, spans, criticalPathSpanIds, p50Ms, p95Ms }: Props) {
  const errors = stats.errors;
  const totalSpans = stats.totalSpans;
  const services = stats.services.size;
  const okCount = Math.max(0, totalSpans - errors);

  const maxDepth = useMemo(() => computeMaxDepth(spans), [spans]);

  const critical = useMemo(
    () => summarizeCriticalPath(spans, criticalPathSpanIds, stats.duration),
    [spans, criticalPathSpanIds, stats.duration]
  );

  const showBaseline = !!p50Ms && !!p95Ms && p50Ms > 0 && p95Ms > 0;
  const slowFactor = showBaseline && p50Ms ? stats.duration / p50Ms : null;

  return (
    <div
      className="grid gap-px border-border border-b bg-border"
      style={{
        gridTemplateColumns:
          "minmax(220px, 1.4fr) minmax(110px, 0.7fr) minmax(150px, 0.9fr) minmax(260px, 2fr)",
      }}
    >
      <div className={cn(kpiBase, "bg-secondary")}>
        <div className={kpiK}>Duration</div>
        <div className={kpiV}>{formatDuration(stats.duration)}</div>
        {showBaseline && slowFactor != null && p95Ms != null && p50Ms != null ? (
          <>
            <div
              className={cn(
                "text-[11.5px] text-foreground-muted",
                stats.duration > p95Ms && "text-error"
              )}
            >
              {slowFactor.toFixed(1)}× p50 · {stats.duration > p95Ms ? "above p95" : "below p95"}
            </div>
            <BaselineBar dur={stats.duration} p50={p50Ms} p95={p95Ms} />
          </>
        ) : (
          <div className={kpiSub}>end-to-end wall time</div>
        )}
      </div>

      <div className={kpiBase}>
        <div className={kpiK}>Errors</div>
        <div className={cn(kpiV, errors > 0 && "!text-error")}>{errors}</div>
        <div className={kpiSub}>{okCount} ok</div>
      </div>

      <div className={kpiBase}>
        <div className={kpiK}>Spans · Services</div>
        <div className={kpiV}>
          {totalSpans} <span className="text-foreground-muted">·</span> {services}
        </div>
        <div className={kpiSub}>depth {maxDepth}</div>
      </div>

      <div className={cn(kpiBase, "gap-1.5")}>
        <div className={kpiK}>Critical path</div>
        <div
          className="break-words font-medium text-[13.5px] text-foreground leading-[1.35]"
          title={critical.label}
        >
          {critical.label || "—"}
        </div>
        <div className={kpiSub}>
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
    <div className="mt-1.5">
      <div className="relative h-1.5 overflow-visible rounded-[3px] bg-muted">
        <div
          className="absolute top-0 left-0 h-full rounded-[3px] bg-error"
          style={{ width: `${fillPct}%` }}
        />
        <div
          className="-top-[3px] -bottom-[3px] absolute w-[1.5px] rounded-[1px] bg-success"
          style={{ left: `${p50Pct}%` }}
          title={`p50 ${formatDuration(p50)}`}
        />
        <div
          className="-top-[3px] -bottom-[3px] absolute w-[1.5px] rounded-[1px] bg-warning"
          style={{ left: `${p95Pct}%` }}
          title={`p95 ${formatDuration(p95)}`}
        />
      </div>
      <div className="mt-1.5 flex gap-3 font-mono text-[10.5px] text-foreground-caption">
        <span>
          <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success align-[1px]" /> p50{" "}
          {formatDuration(p50)}
        </span>
        <span>
          <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-warning align-[1px]" /> p95{" "}
          {formatDuration(p95)}
        </span>
        <span>
          <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-error align-[1px]" /> this{" "}
          {formatDuration(dur)}
        </span>
      </div>
    </div>
  );
}

export const KPIStrip = memo(KPIStripComponent);
