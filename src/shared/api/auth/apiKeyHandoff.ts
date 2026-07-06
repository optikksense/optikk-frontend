/**
 * Transient hand-off of the API key minted at signup to the Welcome page.
 * Never persisted — read once, then cleared. The key stays retrievable later
 * via Settings, so losing it on reload is intentional.
 */

let pendingApiKey: string | null = null;

export function stashSignupApiKey(key: string): void {
  pendingApiKey = key.length > 0 ? key : null;
}

export function takeSignupApiKey(): string | null {
  const key = pendingApiKey;
  pendingApiKey = null;
  return key;
}
