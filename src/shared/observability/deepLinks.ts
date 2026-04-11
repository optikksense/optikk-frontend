import { ROUTES } from "@/shared/constants/routes";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { encodeStructuredFiltersParam } from "@/shared/hooks/useURLFilters";

/**
 * Builds an absolute path + query for the log explorer (`/logs`) using the same
 * `filters`, `from`, and `to` conventions as `useURLFilters` + `useTimeRangeURL`.
 */
export function buildLogsHubHref(opts: {
  readonly filters: StructuredFilter[];
  readonly fromMs?: number;
  readonly toMs?: number;
}): string {
  const params = new URLSearchParams();
  const encoded = encodeStructuredFiltersParam(opts.filters);
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

/**
 * Builds `/traces` URL with `filters`, optional `from`/`to` (ms), matching traces explorer URL sync.
 */
export function buildTracesHubHref(opts: {
  readonly filters: StructuredFilter[];
  readonly fromMs?: number;
  readonly toMs?: number;
}): string {
  const params = new URLSearchParams();
  const encoded = encodeStructuredFiltersParam(opts.filters);
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
  return qs.length > 0 ? `${ROUTES.traces}?${qs}` : ROUTES.traces;
}

/** Trace explorer search pill → query string includes all GenAI-related spans. */
export function genAiSystemSearchFilter(): StructuredFilter {
  return { field: "search", operator: "contains", value: "@gen_ai.system:*" };
}

export function traceIdEqualsFilter(traceId: string): StructuredFilter {
  return { field: "trace_id", operator: "equals", value: traceId };
}

export function hostEqualsFilter(host: string): StructuredFilter {
  return { field: "host", operator: "equals", value: host };
}

export function podEqualsFilter(podName: string): StructuredFilter {
  return { field: "pod", operator: "equals", value: podName };
}

export function traceDetailHref(traceId: string): string {
  return ROUTES.traceDetail.replace("$traceId", traceId);
}
