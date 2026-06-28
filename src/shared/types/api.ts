import type { ErrorCode } from "@/shared/constants/errorCodes";

/**
 *
 */
export interface ApiError {
  readonly message: string;
  readonly code: ErrorCode;
  readonly status?: number;
  readonly details?: unknown;
  readonly data?: unknown;
}
