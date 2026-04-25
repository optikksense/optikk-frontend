import { CHART_COLORS, STATUS_COLORS } from "@config/constants";

import type { WaterfallSpan, WaterfallTreeSpan } from "./waterfallTypes";

export interface WaterfallTreeResult {
  readonly spanTree: readonly WaterfallTreeSpan[];
  readonly services: readonly string[];
  readonly traceDuration: number;
  readonly traceStart: number;
}

/** Builds a depth-first flat list from parent/child span records. */
export function buildSpanTree(spans: readonly WaterfallSpan[]): WaterfallTreeResult {
  if (spans.length === 0) return { spanTree: [], services: [], traceDuration: 0, traceStart: 0 };
  const startTimes = spans.map((s) => new Date(s.start_time).getTime());
  const endTimes = spans.map((s) => new Date(s.end_time).getTime());
  const traceStart = Math.min(...startTimes);
  const traceDuration = Math.max(...endTimes) - traceStart;
  const spanMap = indexById(spans);
  const childrenMap = indexChildren(spans);
  const tree: WaterfallTreeSpan[] = [];
  const visited = new Set<string>();
  const dfs = (id: string, depth: number) => {
    if (visited.has(id)) return;
    visited.add(id);
    const s = spanMap[id];
    if (!s) return;
    tree.push(shapeSpan(s, depth, traceStart, traceDuration, (childrenMap[id] ?? []).length));
    sortChildren(childrenMap[id] ?? [], spanMap).forEach((c) => dfs(c.span_id, depth + 1));
  };
  roots(spans, spanMap).forEach((r) => dfs(r.span_id, 0));
  return { spanTree: tree, services: uniqueServices(tree), traceDuration, traceStart };
}

function indexById(spans: readonly WaterfallSpan[]): Record<string, WaterfallSpan> {
  const out: Record<string, WaterfallSpan> = {};
  for (const s of spans) out[s.span_id] = s;
  return out;
}

function indexChildren(spans: readonly WaterfallSpan[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const s of spans) {
    out[s.span_id] ??= [];
    if (s.parent_span_id) {
      out[s.parent_span_id] ??= [];
      out[s.parent_span_id].push(s.span_id);
    }
  }
  return out;
}

function shapeSpan(
  s: WaterfallSpan,
  depth: number,
  traceStart: number,
  traceDuration: number,
  childCount: number,
): WaterfallTreeSpan {
  const t0 = new Date(s.start_time).getTime();
  const t1 = new Date(s.end_time).getTime();
  return {
    ...s,
    depth,
    leftPct: traceDuration > 0 ? ((t0 - traceStart) / traceDuration) * 100 : 0,
    widthPct: traceDuration > 0 ? ((t1 - t0) / traceDuration) * 100 : 0,
    barColor: serviceColor(s.service_name ?? "", s.status ?? ""),
    durationPct: traceDuration > 0 ? (((s.duration_ms ?? 0) / traceDuration) * 100).toFixed(1) : "—",
    childCount,
  };
}

function sortChildren(ids: readonly string[], map: Record<string, WaterfallSpan>): WaterfallSpan[] {
  return ids
    .map((c) => map[c])
    .filter((s): s is WaterfallSpan => Boolean(s))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

function roots(spans: readonly WaterfallSpan[], map: Record<string, WaterfallSpan>): WaterfallSpan[] {
  return spans
    .filter((s) => !s.parent_span_id || !map[s.parent_span_id])
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

function uniqueServices(tree: readonly WaterfallTreeSpan[]): string[] {
  const set = new Set<string>();
  for (const s of tree) if (s.service_name) set.add(s.service_name);
  return Array.from(set);
}

export function serviceColor(serviceName: string, status: string): string {
  if (status === "ERROR") return STATUS_COLORS.ERROR;
  const hash = (serviceName ?? "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CHART_COLORS[hash % CHART_COLORS.length];
}

/** Filter out spans whose ancestor is collapsed (hides the subtree). */
export function applyCollapse(
  tree: readonly WaterfallTreeSpan[],
  collapsed: ReadonlySet<string>,
): readonly WaterfallTreeSpan[] {
  if (collapsed.size === 0) return tree;
  const hiddenDepth: number[] = [];
  const out: WaterfallTreeSpan[] = [];
  for (const s of tree) {
    while (hiddenDepth.length > 0 && s.depth <= hiddenDepth[hiddenDepth.length - 1]) hiddenDepth.pop();
    if (hiddenDepth.length === 0) out.push(s);
    if (collapsed.has(s.span_id)) hiddenDepth.push(s.depth);
  }
  return out;
}
