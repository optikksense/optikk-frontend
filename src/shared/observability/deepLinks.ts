import { ROUTES } from "@/shared/constants/routes";
import type { ExplorerFilter } from "@/shared/search/types/filters";
import { encodeFilters } from "@/shared/search/utils/urlState";

/**
 * Builds an absolute path + query for the log explorer (`/logs`) using the
 * canonical `ExplorerFilter` model and `encodeFilters`.
 */
export function buildLogsHubHref(opts: {
  readonly filters: readonly ExplorerFilter[];
  readonly fromMs?: number;
  readonly toMs?: number;
}): string {
  const params = new URLSearchParams();
  const encoded = encodeFilters(opts.filters);
  if (encoded) {
    params.set("filters", encoded);
  }
  if (opts.fromMs !== undefined) {
    params.set("from", String(opts.fromMs));
  }
  if (opts.toMs !== undefined) {
    params.set("to", String(opts.toMs));
  }
  const qs = params.toString();
  return qs.length > 0 ? `${ROUTES.logs}?${qs}` : ROUTES.logs;
}

export function traceIdEqualsFilter(traceId: string): ExplorerFilter {
  return { field: "traceId", op: "eq", value: traceId };
}

/** A trace is addressed by id alone, so the link never goes stale. */
export function buildTraceDetailHref(traceId: string, spanId?: string): string {
  const path = `/traces/${encodeURIComponent(traceId)}`;
  return spanId ? `${path}?span=${encodeURIComponent(spanId)}` : path;
}

export function hostEqualsFilter(host: string): ExplorerFilter {
  return { field: "host", op: "eq", value: host };
}

export function podEqualsFilter(podName: string): ExplorerFilter {
  return { field: "pod", op: "eq", value: podName };
}
