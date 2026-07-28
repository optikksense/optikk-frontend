import { z } from "zod";

/**
 * Shared Zod schema for the `pageInfo` envelope used by both logs and traces
 * query responses. Mirrors the Go `PageInfo` struct: `nextCursor` is
 * `omitempty` so it may be absent on the wire.
 */
export const pageInfoSchema = z.object({
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
  limit: z.number(),
});
