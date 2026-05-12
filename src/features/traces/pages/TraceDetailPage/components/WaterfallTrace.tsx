import { AlertCircle, ChevronDown, RotateCw } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { formatDuration } from "@shared/utils/formatters";

import type { TraceRecord } from "@shared/entities/trace/model";

import type { SpanEvent } from "../../../types";

interface Props {
  readonly spans: readonly TraceRecord[];
  readonly selectedSpanId: string | null;
  readonly onSpanClick: (span: { span_id: string }) => void;
  readonly criticalPathSpanIds: ReadonlySet<string>;
  readonly errorPathSpanIds: ReadonlySet<string>;
  readonly search: string;
  readonly spanEvents?: readonly SpanEvent[];
}

type EventLevel = "info" | "warn" | "error";
interface BarEvent {
  readonly level: EventLevel;
  readonly tMs: number;
  readonly name: string;
}

function eventLevel(name: string): EventLevel {
  const n = name.toLowerCase();
  if (n.includes("exception") || n.includes("error")) return "error";
  if (n.includes("warn") || n.includes("retry")) return "warn";
  return "info";
}

interface FlatSpan {
  readonly span: TraceRecord;
  readonly depth: number;
  readonly hasChildren: boolean;
  readonly startMs: number;
  readonly endMs: number;
}

const PALETTE_HUES = [222, 32, 268, 174, 112, 8, 296, 56, 198, 332];
function svcHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return PALETTE_HUES[Math.abs(h) % PALETTE_HUES.length];
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const m = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return m * pow;
}

interface BuildTreeResult {
  readonly flat: readonly FlatSpan[];
  readonly traceStartMs: number;
  readonly traceEndMs: number;
}

function buildFlatTree(
  spans: readonly TraceRecord[],
  collapsed: ReadonlySet<string>
): BuildTreeResult {
  if (spans.length === 0) return { flat: [], traceStartMs: 0, traceEndMs: 0 };

  const byId = new Map<string, TraceRecord>();
  const children = new Map<string, TraceRecord[]>();
  let minStart = Number.POSITIVE_INFINITY;
  let maxEnd = Number.NEGATIVE_INFINITY;
  for (const s of spans) {
    byId.set(s.span_id, s);
    const startMs = s.start_time ? new Date(s.start_time).getTime() : 0;
    const endMs = s.end_time ? new Date(s.end_time).getTime() : startMs;
    if (Number.isFinite(startMs) && startMs > 0 && startMs < minStart) minStart = startMs;
    if (Number.isFinite(endMs) && endMs > maxEnd) maxEnd = endMs;
  }
  for (const s of spans) {
    const p = s.parent_span_id ?? "";
    if (p && byId.has(p)) {
      if (!children.has(p)) children.set(p, []);
      children.get(p)!.push(s);
    }
  }
  for (const arr of children.values()) {
    arr.sort((a, b) => {
      const sa = a.start_time ? new Date(a.start_time).getTime() : 0;
      const sb = b.start_time ? new Date(b.start_time).getTime() : 0;
      return sa - sb;
    });
  }

  const roots = spans.filter((s) => !s.parent_span_id || !byId.has(s.parent_span_id));
  roots.sort((a, b) => {
    const sa = a.start_time ? new Date(a.start_time).getTime() : 0;
    const sb = b.start_time ? new Date(b.start_time).getTime() : 0;
    return sa - sb;
  });

  const flat: FlatSpan[] = [];
  const visit = (s: TraceRecord, depth: number) => {
    const startMs = s.start_time ? new Date(s.start_time).getTime() : 0;
    const endMs = s.end_time ? new Date(s.end_time).getTime() : startMs + (s.duration_ms ?? 0);
    const kids = children.get(s.span_id) ?? [];
    flat.push({ span: s, depth, hasChildren: kids.length > 0, startMs, endMs });
    if (collapsed.has(s.span_id)) return;
    for (const k of kids) visit(k, depth + 1);
  };
  for (const r of roots) visit(r, 0);

  return {
    flat,
    traceStartMs: Number.isFinite(minStart) ? minStart : 0,
    traceEndMs: Number.isFinite(maxEnd) ? maxEnd : 0,
  };
}

function matchesQuery(span: TraceRecord, q: string): boolean {
  if (!q) return true;
  const ql = q.toLowerCase();
  const hay =
    `${span.service_name} ${span.operation_name} ${span.http_method ?? ""} ${span.http_status_code ?? ""}`.toLowerCase();
  return hay.includes(ql);
}

function WaterfallTraceComponent({
  spans,
  selectedSpanId,
  onSpanClick,
  criticalPathSpanIds,
  errorPathSpanIds,
  search,
  spanEvents,
}: Props) {
  const eventsBySpan = useMemo(() => {
    const m = new Map<string, BarEvent[]>();
    if (!spanEvents?.length) return m;
    for (const e of spanEvents) {
      const tMs = e.timestamp ? new Date(e.timestamp).getTime() : Number.NaN;
      if (!Number.isFinite(tMs)) continue;
      const arr = m.get(e.spanId);
      const item: BarEvent = { level: eventLevel(e.eventName), tMs, name: e.eventName };
      if (arr) arr.push(item);
      else m.set(e.spanId, [item]);
    }
    return m;
  }, [spanEvents]);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { flat, traceStartMs, traceEndMs } = useMemo(
    () => buildFlatTree(spans, collapsed),
    [spans, collapsed]
  );
  const totalMs = Math.max(0, traceEndMs - traceStartMs);

  const ticks = useMemo(() => {
    if (totalMs <= 0) return [] as { t: number; pct: number }[];
    const step = niceStep(totalMs / 8);
    const out: { t: number; pct: number }[] = [];
    for (let t = 0; t <= totalMs; t += step) {
      out.push({ t, pct: (t / totalMs) * 100 });
    }
    return out;
  }, [totalMs]);

  const showCritDot = criticalPathSpanIds.size > 0;

  return (
    <div className="tdp-wf">
      <div className="tdp-wf-head">
        <div className="tdp-wf-head-lbl">Service · Operation</div>
        <div className="tdp-wf-head-bar">
          <div className="tdp-ruler">
            {ticks.map(({ t, pct }) => (
              <div key={t} className="tdp-ruler-tick" style={{ left: `${pct}%` }}>
                <div className="tdp-ruler-line" />
                <div
                  className={`tdp-ruler-lbl ${pct < 4 ? "is-first" : ""} ${pct > 96 ? "is-last" : ""}`}
                >
                  {formatDuration(t)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tdp-wf-body">
        {flat.map((row) => (
          <Row
            key={row.span.span_id}
            row={row}
            selectedSpanId={selectedSpanId}
            traceStartMs={traceStartMs}
            totalMs={totalMs}
            isCrit={showCritDot && criticalPathSpanIds.has(row.span.span_id)}
            isErrPath={errorPathSpanIds.has(row.span.span_id)}
            dim={!matchesQuery(row.span, search)}
            collapsed={collapsed.has(row.span.span_id)}
            events={eventsBySpan.get(row.span.span_id)}
            onClick={() => onSpanClick({ span_id: row.span.span_id })}
            onToggle={() => toggle(row.span.span_id)}
          />
        ))}
      </div>

      <div className="tdp-wf-foot">
        <span>
          Showing {flat.length} of {spans.length} span{spans.length === 1 ? "" : "s"}
        </span>
        <span>View: 0 – {formatDuration(totalMs)}</span>
        <span>Click a row to inspect · use the search box above to filter</span>
      </div>
    </div>
  );
}

interface RowProps {
  readonly row: FlatSpan;
  readonly selectedSpanId: string | null;
  readonly traceStartMs: number;
  readonly totalMs: number;
  readonly isCrit: boolean;
  readonly isErrPath: boolean;
  readonly dim: boolean;
  readonly collapsed: boolean;
  readonly events?: readonly BarEvent[];
  readonly onClick: () => void;
  readonly onToggle: () => void;
}

function Row({
  row,
  selectedSpanId,
  traceStartMs,
  totalMs,
  isCrit,
  isErrPath,
  dim,
  collapsed,
  events,
  onClick,
  onToggle,
}: RowProps) {
  const { span, depth, hasChildren, startMs, endMs } = row;
  const dur = Math.max(0, endMs - startMs);
  const leftPct = totalMs > 0 ? Math.max(0, ((startMs - traceStartMs) / totalMs) * 100) : 0;
  const widthPctRaw = totalMs > 0 ? (dur / totalMs) * 100 : 0;
  const widthPct = Math.max(0.4, widthPctRaw);
  const endPct = leftPct + widthPct;
  const flipLeft = endPct > 80;
  const isErr = (span.status ?? "").toUpperCase() === "ERROR";
  const isSelected = selectedSpanId === span.span_id;
  const hue = svcHue(span.service_name || "");

  return (
    <div
      className={`tdp-wf-row ${isSelected ? "is-sel" : ""} ${isCrit ? "is-crit" : ""} ${dim ? "is-dim" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <div className="tdp-wf-lbl" style={{ paddingLeft: 8 + depth * 14 }}>
        <button
          type="button"
          className={`tdp-wf-twist ${hasChildren ? "" : "is-leaf"} ${collapsed ? "is-collapsed" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle();
          }}
          aria-label={hasChildren ? (collapsed ? "Expand" : "Collapse") : ""}
        >
          {hasChildren && <ChevronDown size={12} />}
        </button>
        <span
          className="tdp-svc-swatch-sm"
          style={{ ["--tdp-svc-color" as string]: `oklch(0.62 0.14 ${hue})` }}
        />
        <span className="tdp-wf-svc" title={span.service_name}>
          {span.service_name || "—"}
        </span>
        <span className="tdp-wf-op" title={span.operation_name}>
          {span.operation_name || "(no name)"}
        </span>
        {isErr && (
          <span className="tdp-wf-tag tdp-wf-tag-err">
            <AlertCircle size={9} /> error
          </span>
        )}
        {!isErr && isErrPath && (
          <span className="tdp-wf-tag tdp-wf-tag-warn">
            <RotateCw size={9} /> err-path
          </span>
        )}
      </div>

      <div className="tdp-wf-bar-col">
        <div className="tdp-wf-bar-wrap">
          <div
            className={`tdp-wf-bar ${isErr ? "is-err" : ""} ${isCrit ? "is-crit-bar" : ""}`}
            style={{
              left: `${leftPct}%`,
              width: `${widthPct}%`,
              ["--tdp-bar-color" as string]: `oklch(0.62 0.14 ${hue})`,
            }}
            title={`${span.service_name} · ${span.operation_name}\n${formatDuration(dur)} · starts +${formatDuration(startMs - traceStartMs)}`}
          />
          <span
            className="tdp-wf-bar-lbl-out"
            style={
              flipLeft
                ? { right: `calc(${100 - leftPct}% + 6px)` }
                : { left: `calc(${endPct}% + 6px)` }
            }
          >
            {formatDuration(dur)}
          </span>
          {events?.map((ev, i) => {
            if (totalMs <= 0) return null;
            const pct = ((ev.tMs - traceStartMs) / totalMs) * 100;
            if (pct < 0 || pct > 100) return null;
            return (
              <span
                key={`${ev.tMs}-${i}`}
                className={`tdp-wf-evt tdp-wf-evt-${ev.level}`}
                style={{ left: `${pct}%` }}
                title={`${ev.level}: ${ev.name}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const WaterfallTrace = memo(WaterfallTraceComponent);
