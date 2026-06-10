import api from "@shared/api/api/client";

import { API_CONFIG } from "@config/apiConfig";
import { refreshAccessToken } from "./refreshToken";
import { type AuthPayload, type AuthTeam, type AuthUser, normalizeAuthPayload } from "./schemas";
import { tokenStore } from "./tokenStore";

export const authService = {
  normalizeAuthPayload(response: unknown): AuthPayload | null {
    return normalizeAuthPayload(response);
  },

  async login(email: string, password: string): Promise<AuthPayload | unknown> {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    const payload = this.normalizeAuthPayload(response);
    if (payload) {
      tokenStore.set(payload.accessToken ?? null);
    }
    return payload || response;
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error: unknown) {
      console.error("Logout error:", error);
    } finally {
      tokenStore.clear();
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
    const token = await refreshAccessToken();
    return token != null ? this.validateSession() : null;
  },
};

export type { AuthPayload, AuthTeam, AuthUser };
