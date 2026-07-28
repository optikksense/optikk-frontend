import { useEffect } from "react";

import type { VisualizationTab } from "../../../store/tracesStore";

interface SpanLite {
  readonly spanId: string;
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

   
                                                
                                                     
                                      
                                                     
                                                        
                                                         
                                                             
                                                                                      
  
                                                                                    
   
export function useTraceDetailHotkeys({
  traceId,
  spans,
  errorSpanIds,
  selectedSpanId,
  onSelectSpan,
  onCloseSpan,
  onSetViz,
}: Args) {
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
          return onSetViz("servicemap");
        case "ArrowDown":
        case "j":
          return moveSpan(e, spans, selectedSpanId, 1, onSelectSpan);
        case "ArrowUp":
        case "k":
          return moveSpan(e, spans, selectedSpanId, -1, onSelectSpan);
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
  }, [traceId, spans, errorSpanIds, selectedSpanId, onSelectSpan, onCloseSpan, onSetViz]);
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
  const ids = spans.map((s) => s.spanId);
  const cur = selectedSpanId ? ids.indexOf(selectedSpanId) : -1;
  const next =
    cur === -1
      ? dir === 1
        ? 0
        : ids.length - 1
      : Math.max(0, Math.min(ids.length - 1, cur + dir));
  if (ids[next]) onSelectSpan(ids[next]);
}
