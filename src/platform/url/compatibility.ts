import { ROUTES } from "@/platform/config/routes"
import { type StructuredFilter, encodeStructuredFilters } from "@/platform/url/filter-codec"

export function buildLogsHubHref(opts: {
  readonly filters: StructuredFilter[]
  readonly fromMs?: number
  readonly toMs?: number
}): string {
  return buildFilteredHref(ROUTES.logs, opts.filters, opts.fromMs, opts.toMs)
}

export function buildTracesHubHref(opts: {
  readonly filters: StructuredFilter[]
  readonly fromMs?: number
  readonly toMs?: number
}): string {
  return buildFilteredHref(ROUTES.traces, opts.filters, opts.fromMs, opts.toMs)
}

export function traceIdEqualsFilter(traceId: string): StructuredFilter {
  return { field: "trace_id", operator: "equals", value: traceId }
}

export function traceDetailHref(traceId: string): string {
  return ROUTES.traceDetail.replace("$traceId", traceId)
}

function buildFilteredHref(
  path: string,
  filters: StructuredFilter[],
  fromMs?: number,
  toMs?: number,
) {
  const params = new URLSearchParams()
  const encodedFilters = encodeStructuredFilters(filters)
  if (encodedFilters) {
    params.set("filters", encodedFilters)
  }
  if (fromMs !== undefined) {
    params.set("from", String(fromMs))
  }
  if (toMs !== undefined) {
    params.set("to", String(toMs))
  }
  return params.size > 0 ? `${path}?${params.toString()}` : path
}
