import type { ErrorCode } from '@/shared/constants/errorCodes';

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

/**
 *
 */
export interface ApiResponseEnvelope<TData> {
  readonly success: boolean;
  readonly data: TData;
  readonly message?: string;
  readonly error?: ApiError;
}
