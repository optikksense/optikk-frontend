import axios from "axios";

import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { NETWORK_ERROR, UNKNOWN_ERROR } from "@/shared/constants/errorCodes";

import type { ErrorCode } from "@/shared/constants/errorCodes";

import { session } from "@shared/api/auth/session";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import type { ApiErrorShape } from "@shared/api/utils/errorNormalization";

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

  return toApiErrorShape(error);
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

function isAuthEndpoint(url: string | undefined): boolean {
  return Boolean(url?.includes("/v1/auth/login") || url?.includes("/v1/auth/refresh"));
}

/**
 *
 */
export function attachErrorInterceptor(instance: AxiosInstance): number {
  return instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const config = error.config as RetriableConfig | undefined;
        if (config && !config._retried && !isAuthEndpoint(config.url)) {
          const token = await session.refreshAccessToken();
          if (token != null) {
            config._retried = true;
            return instance.request(config);
          }
        }
      }

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
