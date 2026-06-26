import { create } from "zustand";

import type { Team, User } from "@/types";

/**
 * Auth state only. Session lifecycle (login/logout/refresh) is owned by
 * `@shared/api/auth/session`; nothing here touches the network or storage.
 * Identity is never persisted — a reload rebuilds it from the refresh cookie.
 */

/** "unknown" = cold boot, recovery not attempted yet. */
export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  readonly status: AuthStatus;
  readonly user: User | null;
  readonly team: Team | null;
  readonly setSession: (user: User, team: Team | null) => void;
  readonly clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "unknown",
  user: null,
  team: null,

  setSession: (user: User, team: Team | null): void => {
    set({ status: "authenticated", user, team });
  },

  clearSession: (): void => {
    set({ status: "unauthenticated", user: null, team: null });
  },
}));

export const useAuthUser = () => useAuthStore((s) => s.user);
export const useAuthTeam = () => useAuthStore((s) => s.team);
export const useAuthStatus = () => useAuthStore((s) => s.status);
