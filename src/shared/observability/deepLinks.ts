import { ROUTES } from "@/shared/constants/routes";
import type { ExplorerFilter } from "@/shared/search/types/filters";
import { encodeFilters } from "@/shared/search/utils/urlState";

   
                                                                           
                                                        
   
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

                                                  
export function buildTraceDetailHref(
  traceId: string,
  spanId?: string,
  fromMs?: number,
  toMs?: number
): string {
  const path = `/traces/${encodeURIComponent(traceId)}`;
  const params = new URLSearchParams();
  if (spanId) params.set("span", spanId);
  if (fromMs !== undefined) params.set("from", String(fromMs));
  if (toMs !== undefined) params.set("to", String(toMs));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function hostEqualsFilter(host: string): ExplorerFilter {
  return { field: "host", op: "eq", value: host };
}

export function podEqualsFilter(podName: string): ExplorerFilter {
  return { field: "pod", op: "eq", value: podName };
}
