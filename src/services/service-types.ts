/**
 * Shared type aliases for service-layer request/response contracts.
 */

/**
 * Supported primitive query parameter values sent to backend APIs.
 */
export type QueryParamValue =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly number[]
  | readonly boolean[]
  | null
  | undefined;

/**
 * Generic query-string object shape used by service methods.
 */
export type QueryParams = Record<string, QueryParamValue>;

/**
 * Start/end time value accepted by backend APIs.
 */
export type RequestTime = string | number;
