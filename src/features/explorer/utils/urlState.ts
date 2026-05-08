import type { ExplorerFilter, ExplorerMode } from "../types/filters";

/**
 * Base64-encodes a JSON-serializable value for URL transport.
 * Uses URL-safe encoding so query strings survive copy/paste.
 */
export function encodeBase64(value: unknown): string {
  const raw = JSON.stringify(value ?? []);
  return encodeURIComponent(btoa(unescape(encodeURIComponent(raw))));
}

export function decodeBase64<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const decoded = decodeURIComponent(raw);
    const json = decodeURIComponent(escape(atob(decoded)));
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function encodeFilters(filters: readonly ExplorerFilter[]): string {
  return encodeBase64(filters);
}

export function decodeFilters(raw: string | null | undefined): ExplorerFilter[] {
  return decodeBase64<ExplorerFilter[]>(raw, []);
}

export function parseMode(_raw: string | null | undefined): ExplorerMode {
  return "list";
}

export function serializeStateSnapshot(value: unknown): string {
  return encodeBase64(value);
}

export function deserializeStateSnapshot<T>(raw: string | null | undefined, fallback: T): T {
  return decodeBase64(raw, fallback);
}
