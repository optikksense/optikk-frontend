import { AxiosError, type AxiosResponse } from "axios";
import type { z } from "zod";

import { type ErrorCode, UNKNOWN_ERROR } from "@/shared/constants/errorCodes";

interface ApiEnvelope {
  readonly success: boolean;
  readonly data: unknown;
  readonly error?: unknown;
}

export interface ApiContractErrorShape {
  readonly status: number;
  readonly code: ErrorCode;
  readonly message: string;
  readonly data?: unknown;
}

interface DecodeApiResponseOptions {
  readonly context: string;
  readonly expectedType?: "object" | "array";
  readonly message?: string;
}

const HTML_RESPONSE_PATTERN = /<(?:!doctype|html|head|body|title)\b/i;
const JSON_START_CHARACTERS = new Set(["{", "[", '"']);

export function isApiEnvelope(value: unknown): value is ApiEnvelope {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.success === "boolean" && "data" in record;
}

export function buildPayloadPreview(value: unknown): string {
  if (typeof value === "string") {
    return value.slice(0, 240);
  }

  try {
    return JSON.stringify(value).slice(0, 240);
  } catch {
    return String(value);
  }
}

function stripBom(value: string): string {
  return value.replace(/^\uFEFF/, "");
}

function looksLikeJson(value: string): boolean {
  if (value.length === 0) {
    return false;
  }

  return JSON_START_CHARACTERS.has(value[0] ?? "");
}

export function isHtmlLikePayload(value: unknown): boolean {
  return typeof value === "string" && HTML_RESPONSE_PATTERN.test(value);
}

export function normalizeApiPayload(value: unknown): unknown {
  let current = value;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (typeof current !== "string") {
      return current;
    }

    const trimmed = stripBom(current).trim();
    if (trimmed.length === 0) {
      return trimmed;
    }

    if (!looksLikeJson(trimmed)) {
      return trimmed;
    }

    try {
      current = JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return current;
}

export function unwrapApiPayload(value: unknown): unknown {
  let current = normalizeApiPayload(value);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (!isApiEnvelope(current)) {
      return current;
    }

    if (!current.success) {
      return current;
    }

    current = normalizeApiPayload(current.data);
  }

  return current;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createContractError(message: string, data?: unknown): ApiContractErrorShape {
  return {
    status: 0,
    code: UNKNOWN_ERROR,
    message,
    data,
  };
}

export function createInvalidApiResponseError(
  response: AxiosResponse,
  message: string,
  payload: unknown
): AxiosError {
  return new AxiosError(message, AxiosError.ERR_BAD_RESPONSE, response.config, response.request, {
    ...response,
    data: createContractError(message, {
      payloadType: typeof payload,
      preview: buildPayloadPreview(payload),
    }),
  });
}

export function decodeApiResponse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: unknown,
  options: DecodeApiResponseOptions
): z.infer<TSchema> {
  const normalized = unwrapApiPayload(value);
  const message = options.message ?? `Invalid ${options.context} response`;

  if (typeof normalized === "string") {
    if (import.meta.env.DEV) {
      console.error(`[decodeApiResponse] ${message}`, {
        context: options.context,
        payloadType: "string",
        preview: buildPayloadPreview(normalized),
      });
    }

    throw createContractError(message, {
      context: options.context,
      payloadType: "string",
      preview: buildPayloadPreview(normalized),
      looksLikeHtml: isHtmlLikePayload(normalized),
    });
  }

  if (options.expectedType === "object" && !isPlainObject(normalized)) {
    if (import.meta.env.DEV) {
      console.error(`[decodeApiResponse] ${message}`, {
        context: options.context,
        payloadType: Array.isArray(normalized) ? "array" : typeof normalized,
        preview: buildPayloadPreview(normalized),
      });
    }

    throw createContractError(message, {
      context: options.context,
      expectedType: "object",
      receivedType: Array.isArray(normalized) ? "array" : typeof normalized,
      preview: buildPayloadPreview(normalized),
    });
  }

  if (options.expectedType === "array" && !Array.isArray(normalized)) {
    if (import.meta.env.DEV) {
      console.error(`[decodeApiResponse] ${message}`, {
        context: options.context,
        payloadType: typeof normalized,
        preview: buildPayloadPreview(normalized),
      });
    }

    throw createContractError(message, {
      context: options.context,
      expectedType: "array",
      receivedType: typeof normalized,
      preview: buildPayloadPreview(normalized),
    });
  }

  const result = schema.safeParse(normalized);

  if (!result.success) {
    if (import.meta.env.DEV) {
      console.error(`[decodeApiResponse] ${message}`, {
        context: options.context,
        payloadType: Array.isArray(normalized) ? "array" : typeof normalized,
        preview: buildPayloadPreview(normalized),
        error: result.error,
      });
    }

    // Telemetry hook to capture prod drift silently
    const telemetry = (window as any).telemetry || {
      track: (e: string, d: any) => console.log(`[Telemetry Mock] ${e}`, d),
    };
    telemetry.track("api_contract_violation", {
      errors: result.error.flatten(),
      endpoint: options.context,
      version: "1.0.0", // APP_VERSION mock
    });

    throw createContractError(message, {
      context: options.context,
      preview: buildPayloadPreview(normalized),
      issues: result.error.issues,
    });
  }

  return result.data;
}
