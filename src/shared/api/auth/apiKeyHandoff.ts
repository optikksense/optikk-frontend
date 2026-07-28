/**
 * Hands the signup-time API key from the auth flow to the welcome page.
 * Backed by sessionStorage so a refresh of /welcome cannot lose the only
 * copy of the key; cleared when onboarding finishes or the session ends.
 */

const STORAGE_KEY = "optikk.signup-api-key";

export function stashSignupApiKey(key: string): void {
  if (key.length === 0) {
    clearSignupApiKey();
    return;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Storage unavailable (private mode); the key is simply not handed off.
  }
}

export function takeSignupApiKey(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearSignupApiKey(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
