/**
 * Shared explorer API helpers. Domain APIs (logsExplorerApi, tracesExplorerApi)
 * compose these primitives so wire-format concerns (warnings array,
 * facet-group flattening, cursor semantics) live in one place.
 */

export interface ExplorerWarning {
  readonly code: string;
  readonly message: string;
}

export interface ExplorerQueryEnvelope<TResult> {
  readonly results: readonly TResult[];
  readonly cursor?: string;
  readonly warnings?: readonly ExplorerWarning[];
  readonly facets?: Record<string, Array<{ value: string; count: number }>>;
  readonly trend?: ReadonlyArray<Record<string, unknown>>;
  readonly summary?: Record<string, unknown>;
}

/** Flattens `warnings` from a response into a human-readable string list. */
export function warningMessages(warnings?: readonly ExplorerWarning[]): string[] {
  if (!warnings || warnings.length === 0) return [];
  return warnings.map((w) => w.message).filter(Boolean);
}

/** Stable query-key fragment for an include array (undefined / empty → null). */
export function stableIncludeKey(include?: readonly string[]): string | null {
  if (!include || include.length === 0) return null;
  return [...include].sort().join(",");
}

/** Base64-url-safe encode of a filter array for URL sharing. */
export function encodeFiltersToURL(filters: unknown): string {
  const json = JSON.stringify(filters ?? []);
  if (typeof btoa !== "function") {
    return encodeURIComponent(json);
  }
  return btoa(unescape(encodeURIComponent(json)));
}

/** Inverse of encodeFiltersToURL. Returns `null` on parse failure. */
export function decodeFiltersFromURL<T = unknown>(encoded: string | null): T | null {
  if (!encoded) return null;
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function" ? atob(padded) : decodeURIComponent(encoded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
