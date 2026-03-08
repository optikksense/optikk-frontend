import type { Team, User } from '@/types';

import { safeGet, safeGetJSON, safeRemove, safeSet } from '@shared/utils/storage';

import { STORAGE_KEYS } from '@config/constants';

export /**
 *
 */
const AUTH_PRESENT_KEY = 'optic_auth_present';

/**
 *
 */
export function setAuthPresentFlag(): void {
  safeSet(AUTH_PRESENT_KEY, '1');
}

/**
 *
 */
export function clearAuthPresentFlag(): void {
  safeRemove(AUTH_PRESENT_KEY);
}

/**
 *
 */
export function isAuthPresent(): boolean {
  return safeGet(AUTH_PRESENT_KEY) === '1';
}

/**
 *
 */
export function getStoredToken(): string | null {
  return safeGet(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 *
 */
export function setStoredToken(token: string): void {
  safeSet(STORAGE_KEYS.AUTH_TOKEN, token);
}

/**
 *
 */
export function clearStoredToken(): void {
  safeRemove(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 *
 */
export function getStoredUser(): User | null {
  return safeGetJSON<User>(STORAGE_KEYS.USER_DATA, null);
}

/**
 *
 */
export function setStoredUser(user: User): void {
  safeSet(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
}

/**
 *
 */
export function clearStoredUser(): void {
  safeRemove(STORAGE_KEYS.USER_DATA);
}

/**
 *
 */
export function getStoredTeamId(): number | null {
  const rawValue = safeGet(STORAGE_KEYS.TEAM_ID);
  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

/**
 *
 */
export function setStoredTeamId(teamId: number): void {
  safeSet(STORAGE_KEYS.TEAM_ID, String(teamId));
}

/**
 *
 */
export function getStoredTeamIds(): number[] {
  const rawValue = safeGet(STORAGE_KEYS.TEAM_IDS);
  if (!rawValue) {
    return [];
  }
  return rawValue
    .split(',')
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
}

/**
 *
 */
export function setStoredTeamIds(teamIds: number[]): void {
  safeSet(STORAGE_KEYS.TEAM_IDS, teamIds.join(','));
}

/**
 *
 */
export function resolveTeamId(payload: {
  readonly currentTeam?: Team;
  readonly teams?: Team[];
  readonly user?: User;
}): number | null {
  return (
    payload.currentTeam?.id ||
    payload.teams?.[0]?.id ||
    payload.user?.teams?.[0]?.id ||
    null
  );
}

/**
 *
 */
export function clearAuthStorage(): void {
  clearAuthPresentFlag();
  clearStoredToken();
  clearStoredUser();
  safeRemove(STORAGE_KEYS.TEAM_ID);
}
