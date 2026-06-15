import type { Team, User } from "@/types";

import { queryClient } from "@shared/api/queryClient";

import { useAppStore } from "@store/appStore";
import { useAuthStore } from "@store/authStore";

import { type SessionPayload, authApi } from "./authApi";

/**
 * Single owner of the session lifecycle. The access token lives only in
 * this module (never persisted); a page reload recovers it through the
 * httpOnly refresh cookie. All session teardown funnels through
 * `endSession`, so token, team selection, query cache, and auth state can
 * never go out of sync.
 */

let accessToken: string | null = null;
let refreshInflight: Promise<string | null> | null = null;

// One-time purge of the legacy persisted auth state.
localStorage.removeItem("optikk_auth_state");

/** One team per user: the backend returns exactly one `team`. */
function toTeam(payload: SessionPayload): Team {
  const { id, name, orgName } = payload.team;
  return { id, name, orgName: orgName ?? null };
}

function toUser(payload: SessionPayload): User {
  const { id, email, name, avatarUrl } = payload.user;
  return { id, email, name, avatarUrl };
}

function beginSession(payload: SessionPayload): void {
  accessToken = payload.accessToken;
  const team = toTeam(payload);
  useAppStore.getState().setSelectedTeamId(team.id);
  useAuthStore.getState().setSession(toUser(payload), team);
}

function endSession(): void {
  accessToken = null;
  useAppStore.getState().setSelectedTeamId(null);
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

  /** Throws `AuthApiError` with a user-facing message on failure. */
  async login(email: string, password: string): Promise<void> {
    beginSession(await authApi.login(email, password));
  },

  /** Best-effort server logout; local teardown always runs. */
  async logout(): Promise<void> {
    try {
      await authApi.logout(accessToken);
    } catch {
      // Cookie may already be gone; local teardown is what matters.
    }
    endSession();
  },

  /**
   * Single-flight refresh: concurrent 401s and the route guard share one
   * request. Failure tears the session down and resolves null.
   */
  refreshAccessToken(): Promise<string | null> {
    // Known logged-out (e.g. logout raced an in-flight request): don't
    // resurrect the session with a pointless refresh attempt.
    if (useAuthStore.getState().status === "unauthenticated") {
      return Promise.resolve(null);
    }
    refreshInflight ??= doRefresh().finally(() => {
      refreshInflight = null;
    });
    return refreshInflight;
  },

  /** Route-guard entry point: true if a usable session exists or was recovered. */
  async ensureSession(): Promise<boolean> {
    if (accessToken != null) {
      return true;
    }
    return (await this.refreshAccessToken()) != null;
  },
};
