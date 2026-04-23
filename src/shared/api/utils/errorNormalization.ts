import { UNKNOWN_ERROR } from "@/shared/constants/errorCodes";
import type { ErrorCode } from "@/shared/constants/errorCodes";
import type { ApiErrorShape } from "@shared/api/api/interceptors/errorInterceptor";
import { ZodError } from "zod";

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

/**
 * Human-readable error text for UI (drawers, banners). Handles Axios-normalized
 * `ApiErrorShape` objects (plain objects, not `Error` instances), Zod issues,
 * and standard `Error` subclasses.
 */
export function formatErrorForDisplay(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues
      .map((i) => `${i.path.length > 0 ? i.path.join(".") : "root"}: ${i.message}`)
      .join("\n");
  }

  const shape = toApiErrorShape(error);
  const lines: string[] = [];
  if (shape.status > 0) {
    lines.push(`HTTP ${shape.status} (${shape.code})`);
  }
  lines.push(shape.message);
  const generic =
    shape.message === "An error occurred" || shape.message === "An unexpected error occurred";
  if (generic && shape.data !== undefined) {
    try {
      const extra = JSON.stringify(shape.data, null, 2);
      lines.push(extra.length > 2000 ? `${extra.slice(0, 2000)}…` : extra);
    } catch {
      /* ignore */
    }
  }
  return lines.join("\n\n");
}
