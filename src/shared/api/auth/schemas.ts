import { z } from "zod";

export const authTeamSchema = z
  .object({
    id: z.number(),
    name: z.string().min(1),
    slug: z.string().min(1).nullable().optional(),
    color: z.string().min(1).nullable().optional(),
    orgName: z.string().min(1).nullable().optional(),
    role: z.string().min(1).nullable().optional(),
  })
  .strict();

export const authUserSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    email: z.string().email(),
    name: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
  })
  .strict();

export const authPayloadSchema = z
  .object({
    user: authUserSchema.optional(),
    teams: z.array(authTeamSchema).optional(),
    currentTeam: authTeamSchema.nullable().optional(),
    accessToken: z.string().optional(),
  })
  .strict();

export type AuthTeam = z.infer<typeof authTeamSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthPayload = z.infer<typeof authPayloadSchema>;

/** Parses an auth payload, unwrapping a success envelope if present. */
export function normalizeAuthPayload(response: unknown): AuthPayload | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const payload = response as Record<string, unknown>;

  if (payload.success === true && payload.data && typeof payload.data === "object") {
    return authPayloadSchema.safeParse(payload.data).data ?? null;
  }

  return authPayloadSchema.safeParse(payload).data ?? null;
}
