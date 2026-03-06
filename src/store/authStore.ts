import { create } from 'zustand';

import type { Team, User } from '@/types';

import { authService } from '@services/authService';

import { useAppStore } from '@store/appStore';

interface AuthState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  readonly logout: () => Promise<void>;
  readonly clearError: () => void;
}

interface LoginPayload {
  readonly token?: string;
  readonly user?: User;
  readonly teams?: Team[];
  readonly currentTeam?: Team;
}

interface QueryClientLike {
  clear: () => void;
}

function asLoginPayload(value: unknown): LoginPayload | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  // Login payloads are dynamic server objects with optional team metadata.
  return value as LoginPayload;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.length > 0) {
      return record.message;
    }
  }
  return fallback;
}

async function clearQueryClientCache(): Promise<void> {
  try {
    const moduleRef = await import('../main');
    if (!('queryClient' in moduleRef)) {
      return;
    }

    // Runtime import type is unknown to TS here; narrow to the optional queryClient shape.
    const queryClient = (moduleRef as { queryClient?: QueryClientLike }).queryClient;
    if (queryClient?.clear) {
      queryClient.clear();
    }
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('Unable to clear query cache after logout', error);
    }
  }
}

/**
 * Authentication store for user session state and auth actions.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    set({ isLoading: true, error: null });
    try {
      const payload = asLoginPayload(await authService.login(email, password));
      if (payload?.token && payload.user) {
        const userData: User = {
          ...payload.user,
          teams: payload.teams || payload.user.teams || [],
        };
        const teamId =
          payload.currentTeam?.id ??
          payload.teams?.[0]?.id ??
          payload.user.teams?.[0]?.id ??
          null;

        if (teamId != null) {
          useAppStore.getState().setSelectedTeamId(teamId);
        }

        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
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
    useAppStore.setState({ selectedTeamId: null });
    // Intentionally fire-and-forget cache clearing after local auth state reset.
    void clearQueryClientCache();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: (): void => set({ error: null }),
}));
