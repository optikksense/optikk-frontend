import type { Tenant, User } from "@shared/types";

import { queryClient } from "@shared/api/queryClient";

import { useAppStore } from "@app/store/appStore";
import { useAuthStore } from "@app/store/authStore";

import { stashSignupApiKey } from "./apiKeyHandoff";
import { type SessionPayload, type SignupParams, authApi } from "./authApi";

/**
 * Single owner of the session lifecycle. The access token lives only in
 * this module (never persisted); a page reload recovers it through the
 * httpOnly refresh cookie. All session teardown funnels through
 * `endSession`, so token, tenant selection, query cache, and auth state can
 * never go out of sync.
 */

let accessToken: string | null = null;
let refreshInflight: Promise<string | null> | null = null;

localStorage.removeItem("optikk_auth_state");

function toTenant(payload: SessionPayload): Tenant {
  const { id, name, role, accountStatus, trialEndsAt } = payload.tenant;
  return {
    id,
    name,
    role: role ?? undefined,
    accountStatus: accountStatus ?? undefined,
    trialEndsAt,
  };
}

function toUser(payload: SessionPayload): User {
  const { id, email, name } = payload.user;
  return { id, email, name };
}

function beginSession(payload: SessionPayload): void {
  accessToken = payload.accessToken;
  const tenant = toTenant(payload);
  useAppStore.getState().setSelectedTenantId(tenant.id);
  useAuthStore.getState().setSession(toUser(payload), tenant);
}

function endSession(): void {
  accessToken = null;
  useAppStore.getState().setSelectedTenantId(null);
  queryClient.clear();
  useAuthStore.getState().clearSession();
}

async function doRefresh(): Promise<string | null> {
  try {
    beginSession(await authApi.refresh());
    return accessToken;
  } catch {
    endSession();
    return null;
  }
}

export const session = {
  getAccessToken(): string | null {
    return accessToken;
  },

  async login(email: string, password: string): Promise<void> {
    beginSession(await authApi.login(email, password));
  },

  async signup(params: SignupParams): Promise<"verificationRequired" | "signedIn"> {
    const result = await authApi.signup(params);
    if (result.kind === "signedIn") {
      beginSession(result.session);
      stashSignupApiKey(result.apiKey);
    }
    return result.kind;
  },

  async verifyEmail(token: string): Promise<void> {
    const { session: payload, apiKey } = await authApi.verifyEmail(token);
    beginSession(payload);
    stashSignupApiKey(apiKey);
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout(accessToken);
    } catch {}
    endSession();
  },

  async forgotPassword(email: string): Promise<void> {
    await authApi.forgotPassword(email);
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await authApi.resetPassword(token, password);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await authApi.changePassword(currentPassword, newPassword);
  },

  refreshAccessToken(): Promise<string | null> {
    if (useAuthStore.getState().status === "unauthenticated") {
      return Promise.resolve(null);
    }
    refreshInflight ??= doRefresh().finally(() => {
      refreshInflight = null;
    });
    return refreshInflight;
  },

  async ensureSession(): Promise<boolean> {
    if (accessToken != null) {
      return true;
    }
    return (await this.refreshAccessToken()) != null;
  },
};
