import type { Tenant, User } from "@shared/types";

import { queryClient } from "@shared/api/queryClient";

import { useAppStore } from "@app/store/appStore";
import { useAuthStore } from "@app/store/authStore";

import { stashSignupApiKey } from "./apiKeyHandoff";
import { AuthError, type SessionPayload, type SignupParams, authApi } from "./authApi";

   
                                                                             
                                                                           
                                                                              
                                                          
   

   
                                                                           
                                                                             
                                                                           
                                                           
   
export type RestoreOutcome = "authenticated" | "unauthenticated" | "unavailable";

let accessToken: string | null = null;
let refreshInflight: Promise<RestoreOutcome> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

                                                                               
                                                                      
const PROACTIVE_REFRESH_LEAD_MS = 60_000;
const MIN_REFRESH_DELAY_MS = 5_000;
                                                                         
                                                                 
const TRANSIENT_RETRY_DELAY_MS = 10_000;

                                                                           
function accessTokenExpiryMs(token: string): number | null {
  const payload = token.split(".")[1];
  if (payload == null) {
    return null;
  }
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function clearRefreshTimer(): void {
  if (refreshTimer != null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleProactiveRefresh(token: string): void {
  clearRefreshTimer();
  const expiryMs = accessTokenExpiryMs(token);
  if (expiryMs == null) {
    return;
  }
  const delay = Math.max(expiryMs - Date.now() - PROACTIVE_REFRESH_LEAD_MS, MIN_REFRESH_DELAY_MS);
  refreshTimer = setTimeout(runProactiveRefresh, delay);
}

                                                                          
                                                                               
                                                                             
                                                 
async function runProactiveRefresh(): Promise<void> {
  if ((await refresh()) === "unavailable") {
    clearRefreshTimer();
    refreshTimer = setTimeout(runProactiveRefresh, TRANSIENT_RETRY_DELAY_MS);
  }
}

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
  scheduleProactiveRefresh(payload.accessToken);
  const tenant = toTenant(payload);
  useAppStore.getState().setSelectedTenantId(tenant.id);
  useAuthStore.getState().setSession(toUser(payload), tenant);
}

function endSession(): void {
  accessToken = null;
  clearRefreshTimer();
  useAppStore.getState().setSelectedTenantId(null);
  queryClient.clear();
  useAuthStore.getState().clearSession();
}

                                                                            
                                                                               
                                     
async function doRefresh(): Promise<RestoreOutcome> {
  try {
    beginSession(await authApi.refresh());
    return "authenticated";
  } catch (error) {
    if (error instanceof AuthError && error.kind === "rejected") {
      endSession();
      return "unauthenticated";
    }
    return "unavailable";
  }
}

                                                                              
                                                                                 
                                                                              
function refresh(force = false): Promise<RestoreOutcome> {
  if (!force && useAuthStore.getState().status === "unauthenticated") {
    return Promise.resolve("unauthenticated");
  }
  refreshInflight ??= doRefresh().finally(() => {
    refreshInflight = null;
  });
  return refreshInflight;
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

                                                                               
                                                                                 
  async refreshAccessToken(): Promise<string | null> {
    return (await refresh()) === "authenticated" ? accessToken : null;
  },

                                                                               
                                                                  
  restore(options?: { readonly force?: boolean }): Promise<RestoreOutcome> {
    if (accessToken != null) {
      return Promise.resolve("authenticated");
    }
    return refresh(options?.force === true);
  },
};
