import type { Tenant, User } from "@/types";

import { queryClient } from "@shared/api/queryClient";

import { useAppStore } from "@store/appStore";
import { useAuthStore } from "@store/authStore";

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
  const { id, name, accountStatus, trialEndsAt } = payload.tenant;
  return { id, name, accountStatus: accountStatus ?? undefined, trialEndsAt };
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

  async signup(params: SignupParams): Promise<void> {
    const { session: payload, apiKey } = await authApi.signup(params);
    beginSession(payload);
    stashSignupApiKey(apiKey);
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout(accessToken);
    } catch {}
    endSession();
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
