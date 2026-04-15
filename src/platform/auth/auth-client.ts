import { z } from "zod"

import { httpClient } from "@/platform/api/http-client"
import { API_CONFIG } from "@/platform/config/api"

const sessionSchema = z.object({
  user: z
    .object({
      email: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
})

export interface SessionUser {
  readonly email?: string
  readonly name?: string
}

export const authClient = {
  async login(email: string, password: string) {
    return httpClient.post(API_CONFIG.endpoints.auth.login, { email, password })
  },
  async logout() {
    await httpClient.post(API_CONFIG.endpoints.auth.logout)
  },
  async getSession(): Promise<SessionUser | null> {
    try {
      const response = await httpClient.get(API_CONFIG.endpoints.auth.me)
      const parsed = sessionSchema.safeParse(response)
      return parsed.success ? (parsed.data.user ?? null) : null
    } catch {
      return null
    }
  },
}
