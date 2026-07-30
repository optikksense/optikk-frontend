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

/** A trace is addressed by id and time bounds. */
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

function buildExplorerHref(
  route: string,
  filters: readonly ExplorerFilter[],
  fromMs: number,
  toMs: number
): string {
  const params = new URLSearchParams({
    filters: encodeFilters(filters),
    from: String(fromMs),
    to: String(toMs),
  });
  return `${route}?${params.toString()}`;
}

/** Deep-link to raw spans for exactly one deployed service version and window. */
export function buildDeploymentTracesHref(opts: {
  readonly service: string;
  readonly version: string;
  readonly environment: string;
  readonly fromMs: number;
  readonly toMs: number;
}): string {
  return buildExplorerHref(
    ROUTES.traces,
    [
      { field: "service", op: "eq", value: opts.service },
      { field: "serviceVersion", op: "eq", value: opts.version },
      { field: "environment", op: "eq", value: opts.environment },
    ],
    opts.fromMs,
    opts.toMs
  );
}

/** Deep-link to error groups for exactly one deployed service version and window. */
export function buildDeploymentErrorsHref(opts: {
  readonly service: string;
  readonly version: string;
  readonly environment: string;
  readonly fromMs: number;
  readonly toMs: number;
}): string {
  return buildExplorerHref(
    ROUTES.errors,
    [
      { field: "service", op: "eq", value: opts.service },
      { field: "serviceVersion", op: "eq", value: opts.version },
      { field: "environment", op: "eq", value: opts.environment },
    ],
    opts.fromMs,
    opts.toMs
  );
}
