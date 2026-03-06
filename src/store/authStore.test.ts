import { afterEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/types';

const authServiceMock = {
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
};

const appStoreMock = {
  setSelectedTeamId: vi.fn(),
  setState: vi.fn(),
};

async function loadStore({
  currentUser = null,
  isAuthenticated = false,
}: {
  currentUser?: User | null;
  isAuthenticated?: boolean;
} = {}): Promise<typeof import('./authStore').useAuthStore> {
  authServiceMock.getCurrentUser.mockReturnValue(currentUser);
  authServiceMock.isAuthenticated.mockReturnValue(isAuthenticated);

  vi.resetModules();
  vi.doMock('@services/authService', () => ({
    authService: authServiceMock,
  }));
  vi.doMock('@store/appStore', () => ({
    useAppStore: {
      getState: () => appStoreMock,
      setState: appStoreMock.setState,
    },
  }));

  const module = await import('./authStore');
  return module.useAuthStore;
}

describe('authStore', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('hydrates initial auth state from the auth service', async () => {
    const user = { id: 1, email: 'engineer@example.com' };
    const useAuthStore = await loadStore({ currentUser: user, isAuthenticated: true });

    expect(useAuthStore.getState()).toMatchObject({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  });

  it('logs in successfully and merges team data', async () => {
    const useAuthStore = await loadStore();
    authServiceMock.login.mockResolvedValue({
      token: 'token-1',
      user: { id: 7, email: 'engineer@example.com' },
      teams: [{ id: 12, name: 'Platform' }],
    });

    await expect(useAuthStore.getState().login('engineer@example.com', 'secret')).resolves.toEqual({
      success: true,
    });

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: {
        id: 7,
        email: 'engineer@example.com',
        teams: [{ id: 12, name: 'Platform' }],
      },
    });
    expect(appStoreMock.setSelectedTeamId).toHaveBeenCalledWith(12);
  });

  it('stores an error when the login payload is incomplete', async () => {
    const useAuthStore = await loadStore();
    authServiceMock.login.mockResolvedValue({ user: { id: 1 } });

    await expect(useAuthStore.getState().login('bad@example.com', 'secret')).resolves.toEqual({
      success: false,
      error: 'Login failed',
    });

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isLoading: false,
      error: 'Login failed',
    });
  });

  it('surfaces login exceptions from the auth service', async () => {
    const useAuthStore = await loadStore();
    authServiceMock.login.mockRejectedValue(new Error('Invalid credentials'));

    await expect(useAuthStore.getState().login('bad@example.com', 'secret')).resolves.toEqual({
      success: false,
      error: 'Invalid credentials',
    });

    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      isLoading: false,
      error: 'Invalid credentials',
    });
  });

  it('logs out and clears auth state', async () => {
    const useAuthStore = await loadStore({
      currentUser: { id: 1, email: 'engineer@example.com' },
      isAuthenticated: true,
    });

    authServiceMock.logout.mockResolvedValue(undefined);

    await useAuthStore.getState().logout();

    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(appStoreMock.setState).toHaveBeenCalledWith({ selectedTeamId: null });
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });
});
