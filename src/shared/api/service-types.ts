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

export type QueryParams = Record<string, QueryParamValue>;

export type RequestTime = string | number;
