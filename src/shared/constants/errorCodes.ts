// Request & validation errors (4xx)
export const BAD_REQUEST = "BAD_REQUEST" as const;
export const VALIDATION_ERROR = "VALIDATION_ERROR" as const;
export const UNAUTHORIZED = "UNAUTHORIZED" as const;
export const FORBIDDEN = "FORBIDDEN" as const;
export const NOT_FOUND = "NOT_FOUND" as const;
export const CONFLICT = "CONFLICT" as const;
export const RATE_LIMITED = "RATE_LIMITED" as const;
export const PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE" as const;

// Server & infrastructure errors (5xx)
export const INTERNAL_ERROR = "INTERNAL_ERROR" as const;
export const QUERY_FAILED = "QUERY_FAILED" as const;
export const QUERY_TIMEOUT = "QUERY_TIMEOUT" as const;
export const CONNECTION_ERROR = "CONNECTION_ERROR" as const;
export const SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE" as const;
export const CIRCUIT_OPEN = "CIRCUIT_OPEN" as const;

// Data-level codes
export const NO_DATA = "NO_DATA" as const;
export const PARTIAL_DATA = "PARTIAL_DATA" as const;

// Network-level (frontend-only, set by interceptor)
export const NETWORK_ERROR = "NETWORK_ERROR" as const;
export const REQUEST_CANCELLED = "REQUEST_CANCELLED" as const;
export const UNKNOWN_ERROR = "UNKNOWN_ERROR" as const;

export type ErrorCode =
  | typeof BAD_REQUEST
  | typeof VALIDATION_ERROR
  | typeof UNAUTHORIZED
  | typeof FORBIDDEN
  | typeof NOT_FOUND
  | typeof CONFLICT
  | typeof RATE_LIMITED
  | typeof PAYLOAD_TOO_LARGE
  | typeof INTERNAL_ERROR
  | typeof QUERY_FAILED
  | typeof QUERY_TIMEOUT
  | typeof CONNECTION_ERROR
  | typeof SERVICE_UNAVAILABLE
  | typeof CIRCUIT_OPEN
  | typeof NO_DATA
  | typeof PARTIAL_DATA
  | typeof NETWORK_ERROR
  | typeof REQUEST_CANCELLED
  | typeof UNKNOWN_ERROR;

/** Human-readable labels for each error code */
export const ERROR_CODE_LABELS: Record<ErrorCode, string> = {
  BAD_REQUEST: "Invalid request",
  VALIDATION_ERROR: "Validation failed",
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Not found",
  CONFLICT: "Resource conflict",
  RATE_LIMITED: "Too many requests",
  PAYLOAD_TOO_LARGE: "Payload too large",
  INTERNAL_ERROR: "Server error",
  QUERY_FAILED: "Query failed",
  QUERY_TIMEOUT: "Query timed out",
  CONNECTION_ERROR: "Database unreachable",
  SERVICE_UNAVAILABLE: "Service unavailable",
  CIRCUIT_OPEN: "Service temporarily disabled",
  NO_DATA: "No data available",
  PARTIAL_DATA: "Partial data loaded",
  NETWORK_ERROR: "Network error",
  REQUEST_CANCELLED: "Request cancelled",
  UNKNOWN_ERROR: "An unexpected error occurred",
};
