import { AlertCircle, ChevronRight } from "lucide-react";
import { memo, useMemo } from "react";

import type { TraceRecord } from "@shared/api/traces/schemas";
import { Skeleton } from "@shared/components/primitives/ui";
import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import { formatDuration } from "@shared/utils/formatters";

import type { RelatedTrace, SpanAttributes, SpanEvent, SpanLink } from "../../../../types";

import { AttributesTable } from "./AttributesTable";
import { DatabaseBlock } from "./DatabaseBlock";
import { SelfChildBar } from "./SelfChildBar";
import { SpanEventsSection } from "./SpanEventsSection";
import { SpanRelatedSection } from "./SpanRelatedSection";

interface Props {
  readonly spanAttributes: SpanAttributes | null;
  readonly loading: boolean;
  readonly spans: readonly TraceRecord[];
  readonly selectedSpanId: string | null;
  readonly spanEvents: readonly SpanEvent[];
  readonly relatedTraces: readonly RelatedTrace[];
  readonly traceStartMs?: number;
  readonly traceEndMs?: number;
  readonly onSpanClick?: (span: { span_id: string }) => void;
  readonly onAddFilter?: (key: string, value: string) => void;
}

const PALETTE_HUES = [222, 32, 268, 174, 112, 8, 296, 56, 198, 332];
function svcHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return PALETTE_HUES[Math.abs(h) % PALETTE_HUES.length];
}

interface TimingFacts {
  readonly selectedSpan: TraceRecord | null;
  readonly ancestors: readonly TraceRecord[];
  readonly startMs: number;
  readonly endMs: number;
  readonly durMs: number;
  readonly selfMs: number;
  readonly pctOfTrace: number;
}

function computeTiming(
  spans: readonly TraceRecord[],
  selectedSpanId: string | null,
  traceStartMs?: number,
  traceEndMs?: number
): TimingFacts {
  const empty: TimingFacts = {
    selectedSpan: null,
    ancestors: [],
    startMs: 0,
    endMs: 0,
    durMs: 0,
    selfMs: 0,
    pctOfTrace: 0,
  };
  if (!selectedSpanId) return empty;
  const byId = new Map<string, TraceRecord>();
  for (const s of spans) byId.set(s.span_id, s);
  const span = byId.get(selectedSpanId);
  if (!span) return empty;

  const startMs = span.start_time ? new Date(span.start_time).getTime() : 0;
  const endMs = span.end_time
    ? new Date(span.end_time).getTime()
    : startMs + (span.duration_ms ?? 0);
  const durMs = Math.max(0, endMs - startMs);

  const children = spans
    .filter((s) => s.parent_span_id === span.span_id)
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
  const selfMs = durMs > 0 ? Math.max(0, durMs - merged) : 0;

  const ancestors: TraceRecord[] = [];
  let cursor: TraceRecord | undefined = span;
  const visited = new Set<string>([span.span_id]);
  while (cursor?.parent_span_id) {
    const parent = byId.get(cursor.parent_span_id);
    if (!parent || visited.has(parent.span_id)) break;
    visited.add(parent.span_id);
    ancestors.unshift(parent);
    cursor = parent;
  }

  const traceWindow =
    traceStartMs != null && traceEndMs != null ? Math.max(0, traceEndMs - traceStartMs) : 0;
  const pctOfTrace = traceWindow > 0 ? (durMs / traceWindow) * 100 : 0;

  return { selectedSpan: span, ancestors, startMs, endMs, durMs, selfMs, pctOfTrace };
}

const kvK = "text-[11px] text-[var(--fg-3)]";
const kvV = "text-[12px] text-[var(--fg-0)] font-mono break-words";
const ancLink =
  "inline-flex items-center gap-[5px] rounded-[4px] border border-[var(--line-2)] bg-[var(--bg-card)] px-[7px] py-[3px] text-[11.5px] text-[var(--fg-2)] cursor-pointer hover:bg-[var(--bg-inset)]";
const ancHere =
  "inline-flex items-center gap-[5px] rounded-[4px] border border-[var(--accent)] bg-[var(--accent-bg)] px-[7px] py-[3px] text-[11.5px] text-[var(--fg-0)]";

function SpanInfoTabComponent({
  spanAttributes,
  loading,
  spans,
  selectedSpanId,
  spanEvents,
  relatedTraces,
  traceStartMs,
  traceEndMs,
  onSpanClick,
  onAddFilter,
}: Props) {
  const timing = useMemo(
    () => computeTiming(spans, selectedSpanId, traceStartMs, traceEndMs),
    [spans, selectedSpanId, traceStartMs, traceEndMs]
  );

  if (loading && !spanAttributes) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton count={6} />
      </div>
    );
  }

  const hasException =
    !!spanAttributes?.exceptionType ||
    !!spanAttributes?.exceptionMessage ||
    !!spanAttributes?.exceptionStacktrace;

  const hasDb =
    !!spanAttributes?.dbSystem ||
    !!spanAttributes?.dbStatement ||
    !!spanAttributes?.dbStatementNormalized;

  const span = timing.selectedSpan;
  const offsetMs = span && traceStartMs != null ? Math.max(0, timing.startMs - traceStartMs) : 0;
  const endOffsetMs = span && traceStartMs != null ? Math.max(0, timing.endMs - traceStartMs) : 0;
  const selfPct = timing.durMs > 0 ? (timing.selfMs / timing.durMs) * 100 : 0;

  const links: readonly SpanLink[] = spanAttributes?.links ?? [];
  const scopedEvents = selectedSpanId ? spanEvents.filter((e) => e.spanId === selectedSpanId) : [];

  return (
    <>
      {hasException && (
        <div
          className="mb-5 flex flex-col gap-1.5 rounded-[10px] border p-3"
          style={{ background: "var(--err-soft)", borderColor: "var(--err)" }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[12.5px] text-[var(--err-fg)]">
            <AlertCircle size={13} /> Span errored
            {spanAttributes?.exceptionType && (
              <span className="ml-1 rounded-[4px] bg-[var(--bg-inset)] px-1.5 py-px font-mono text-[10.5px] text-[var(--fg-3)]">
                {spanAttributes.exceptionType}
              </span>
            )}
          </div>
          {spanAttributes?.exceptionMessage && (
            <div className="text-[12.5px] text-[var(--fg-2)] leading-[1.5]">
              {spanAttributes.exceptionMessage}
            </div>
          )}
          {spanAttributes?.exceptionStacktrace && (
            <pre className="m-0 mt-1 max-h-[200px] overflow-auto whitespace-pre rounded-md border border-[var(--line-2)] bg-[var(--bg-inset)] p-3 font-mono text-[11px] text-[var(--fg-2)]">
              {spanAttributes.exceptionStacktrace}
            </pre>
          )}
        </div>
      )}

      {span && (
        <DrawerSection title="Where this happens">
          <div className="flex flex-wrap items-center gap-1">
            {timing.ancestors.map((a) => (
              <span key={a.span_id} className="inline-flex items-center">
                <button
                  type="button"
                  className={ancLink}
                  onClick={() => onSpanClick?.({ span_id: a.span_id })}
                  title={`${a.service_name} · ${a.operation_name}`}
                >
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: `oklch(0.62 0.14 ${svcHue(a.service_name || "")})` }}
                  />
                  <span className="text-[var(--fg-3)]">{a.service_name || "—"}</span>
                  <span className="font-mono text-[11px] text-[var(--fg-0)]">
                    {a.operation_name || "(no name)"}
                  </span>
                </button>
                <span className="inline-flex text-[var(--fg-3)]">
                  <ChevronRight size={11} />
                </span>
              </span>
            ))}
            <span className={ancHere}>
              <span
                className="h-[7px] w-[7px] shrink-0 rounded-full"
                style={{ background: `oklch(0.62 0.14 ${svcHue(span.service_name || "")})` }}
              />
              <span className="text-[var(--fg-3)]">{span.service_name || "—"}</span>
              <span className="font-mono text-[11px] text-[var(--fg-0)]">
                {span.operation_name || "(no name)"}
              </span>
            </span>
          </div>
        </DrawerSection>
      )}

      {span && timing.durMs > 0 && (
        <DrawerSection title="Timing">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <div className={kvK}>Started</div>
              <div className={kvV}>+{formatDuration(offsetMs)} from trace start</div>
            </div>
            <div>
              <div className={kvK}>Ended</div>
              <div className={kvV}>+{formatDuration(endOffsetMs)} from trace start</div>
            </div>
            <div>
              <div className={kvK}>Duration</div>
              <div className={kvV}>{formatDuration(timing.durMs)}</div>
            </div>
            <div>
              <div className={kvK}>Self time</div>
              <div className={kvV}>
                {formatDuration(timing.selfMs)} ({selfPct.toFixed(0)}%)
              </div>
            </div>
            {timing.pctOfTrace > 0 && (
              <div>
                <div className={kvK}>% of trace</div>
                <div className={kvV}>{timing.pctOfTrace.toFixed(1)}%</div>
              </div>
            )}
            {span.span_kind && (
              <div>
                <div className={kvK}>Span kind</div>
                <div className={kvV}>{span.span_kind}</div>
              </div>
            )}
          </div>
          <div className="mt-2">
            <SelfChildBar
              selfMs={timing.selfMs}
              childMs={Math.max(0, timing.durMs - timing.selfMs)}
            />
          </div>
        </DrawerSection>
      )}

      {hasDb && (
        <DrawerSection title="Database">
          <DatabaseBlock
            dbSystem={spanAttributes?.dbSystem}
            dbName={spanAttributes?.dbName}
            dbStatement={spanAttributes?.dbStatement}
            dbStatementNormalized={spanAttributes?.dbStatementNormalized}
          />
        </DrawerSection>
      )}

      <DrawerSection title="Attributes">
        <AttributesTable
          spanAttributes={spanAttributes?.attributesString ?? {}}
          resourceAttributes={spanAttributes?.resourceAttributes ?? {}}
          onAddFilter={onAddFilter}
        />
      </DrawerSection>

      {selectedSpanId && scopedEvents.length > 0 && (
        <DrawerSection title={`Events · ${scopedEvents.length}`}>
          <SpanEventsSection events={spanEvents} selectedSpanId={selectedSpanId} />
        </DrawerSection>
      )}

      {(links.length > 0 || relatedTraces.length > 0) && (
        <DrawerSection title="Related">
          <SpanRelatedSection links={links} relatedTraces={relatedTraces} />
        </DrawerSection>
      )}
    </>
  );
}

export const SpanInfoTab = memo(SpanInfoTabComponent);
