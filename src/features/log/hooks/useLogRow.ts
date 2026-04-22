import { useCallback, useMemo } from "react";

import { ROUTES } from "@shared/constants/routes";
import { dynamicTo } from "@shared/utils/navigation";

import type { LogRecord } from "../types/log";

export interface LogRowHelpers {
  readonly copyId: () => Promise<void>;
  readonly copyTraceId: () => Promise<void>;
  readonly tracesExplorerHrefForTrace: string | null;
  readonly traceDetailHref: string | null;
}

async function writeClipboard(value: string): Promise<void> {
  if (!value) return;
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    /* ignore — clipboard write is best-effort */
  }
}

/**
 * Per-row helpers: clipboard copies + cross-signal deep-link targets.
 *
 * Cross-signal jump semantics (plan §D.9):
 *   log.trace_id → `/traces/$traceId`                (trace detail page)
 *   log.trace_id → `/logs/explorer?filters=...`      (handled at call site)
 */
export function useLogRow(row: LogRecord): LogRowHelpers {
  const copyId = useCallback(() => writeClipboard(row.id), [row.id]);
  const copyTraceId = useCallback(() => writeClipboard(row.trace_id ?? ""), [row.trace_id]);

  const traceDetailHref = useMemo(() => {
    if (!row.trace_id) return null;
    return dynamicTo(ROUTES.traceDetail.replace("$traceId", encodeURIComponent(row.trace_id)));
  }, [row.trace_id]);

  const tracesExplorerHrefForTrace = useMemo(() => {
    if (!row.trace_id) return null;
    return `${ROUTES.traces}/explorer`;
  }, [row.trace_id]);

  return { copyId, copyTraceId, tracesExplorerHrefForTrace, traceDetailHref };
}
