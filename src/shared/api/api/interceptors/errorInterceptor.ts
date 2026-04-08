import axios from "axios";

import type { AxiosError, AxiosInstance } from "axios";

import { NETWORK_ERROR, UNKNOWN_ERROR } from "@/shared/constants/errorCodes";

import type { ErrorCode } from "@/shared/constants/errorCodes";

/**
 *
 */
export interface ApiErrorShape {
  readonly status: number;
  readonly code: ErrorCode;
  readonly message: string;
  readonly data?: unknown;
}

function extractApiCode(data: unknown): ErrorCode {
  if (typeof data !== "object" || data === null) {
    return UNKNOWN_ERROR;
  }

  const record = data as Record<string, unknown>;
  const nestedError = record.error;
  if (typeof nestedError === "object" && nestedError !== null) {
    const nestedRecord = nestedError as Record<string, unknown>;
    if (typeof nestedRecord.code === "string" && nestedRecord.code.length > 0) {
      return nestedRecord.code as ErrorCode;
    }
  }

  if (typeof record.code === "string" && record.code.length > 0) {
    return record.code as ErrorCode;
  }

  return UNKNOWN_ERROR;
}

function extractApiMessage(data: unknown): string {
  if (typeof data !== "object" || data === null) {
    return "An error occurred";
  }

  const record = data as Record<string, unknown>;
  const nestedError = record.error;
  if (typeof nestedError === "object" && nestedError !== null) {
    const nestedRecord = nestedError as Record<string, unknown>;
    if (typeof nestedRecord.message === "string" && nestedRecord.message.length > 0) {
      return nestedRecord.message;
    }
  }

  if (typeof record.message === "string" && record.message.length > 0) {
    return record.message;
  }

  return "An error occurred";
}

function normalizeError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      if (status === 401) {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }

      return {
        status,
        code: extractApiCode(data),
        message: extractApiMessage(data),
        data,
      };
    }

    if (axiosError.request) {
      return {
        status: 0,
        code: NETWORK_ERROR,
        message: "Network error - please check your connection",
      };
    }

    return {
      status: 0,
      code: UNKNOWN_ERROR,
      message: axiosError.message || "An unexpected error occurred",
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      code: UNKNOWN_ERROR,
      message: error.message,
    };
  }

  return {
    status: 0,
    code: UNKNOWN_ERROR,
    message: "An unexpected error occurred",
  };
}

/**
 *
 */
export function attachErrorInterceptor(instance: AxiosInstance): number {
  return instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const normalized = normalizeError(error);
      console.error("[API Error]", {
        status: normalized.status,
        code: normalized.code,
        message: normalized.message,
      });
      return Promise.reject(normalized);
    }
  );
}
