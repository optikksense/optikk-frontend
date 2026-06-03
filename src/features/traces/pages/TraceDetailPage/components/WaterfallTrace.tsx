import { AlertCircle, ChevronDown, RotateCw } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
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

const wfGrid = "grid grid-cols-[360px_1fr]";

const lblBase = "px-3 flex items-center gap-2 border-r border-border text-[12px] min-w-0";

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
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className={cn(wfGrid, "sticky top-0 z-[5] border-border border-b bg-background")}>
        <div
          className={cn(
            lblBase,
            "!text-[10.5px] h-[34px] text-foreground-caption uppercase tracking-[0.06em]"
          )}
        >
          Service · Operation
        </div>
        <div className="relative h-[34px]">
          <div className="relative h-full">
            {ticks.map(({ t, pct }) => (
              <div key={t} className="absolute top-0 bottom-0" style={{ left: `${pct}%` }}>
                <div className="absolute top-2 bottom-2 w-px bg-border" />
                <div
                  className={cn(
                    "-translate-x-1/2 absolute bottom-[5px] whitespace-nowrap bg-background px-[3px] font-mono text-[10px] text-foreground-caption [font-variant-numeric:tabular-nums]",
                    pct < 4 && "!left-0 !translate-x-0",
                    pct > 96 && "!-translate-x-full"
                  )}
                >
                  {formatDuration(t)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
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

      <div className="flex gap-4 border-border border-t bg-background px-4 py-2.5 text-[11px] text-foreground-caption">
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
  const barColor = `oklch(0.62 0.14 ${hue})`;
  const swatchColor = barColor;

  return (
    <div
      className={cn(
        wfGrid,
        "ease h-[28px] cursor-pointer border-[color-mix(in_oklch,var(--border-color),transparent_70%)] border-b transition-[background] duration-80 hover:bg-secondary",
        isSelected && "bg-[var(--color-primary-subtle-15)]",
        dim && "opacity-[0.35]"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <div
        className={cn(lblBase, isSelected && "shadow-[inset_2px_0_0_var(--color-primary)]")}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <button
          type="button"
          className={cn(
            "ease inline-grid h-[14px] w-[14px] flex-none cursor-pointer place-items-center rounded-[3px] border-0 bg-transparent text-foreground-caption transition-transform duration-120 hover:bg-muted hover:text-foreground",
            !hasChildren && "invisible",
            collapsed && "[&_svg]:-rotate-90"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle();
          }}
          aria-label={hasChildren ? (collapsed ? "Expand" : "Collapse") : ""}
        >
          {hasChildren && <ChevronDown size={12} />}
        </button>
        <span
          className="inline-block h-[7px] w-[7px] flex-none shrink-0 grow-0 basis-[7px] rounded-full"
          style={{ background: swatchColor }}
        />
        <span
          className="max-w-[110px] flex-none overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-foreground-muted"
          title={span.service_name}
        >
          {span.service_name || "—"}
          {isCrit && (
            <span
              aria-hidden
              className="ml-1.5 inline-block h-1 w-1 rounded-full bg-degraded align-[2px]"
            />
          )}
        </span>
        <span
          className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] text-foreground"
          title={span.operation_name}
        >
          {span.operation_name || "(no name)"}
        </span>
        {isErr && (
          <span className="ml-auto inline-flex flex-none items-center gap-[3px] rounded-full bg-error-subtle px-1.5 py-px font-mono text-[10px] text-error">
            <AlertCircle size={9} /> error
          </span>
        )}
        {!isErr && isErrPath && (
          <span className="ml-auto inline-flex flex-none items-center gap-[3px] rounded-full bg-warning-subtle px-1.5 py-px font-mono text-[10px] text-warning">
            <RotateCw size={9} /> err-path
          </span>
        )}
      </div>

      <div className="relative min-w-0 px-3 pr-6">
        <div className="relative h-full">
          <div
            className={cn(
              "-translate-y-1/2 absolute top-1/2 h-3.5 rounded-[3px] shadow-[0_1px_0_oklch(1_0_0/0.08)_inset,0_1px_2px_oklch(0_0_0/0.25)]",
              isErr &&
                "!bg-error !shadow-[0_0_0_1px_var(--color-error-subtle),0_1px_2px_oklch(0_0_0/0.3)]",
              isCrit && "outline outline-1 outline-degraded outline-offset-1"
            )}
            style={{
              left: `${leftPct}%`,
              width: `${widthPct}%`,
              background: isErr ? undefined : barColor,
            }}
            title={`${span.service_name} · ${span.operation_name}\n${formatDuration(dur)} · starts +${formatDuration(startMs - traceStartMs)}`}
          />
          <span
            className={cn(
              "-translate-y-1/2 pointer-events-none absolute top-1/2 whitespace-nowrap font-medium font-mono text-[10.5px] [font-variant-numeric:tabular-nums]",
              isSelected ? "text-foreground" : "text-foreground-secondary"
            )}
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
            const dotBg =
              ev.level === "error"
                ? "bg-error shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-error),transparent_70%)]"
                : ev.level === "warn"
                  ? "bg-warning"
                  : "bg-primary";
            return (
              <span
                key={`${ev.tMs}-${i}`}
                className={cn(
                  "-translate-x-1/2 -translate-y-1/2 pointer-events-auto absolute top-1/2 z-[1] h-2 w-2 rounded-full border-2 border-background",
                  dotBg
                )}
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
