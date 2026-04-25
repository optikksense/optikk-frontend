import { useEffect } from "react";

import { useTracesStore } from "../../../store/tracesStore";

interface Args {
  readonly traceId: string;
  readonly errorSpanIds: ReadonlyArray<string>;
  readonly onSelectSpan: (spanId: string) => void;
}

/**
 * Keyboard shortcuts for the trace detail page (B13):
 * - `/` focus search (first input with placeholder starting with "Search spans")
 * - `c` copy the trace ID
 * - `e` cycle through error spans (select next)
 * Skips when focus is inside an input/textarea/contenteditable.
 */
export function useTraceDetailHotkeys({ traceId, errorSpanIds, onSelectSpan }: Args) {
  const selectedSpanId = useTracesStore((s) => s.selectedSpanId);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === "/") return handleFocusSearch(e);
      if (e.key === "c") return handleCopy(e, traceId);
      if (e.key === "e") return handleNextError(e, errorSpanIds, selectedSpanId, onSelectSpan);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [traceId, errorSpanIds, selectedSpanId, onSelectSpan]);
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function handleFocusSearch(e: KeyboardEvent) {
  e.preventDefault();
  const el = document.querySelector<HTMLInputElement>('input[placeholder^="Search spans"]');
  el?.focus();
}

function handleCopy(e: KeyboardEvent, traceId: string) {
  e.preventDefault();
  void navigator.clipboard?.writeText(traceId).catch(() => {});
}

function handleNextError(
  e: KeyboardEvent,
  errorSpanIds: ReadonlyArray<string>,
  selectedSpanId: string | null,
  onSelectSpan: (spanId: string) => void,
) {
  if (errorSpanIds.length === 0) return;
  e.preventDefault();
  const idx = selectedSpanId ? errorSpanIds.indexOf(selectedSpanId) : -1;
  const next = errorSpanIds[(idx + 1) % errorSpanIds.length];
  onSelectSpan(next);
}
