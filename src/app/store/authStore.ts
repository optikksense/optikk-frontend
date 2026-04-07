import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Team, User } from '@/types';

import { authService } from '@shared/api/authService';
import type { AuthPayload, AuthTeam } from '@shared/api/auth/authService';

import { useAppStore } from '@store/appStore';

import { STORAGE_KEYS } from '@config/constants';

interface AuthState {
  readonly user: User | null;
  readonly tenant?: { features: string[] };
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  readonly logout: () => Promise<void>;
  readonly applyAuthPayload: (payload: unknown) => boolean;
  readonly clearSession: () => void;
  readonly clearError: () => void;
}

function asLoginPayload(value: unknown): AuthPayload | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as AuthPayload;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>;

    // Handle "hijacked" 500 responses where login succeeded but session storage failed
    const apiData = record.data as any;
    if (
      record.status === 500 &&
      apiData &&
      typeof apiData === 'object' &&
      (apiData.success === true || (apiData.data && apiData.data.user))
    ) {
      return 'Authentication succeeded, but the session could not be saved (Redis failure). Please contact your administrator.';
    }

    if (typeof record.message === 'string' && record.message.length > 0) {
      return record.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function extractTeamIds(payload: AuthPayload): number[] {
  const teams = payload.teams ?? (payload.currentTeam ? [payload.currentTeam] : []);
  return teams
    .map((team) => Number(team.id))
    .filter((teamId) => Number.isFinite(teamId) && teamId > 0);
}

function toStoredTeams(payload: AuthPayload): Team[] {
  const teams = payload.teams ?? (payload.currentTeam ? [payload.currentTeam] : []);
  return teams.map((team: AuthTeam) => ({
    id: Number(team.id),
    name: team.name,
    orgName: team.orgName,
  }));
}

function applyAuthPayloadToState(
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  payload: unknown
): boolean {
  const parsed = asLoginPayload(payload);
  if (!parsed?.user) {
    return false;
  }

  const userData: User = {
    ...parsed.user,
    teams: toStoredTeams(parsed),
  };
  const teamIds = extractTeamIds(parsed);

  if (teamIds.length > 0) {
    useAppStore.getState().setSelectedTeamIds(teamIds);
  } else {
    useAppStore.setState({ selectedTeamId: null, selectedTeamIds: [] });
  }

  set({
    user: userData,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });
  return true;
}

function clearSessionState(
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void
): void {
  useAppStore.setState({ selectedTeamId: null, selectedTeamIds: [] });
  set({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: { features: ['newTraceView'] },
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (
        email: string,
        password: string
      ): Promise<{ success: boolean; error?: string }> => {
        set({ isLoading: true, error: null });
        try {
          const payload = await authService.login(email, password);
          if (applyAuthPayloadToState(set, payload)) {
            return { success: true };
          }

          const message = 'Login failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        } catch (error: unknown) {
          const message = getErrorMessage(error, 'Login failed');
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      logout: async (): Promise<void> => {
        await authService.logout();
        clearSessionState(set);
      },

      applyAuthPayload: (payload: unknown): boolean => applyAuthPayloadToState(set, payload),

      clearSession: (): void => {
        clearSessionState(set);
      },

      clearError: (): void => { set({ error: null }); },
    }),
    {
      name: STORAGE_KEYS.AUTH_STATE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Computed selectors
export const useAuthUser = () => useAuthStore((s) => s.user);
export const useAuthTenant = () => useAuthStore((s) => s.tenant);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthIsLoading = () => useAuthStore((s) => s.isLoading);
export const useAuthError = () => useAuthStore((s) => s.error);
