import type { z } from "zod";

import { decodeApiResponse } from "./decode";

/**
 * Validate an API response against a Zod schema.
 *
 * If the response fails only due to `unrecognized_keys` (i.e. the backend
 * returned extra fields on a `.strict()` schema), we strip the unknown keys
 * and retry so the UI never silently falls through to an empty state.
 *
 * A DEV warning is emitted so contract drift is visible without crashing.
 */
export function validateResponse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: unknown
): z.infer<TSchema> {
  const result = schema.safeParse(value);
  if (result.success) {
    return result.data;
  }

  const allUnrecognized = result.error.issues.every((issue) => issue.code === "unrecognized_keys");

  if (allUnrecognized && typeof value === "object" && value !== null) {
    if (import.meta.env.DEV) {
      const unknownKeys = result.error.issues.flatMap((i) =>
        i.code === "unrecognized_keys" ? (i as unknown as { keys: string[] }).keys : []
      );
      console.warn(
        "[validateResponse] API contract drift — backend returned unknown keys. Stripping and retrying.",
        { unknownKeys }
      );
    }

    const stripped = stripUnknownKeys(schema, value);
    return schema.parse(stripped);
  }

  throw result.error;
}

function stripUnknownKeys(schema: z.ZodTypeAny, value: unknown): unknown {
  if (schema.def?.type === "array" && Array.isArray(value)) {
    const itemSchema = (schema.def as unknown as Record<string, unknown>).element as
      | z.ZodTypeAny
      | undefined;
    if (itemSchema) {
      return value.map((item) => stripUnknownKeys(itemSchema, item));
    }
    return value;
  }

  if (schema.def?.type === "object" && typeof value === "object" && value !== null) {
    const shape = (schema.def as unknown as Record<string, unknown>).shape as
      | Record<string, z.ZodTypeAny>
      | undefined;
    if (shape) {
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(shape)) {
        if (key in (value as Record<string, unknown>)) {
          out[key] = (value as Record<string, unknown>)[key];
        }
      }
      return out;
    }
  }

  return value;
}

export { decodeApiResponse };
