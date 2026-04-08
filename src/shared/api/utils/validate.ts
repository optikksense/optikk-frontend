import type { z } from "zod";

import { decodeApiResponse } from "./decode";

export function validateResponse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: unknown
): z.infer<TSchema> {
  return schema.parse(value);
}

export { decodeApiResponse };
