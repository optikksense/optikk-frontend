import { UNKNOWN_ERROR } from "@/shared/constants/errorCodes";
import type { ErrorCode } from "@/shared/constants/errorCodes";
import type { ApiErrorShape } from "@shared/api/api/interceptors/errorInterceptor";

/**
 * Normalizes an unknown error value into a consistent ApiErrorShape.
 * Used by data fetcher hooks to present uniform error objects to consumers.
 */
export function toApiErrorShape(error: unknown): ApiErrorShape {
  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    return {
      status: typeof record.status === "number" ? record.status : 0,
      code: (typeof record.code === "string" && record.code.length > 0
        ? record.code
        : UNKNOWN_ERROR) as ErrorCode,
      message:
        typeof record.message === "string" && record.message.length > 0
          ? record.message
          : "An unexpected error occurred",
      data: record.data,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      code: UNKNOWN_ERROR,
      message: error.message || "An unexpected error occurred",
    };
  }

  return {
    status: 0,
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  };
}
