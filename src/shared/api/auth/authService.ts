import api from "@shared/api/api/client";

import { API_CONFIG } from "@config/apiConfig";
import { type AuthPayload, type AuthTeam, type AuthUser, authPayloadSchema } from "./schemas";

export const authService = {
  normalizeAuthPayload(response: unknown): AuthPayload | null {
    if (!response || typeof response !== "object") {
      return null;
    }

    const payload = response as Record<string, unknown>;

    // If it's a success envelope, unwrap the nested data
    if (payload.success === true && payload.data && typeof payload.data === "object") {
      return authPayloadSchema.safeParse(payload.data).data ?? null;
    }

    // Otherwise, assume it's already unwrapped and parse it directly
    // This handles the case where the global API interceptor has already stripped the envelope.
    return authPayloadSchema.safeParse(payload).data ?? null;
  },

  async login(email: string, password: string): Promise<AuthPayload | unknown> {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    return this.normalizeAuthPayload(response) || response;
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error: unknown) {
      console.error("Logout error:", error);
    }
  },

  async validateSession(): Promise<AuthPayload | null> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      return this.normalizeAuthPayload(response);
    } catch {
      return null;
    }
  },

  async refreshSession(): Promise<AuthPayload | null> {
    return this.validateSession();
  },
};

export type { AuthPayload, AuthTeam, AuthUser };
