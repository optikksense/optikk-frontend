import api from '@shared/api/api/client';

import { API_CONFIG } from '@config/apiConfig';
import { authPayloadSchema, type AuthPayload, type AuthTeam, type AuthUser } from './schemas';

interface AuthEnvelope {
  readonly user?: AuthUser;
  readonly teams?: AuthTeam[];
  readonly currentTeam?: AuthTeam | null;
  readonly success?: boolean;
  readonly data?: unknown;
}

function asAuthEnvelope(value: unknown): AuthEnvelope | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  return value as AuthEnvelope;
}

export const authService = {
  normalizeAuthPayload(response: unknown): AuthPayload | null {
    const payload = asAuthEnvelope(response);
    if (!payload) {
      return null;
    }

    if (payload.success === true) {
      const nestedPayload = asAuthEnvelope(payload.data);
      return nestedPayload ? (authPayloadSchema.safeParse(nestedPayload).data ?? null) : null;
    }

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
      console.error('Logout error:', error);
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
