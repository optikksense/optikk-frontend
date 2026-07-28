import type { ExplorerFilter, TranslationWarning } from "@shared/search/types/filters";
import {
  type BuildExtras,
  type BuildResult,
  dispatchCommonFilter,
  finalizeSearch,
  handleListField,
  handleSingleValue,
  pushUnknownField,
  pushUnsupportedOp,
} from "@shared/search/utils/buildFilters";

   
                                                                            
                                                                        
                                                                            
                                                                     
  
                                                                           
                                                            
   

export interface TracesFiltersBody {
  startTime: number;
  endTime: number;
  limit?: number;
  cursor?: string;
  services?: string[];
  excludeServices?: string[];
  operations?: string[];
  spanKinds?: string[];
  httpMethods?: string[];
  httpStatuses?: string[];
  statuses?: string[];
  excludeStatuses?: string[];
  environments?: string[];
  peerServices?: string[];
  traceId?: string;
  minDurationNs?: number;
  maxDurationNs?: number;
  hasError?: boolean;
  search?: string;
  searchMode?: string;
  attributes?: Array<{ key: string; op?: string; value: string }>;
}

export type TracesBuildResult = BuildResult<TracesFiltersBody>;

                                                                          
const LIST_FIELDS: Record<
  string,
  { include: keyof TracesFiltersBody; exclude?: keyof TracesFiltersBody }
> = {
  service: { include: "services", exclude: "excludeServices" },
  serviceName: { include: "services", exclude: "excludeServices" },
  operation: { include: "operations" },
  spanKind: { include: "spanKinds" },
  httpMethod: { include: "httpMethods" },
  httpStatus: { include: "httpStatuses" },
  status: { include: "statuses", exclude: "excludeStatuses" },
  environment: { include: "environments" },
  peerService: { include: "peerServices" },
};

export function buildTracesFilters(
  filters: readonly ExplorerFilter[],
  startTime: number,
  endTime: number,
  extras: BuildExtras = {}
): TracesBuildResult {
  const body: TracesFiltersBody = { startTime, endTime };
  if (extras.limit !== undefined) body.limit = extras.limit;
  if (extras.cursor) body.cursor = extras.cursor;

  const warnings: TranslationWarning[] = [];
  const searchTerms: string[] = [];

  for (const filter of filters) {
                                                          
    if (dispatchCommonFilter(filter, body, warnings, searchTerms)) continue;

    const { field, op, value } = filter;

    if (field in LIST_FIELDS) {
      handleListField(field, op, value, body, warnings, LIST_FIELDS[field]);
      continue;
    }

    switch (field) {
      case "traceId":
        if (op !== "eq") {
          pushUnsupportedOp(warnings, field, op, "only exact match");
        } else {
          handleSingleValue(body, "traceId", value, warnings);
        }
        break;
      case "durationMs": {
        const ms = Number(value);
        if (Number.isNaN(ms) || !["gte", "gt", "lte", "lt", "eq"].includes(op)) {
          pushUnsupportedOp(warnings, field, op, "use a numeric value with comparisons or exact");
          break;
        }
        const ns = ms * 1_000_000;
        if (op === "gte" || op === "gt" || op === "eq") body.minDurationNs = ns;
        if (op === "lte" || op === "lt" || op === "eq") body.maxDurationNs = ns;
        break;
      }
      case "hasError":
        if (op === "eq") body.hasError = value === "true";
        else pushUnsupportedOp(warnings, field, op, "only hasError:true or hasError:false");
        break;
      default:
        pushUnknownField(warnings, field, "traces");
    }
  }

  finalizeSearch(body, searchTerms);
  return { body, warnings };
}
