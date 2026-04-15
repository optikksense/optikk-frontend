import { z } from "zod";

export const authTeamSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  slug: z.string().min(1).nullable().optional(),
  color: z.string().min(1).nullable().optional(),
  orgName: z.string().min(1).nullable().optional(),
  role: z.string().min(1).nullable().optional(),
});

export const authUserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const authPayloadSchema = z.object({
  user: authUserSchema.optional(),
  teams: z.array(authTeamSchema).optional(),
  currentTeam: authTeamSchema.nullable().optional(),
});

export type AuthTeam = z.infer<typeof authTeamSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthPayload = z.infer<typeof authPayloadSchema>;
