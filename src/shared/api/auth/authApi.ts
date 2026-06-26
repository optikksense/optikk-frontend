import axios, { type AxiosError } from "axios";
import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";

import { resolveApiBaseURL } from "../api/baseUrl";

/**
 * Pure HTTP layer for the auth endpoints. Uses a bare axios instance (not
 * the shared client) so these requests never enter the Bearer/team-header
 * interceptors and a 401 here can never trigger a recursive refresh.
 */

const teamSchema = z.object({
  id: z.number(),
  name: z.string().min(1),

  slug: z.string().nullish(),
  color: z.string().nullish(),
  orgName: z.string().nullish(),
  role: z.string().nullish(),
});

const userSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  name: z.string().nullish(),
  avatarUrl: z.string().nullish(),
});

const sessionPayloadSchema = z.object({
  user: userSchema,
  team: teamSchema,
  accessToken: z.string().min(1),
});

export type SessionTeam = z.infer<typeof teamSchema>;
export type SessionUser = z.infer<typeof userSchema>;
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

const envelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export class AuthApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

const http = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
});

function serverErrorMessage(error: AxiosError): string | null {
  const body = error.response?.data;
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const message = (body as { error?: { message?: unknown } }).error?.message;
  return typeof message === "string" && message.length > 0 ? message : null;
}

function toAuthApiError(error: unknown, fallback: string): AuthApiError {
  if (axios.isAxiosError(error)) {
    return new AuthApiError(serverErrorMessage(error) ?? fallback, error.response?.status ?? null);
  }
  return new AuthApiError(fallback, null);
}

function unwrapSession(responseBody: unknown): SessionPayload {
  const envelope = envelopeSchema.safeParse(responseBody);
  const candidate = envelope.success ? envelope.data.data : responseBody;
  const payload = sessionPayloadSchema.safeParse(candidate);
  if (!payload.success) {
    console.error("[unwrapSession] envelope.success:", envelope.success);
    console.error("[unwrapSession] raw responseBody:", responseBody);
    console.error("[unwrapSession] candidate passed to schema:", candidate);
    console.error("[unwrapSession] zod issues:", payload.error.issues);
    throw new AuthApiError("Unexpected response from auth server", null);
  }
  return payload.data;
}

export const authApi = {
  async login(email: string, password: string): Promise<SessionPayload> {
    try {
      const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email, password });
      return unwrapSession(response.data);
    } catch (error: unknown) {
      if (error instanceof AuthApiError) throw error;
      throw toAuthApiError(error, "Login failed");
    }
  },

  async refresh(): Promise<SessionPayload> {
    try {
      const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
      return unwrapSession(response.data);
    } catch (error: unknown) {
      if (error instanceof AuthApiError) throw error;
      throw toAuthApiError(error, "Session expired");
    }
  },

  async logout(accessToken: string | null): Promise<void> {
    await http.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, undefined, {
      headers: accessToken != null ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },
};
