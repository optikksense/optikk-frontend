import { getById } from "./traceByIdApi";
import { query, queryFacets, queryTrend } from "./tracesQueryApi";

export const tracesExplorerApi = { query, queryFacets, queryTrend, getById };
export type { TracesQueryResponse } from "../types/trace";
