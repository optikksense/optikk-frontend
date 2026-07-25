import type { TraceRecord } from "@shared/api/traces/schemas";

export type EventLevel = "info" | "warn" | "error";

export interface BarEvent {
  readonly level: EventLevel;
  readonly tMs: number;
  readonly name: string;
}

export function eventLevel(name: string): EventLevel {
  const n = name.toLowerCase();
  if (n.includes("exception") || n.includes("error")) return "error";
  if (n.includes("warn") || n.includes("retry")) return "warn";
  return "info";
}

export interface FlatSpan {
  readonly span: TraceRecord;
  readonly depth: number;
  readonly hasChildren: boolean;
  readonly startMs: number;
  readonly endMs: number;
}

export function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const m = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return m * pow;
}

export interface BuildTreeResult {
  readonly flat: readonly FlatSpan[];
  readonly traceStartMs: number;
  readonly traceEndMs: number;
}

export function buildFlatTree(
  spans: readonly TraceRecord[],
  collapsed: ReadonlySet<string>
): BuildTreeResult {
  if (spans.length === 0) return { flat: [], traceStartMs: 0, traceEndMs: 0 };

  const byId = new Map<string, TraceRecord>();
  const children = new Map<string, TraceRecord[]>();
  let minStart = Number.POSITIVE_INFINITY;
  let maxEnd = Number.NEGATIVE_INFINITY;

  for (const s of spans) {
    byId.set(s.spanId, s);
    const startMs = s.startTime ? new Date(s.startTime).getTime() : 0;
    const endMs = s.endTime ? new Date(s.endTime).getTime() : startMs;
    if (Number.isFinite(startMs) && startMs > 0 && startMs < minStart) minStart = startMs;
    if (Number.isFinite(endMs) && endMs > maxEnd) maxEnd = endMs;
  }

  for (const s of spans) {
    const p = s.parentSpanId ?? "";
    if (p && byId.has(p)) {
      if (!children.has(p)) children.set(p, []);
      children.get(p)!.push(s);
    }
  }

  for (const arr of children.values()) {
    arr.sort((a, b) => {
      const sa = a.startTime ? new Date(a.startTime).getTime() : 0;
      const sb = b.startTime ? new Date(b.startTime).getTime() : 0;
      return sa - sb;
    });
  }

  const roots = spans.filter((s) => !s.parentSpanId || !byId.has(s.parentSpanId));
  roots.sort((a, b) => {
    const sa = a.startTime ? new Date(a.startTime).getTime() : 0;
    const sb = b.startTime ? new Date(b.startTime).getTime() : 0;
    return sa - sb;
  });

  const flat: FlatSpan[] = [];
  const visit = (s: TraceRecord, depth: number) => {
    const startMs = s.startTime ? new Date(s.startTime).getTime() : 0;
    const endMs = s.endTime ? new Date(s.endTime).getTime() : startMs + (s.durationMs ?? 0);
    const kids = children.get(s.spanId) ?? [];
    flat.push({ span: s, depth, hasChildren: kids.length > 0, startMs, endMs });
    if (collapsed.has(s.spanId)) return;
    for (const k of kids) visit(k, depth + 1);
  };
  for (const r of roots) visit(r, 0);

  return {
    flat,
    traceStartMs: Number.isFinite(minStart) ? minStart : 0,
    traceEndMs: Number.isFinite(maxEnd) ? maxEnd : 0,
  };
}

export function matchesQuery(span: TraceRecord, q: string): boolean {
  if (!q) return true;
  const ql = q.toLowerCase();
  const hay =
    `${span.serviceName} ${span.operationName} ${span.httpMethod ?? ""} ${span.httpStatusCode ?? ""}`.toLowerCase();
  return hay.includes(ql);
}
