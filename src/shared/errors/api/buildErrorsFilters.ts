import type { ExplorerFilter, TranslationWarning } from "@shared/search/types/filters";
import {
  type BuildExtras,
  type BuildResult,
  dispatchCommonFilter,
  handleListField,
  handleSingleValue,
  pushUnknownField,
  pushUnsupportedOp,
} from "@shared/search/utils/buildFilters";

/**
 * Translates `ExplorerFilter[]` into the wire body for the errors read
 * endpoints (`/errors/groups/query`, `/errors/facets`, `/errors/overview`).
 * Mirrors the embedded `spanfilter.Filters` shape on the backend — errors are
 * spans, so the filter vocabulary is the span one minus what a non-error span
 * would need.
 *
 * Filters that cannot be expressed on the wire are reported via `warnings`
 * so the UI can surface them — nothing is dropped silently.
 */

interface ErrorsFiltersBody {
  startTime: number;
  endTime: number;
  limit?: number;
  cursor?: string;
  services?: string[];
  excludeServices?: string[];
  operations?: string[];
  httpStatuses?: string[];
  environments?: string[];
  peerServices?: string[];
  exceptionTypes?: string[];
  traceId?: string;
  minDurationNs?: number;
  maxDurationNs?: number;
  message?: string;
  attributes?: Array<{ key: string; op?: string; value: string }>;
}

export type ErrorsBuildResult = BuildResult<ErrorsFiltersBody>;

/** field -> include array, plus optional exclude array for neq/not_in. */
const LIST_FIELDS: Record<
  string,
  { include: keyof ErrorsFiltersBody; exclude?: keyof ErrorsFiltersBody }
> = {
  service: { include: "services", exclude: "excludeServices" },
  serviceName: { include: "services", exclude: "excludeServices" },
  operation: { include: "operations" },
  httpStatus: { include: "httpStatuses" },
  environment: { include: "environments" },
  peerService: { include: "peerServices" },
  exceptionType: { include: "exceptionTypes" },
};

const DURATION_OPS = ["gte", "gt", "lte", "lt", "eq"];

export function buildErrorsFilters(
  filters: readonly ExplorerFilter[],
  startTime: number,
  endTime: number,
  extras: BuildExtras = {}
): ErrorsBuildResult {
  const body: ErrorsFiltersBody = { startTime, endTime };
  if (extras.limit !== undefined) body.limit = extras.limit;
  if (extras.cursor) body.cursor = extras.cursor;

  const warnings: TranslationWarning[] = [];
  const messageTerms: string[] = [];

  for (const filter of filters) {
    // Shared handlers first (attributes, plus bare free text collected below).
    if (dispatchCommonFilter(filter, body, warnings, messageTerms)) continue;

    const { field, op, value } = filter;

    if (field in LIST_FIELDS) {
      handleListField(field, op, value, body, warnings, LIST_FIELDS[field]);
      continue;
    }

    switch (field) {
      case "message":
        if (op === "contains" || op === "eq") messageTerms.push(value);
        else pushUnsupportedOp(warnings, field, op, "only contains/eq supported");
        break;
      case "traceId":
        if (op === "eq") handleSingleValue(body, "traceId", value, warnings);
        else pushUnsupportedOp(warnings, field, op, "only exact match");
        break;
      case "durationMs": {
        const ms = Number(value);
        if (Number.isNaN(ms) || !DURATION_OPS.includes(op)) {
          pushUnsupportedOp(warnings, field, op, "use a numeric value with comparisons or exact");
          break;
        }
        const ns = ms * 1_000_000;
        if (op === "gte" || op === "gt" || op === "eq") body.minDurationNs = ns;
        if (op === "lte" || op === "lt" || op === "eq") body.maxDurationNs = ns;
        break;
      }
      default:
        pushUnknownField(warnings, field, "errors");
    }
  }

  // Unlike traces, bare free text searches the error message, not the span name.
  if (messageTerms.length > 0) body.message = messageTerms.join(" ");

  return { body, warnings };
}
