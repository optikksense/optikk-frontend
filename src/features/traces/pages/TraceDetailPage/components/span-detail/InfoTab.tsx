import { AlertCircle, ChevronRight } from "lucide-react";
import { memo, useMemo } from "react";

import { Skeleton } from "@/components/ui";
import { formatDuration } from "@shared/utils/formatters";

import type { TraceRecord } from "@shared/entities/trace/model";

import type { SpanAttributes } from "../../../../types";

import { AttributesTable } from "./AttributesTable";
import { DatabaseBlock } from "./DatabaseBlock";

interface Props {
  readonly spanAttributes: SpanAttributes | null;
  readonly loading: boolean;
  readonly spans: readonly TraceRecord[];
  readonly selectedSpanId: string | null;
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

  // Self time: span duration minus merged direct-child intervals.
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

  // Ancestors via parent_span_id chain (oldest first).
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

function InfoTabComponent({
  spanAttributes,
  loading,
  spans,
  selectedSpanId,
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
      <div className="tdp-sd-pane">
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

  return (
    <div className="tdp-sd-pane">
      {hasException && (
        <div className="tdp-callout">
          <div className="tdp-callout-h">
            <AlertCircle size={13} /> Span errored
            {spanAttributes?.exceptionType && (
              <span className="tdp-sd-kind" style={{ marginLeft: 4 }}>
                {spanAttributes.exceptionType}
              </span>
            )}
          </div>
          {spanAttributes?.exceptionMessage && (
            <div className="tdp-callout-b">{spanAttributes.exceptionMessage}</div>
          )}
          {spanAttributes?.exceptionStacktrace && (
            <pre className="tdp-raw-pre" style={{ maxHeight: 200, marginTop: 4, fontSize: 11 }}>
              {spanAttributes.exceptionStacktrace}
            </pre>
          )}
        </div>
      )}

      {span && (
        <div className="tdp-sect">
          <div className="tdp-sect-h">
            <div className="tdp-sect-t">Where this happens</div>
          </div>
          <div className="tdp-anc-chain">
            {timing.ancestors.map((a) => (
              <span key={a.span_id} style={{ display: "inline-flex", alignItems: "center" }}>
                <button
                  type="button"
                  className="tdp-anc-link"
                  onClick={() => onSpanClick?.({ span_id: a.span_id })}
                  title={`${a.service_name} · ${a.operation_name}`}
                >
                  <span
                    className="tdp-svc-swatch-sm"
                    style={
                      {
                        ["--tdp-svc-color" as string]: `oklch(0.62 0.14 ${svcHue(a.service_name || "")})`,
                      } as React.CSSProperties
                    }
                  />
                  <span className="tdp-anc-svc">{a.service_name || "—"}</span>
                  <span className="tdp-anc-op">{a.operation_name || "(no name)"}</span>
                </button>
                <span className="tdp-anc-sep">
                  <ChevronRight size={11} />
                </span>
              </span>
            ))}
            <span className="tdp-anc-here">
              <span
                className="tdp-svc-swatch-sm"
                style={
                  {
                    ["--tdp-svc-color" as string]: `oklch(0.62 0.14 ${svcHue(span.service_name || "")})`,
                  } as React.CSSProperties
                }
              />
              <span className="tdp-anc-svc">{span.service_name || "—"}</span>
              <span className="tdp-anc-op">{span.operation_name || "(no name)"}</span>
            </span>
          </div>
        </div>
      )}

      {span && timing.durMs > 0 && (
        <div className="tdp-sect">
          <div className="tdp-sect-h">
            <div className="tdp-sect-t">Timing</div>
          </div>
          <div className="tdp-kv-grid">
            <div>
              <div className="tdp-kv-k">Started</div>
              <div className="tdp-kv-v">+{formatDuration(offsetMs)} from trace start</div>
            </div>
            <div>
              <div className="tdp-kv-k">Ended</div>
              <div className="tdp-kv-v">+{formatDuration(endOffsetMs)} from trace start</div>
            </div>
            <div>
              <div className="tdp-kv-k">Duration</div>
              <div className="tdp-kv-v">{formatDuration(timing.durMs)}</div>
            </div>
            <div>
              <div className="tdp-kv-k">Self time</div>
              <div className="tdp-kv-v">
                {formatDuration(timing.selfMs)} ({selfPct.toFixed(0)}%)
              </div>
            </div>
            {timing.pctOfTrace > 0 && (
              <div>
                <div className="tdp-kv-k">% of trace</div>
                <div className="tdp-kv-v">{timing.pctOfTrace.toFixed(1)}%</div>
              </div>
            )}
            {span.span_kind && (
              <div>
                <div className="tdp-kv-k">Span kind</div>
                <div className="tdp-kv-v">{span.span_kind}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasDb && (
        <div className="tdp-sect">
          <div className="tdp-sect-t">Database</div>
          <DatabaseBlock
            dbSystem={spanAttributes?.dbSystem}
            dbName={spanAttributes?.dbName}
            dbStatement={spanAttributes?.dbStatement}
            dbStatementNormalized={spanAttributes?.dbStatementNormalized}
          />
        </div>
      )}

      <div className="tdp-sect">
        <div className="tdp-sect-t">Attributes</div>
        <AttributesTable
          spanAttributes={spanAttributes?.attributesString ?? {}}
          resourceAttributes={spanAttributes?.resourceAttributes ?? {}}
          onAddFilter={onAddFilter}
        />
      </div>
    </div>
  );
}

export const InfoTab = memo(InfoTabComponent);
