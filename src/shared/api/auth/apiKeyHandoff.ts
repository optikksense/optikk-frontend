/**
 * Transient hand-off of the API key minted at signup to the Welcome page.
 * Never persisted — read once, then cleared. Keys are stored hashed
 * server-side, so a missed key cannot be re-displayed; the user must
 * regenerate one in Settings → Tenant.
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
