/**
 * Logs explorer API barrel.
 *
 * Endpoints (backend `internal/modules/logs/`):
 *   POST /api/v1/logs/query    → queryLogs           (logsQueryApi.ts)
 *   GET  /api/v1/logs/:id      → getLogById          (logByIdApi.ts)
 *   POST /api/v1/logs/trend    → getLogsTrend        (logsAnalyticsApi.ts)
 *   POST /api/v1/logs/facets   → getLogsFacets       (logsAnalyticsApi.ts)
 */
export { queryLogs } from "./logsQueryApi";
export { getLogById } from "./logByIdApi";
export {
  getLogsTrend,
  getLogsFacets,
} from "./logsAnalyticsApi";
export type { LogRecord } from "../types/log";

