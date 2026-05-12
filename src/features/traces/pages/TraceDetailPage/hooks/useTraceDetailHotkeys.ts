import { useEffect } from "react";

import {
  DRAWER_WIDTH_MAX,
  DRAWER_WIDTH_MIN,
  type VisualizationTab,
  useTracesStore,
} from "../../../store/tracesStore";

interface SpanLite {
  readonly span_id: string;
}

interface Args {
  readonly traceId: string;
  readonly spans: readonly SpanLite[];
  readonly errorSpanIds: ReadonlyArray<string>;
  readonly selectedSpanId: string | null;
  readonly onSelectSpan: (spanId: string) => void;
  readonly onCloseSpan: () => void;
  readonly onSetViz: (tab: VisualizationTab) => void;
}

/**
 * Keyboard shortcuts for the trace detail page:
 * - `/`             focus the waterfall search input
 * - `c`             copy the trace ID
 * - `e`             cycle through error spans (next)
 * - `1` / `2`       switch viz: Waterfall / Flame Graph
 * - `↑` / `↓`       previous / next span (in span order)
 * - `j` / `k`       next / previous span (vim-style aliases)
 * - `[` / `]`       shrink / grow drawer width by 40px
 * - `Escape`        close span drawer (also handled inside SpanDrawer for redundancy)
 *
 * All shortcuts are skipped when focus is inside an INPUT/TEXTAREA/contenteditable.
 */
export function useTraceDetailHotkeys({
  traceId,
  spans,
  errorSpanIds,
  selectedSpanId,
  onSelectSpan,
  onCloseSpan,
  onSetViz,
}: Args) {
  const drawerWidth = useTracesStore((s) => s.drawerWidthPx);
  const setDrawerWidth = useTracesStore((s) => s.setDrawerWidthPx);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      switch (e.key) {
        case "/":
          return focusSearch(e);
        case "c":
          return copyTraceId(e, traceId);
        case "e":
          return cycleErrorSpans(e, errorSpanIds, selectedSpanId, onSelectSpan);
        case "1":
          e.preventDefault();
          return onSetViz("timeline");
        case "2":
          e.preventDefault();
          return onSetViz("flamegraph");
        case "ArrowDown":
        case "j":
          return moveSpan(e, spans, selectedSpanId, 1, onSelectSpan);
        case "ArrowUp":
        case "k":
          return moveSpan(e, spans, selectedSpanId, -1, onSelectSpan);
        case "[":
          e.preventDefault();
          return setDrawerWidth(Math.max(DRAWER_WIDTH_MIN, drawerWidth - 40));
        case "]":
          e.preventDefault();
          return setDrawerWidth(Math.min(DRAWER_WIDTH_MAX, drawerWidth + 40));
        case "Escape":
          if (selectedSpanId) {
            e.preventDefault();
            onCloseSpan();
          }
          return;
        default:
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    traceId,
    spans,
    errorSpanIds,
    selectedSpanId,
    onSelectSpan,
    onCloseSpan,
    onSetViz,
    drawerWidth,
    setDrawerWidth,
  ]);
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function focusSearch(e: KeyboardEvent) {
  e.preventDefault();
  const el = document.querySelector<HTMLInputElement>('input[placeholder^="Search spans"]');
  el?.focus();
}

function copyTraceId(e: KeyboardEvent, traceId: string) {
  e.preventDefault();
  void navigator.clipboard?.writeText(traceId).catch(() => {});
}

function cycleErrorSpans(
  e: KeyboardEvent,
  errorSpanIds: ReadonlyArray<string>,
  selectedSpanId: string | null,
  onSelectSpan: (spanId: string) => void
) {
  if (errorSpanIds.length === 0) return;
  e.preventDefault();
  const idx = selectedSpanId ? errorSpanIds.indexOf(selectedSpanId) : -1;
  const next = errorSpanIds[(idx + 1) % errorSpanIds.length];
  onSelectSpan(next);
}

function moveSpan(
  e: KeyboardEvent,
  spans: readonly SpanLite[],
  selectedSpanId: string | null,
  dir: 1 | -1,
  onSelectSpan: (spanId: string) => void
) {
  if (spans.length === 0) return;
  e.preventDefault();
  const ids = spans.map((s) => s.span_id);
  const cur = selectedSpanId ? ids.indexOf(selectedSpanId) : -1;
  const next =
    cur === -1
      ? dir === 1
        ? 0
        : ids.length - 1
      : Math.max(0, Math.min(ids.length - 1, cur + dir));
  if (ids[next]) onSelectSpan(ids[next]);
}
