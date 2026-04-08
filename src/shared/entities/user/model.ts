import type { SpanId, TeamId, TraceId, UserId } from "@shared/types/branded";
import { z } from "zod";

export const teamSchema = z
  .object({
    id: z.number().brand<"TeamId">(),
    name: z.string().min(1),
    orgName: z.string().optional(),
  })
  .strict();

export const userSchema = z
  .object({
    id: z.union([z.string(), z.number()]).brand<"UserId">(),
    email: z.string().email(),
    name: z.string().optional(),
    teams: z.array(teamSchema).optional(),
  })
  .strict();

export type User = z.infer<typeof userSchema>;
export type Team = z.infer<typeof teamSchema>;
