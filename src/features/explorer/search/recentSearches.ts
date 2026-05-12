import type { ExplorerScope } from "../types/filters";

const STORAGE_PREFIX = "optikk:";
const STORAGE_VERSION = "v1";
const CAP = 8;

export interface RecentSearch {
  readonly q: string;
  readonly ts: number;
}

interface Stored {
  readonly items: RecentSearch[];
}

function key(scope: ExplorerScope): string {
  return `${STORAGE_PREFIX}${scope}:recent-searches:${STORAGE_VERSION}`;
}

export function getRecent(scope: ExplorerScope): readonly RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(scope));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Stored;
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export function pushRecent(scope: ExplorerScope, q: string): void {
  if (typeof window === "undefined") return;
  const trimmed = q.trim();
  if (trimmed === "") return;
  const current = getRecent(scope);
  const deduped = current.filter((r) => r.q !== trimmed);
  const next: Stored = {
    items: [{ q: trimmed, ts: Date.now() }, ...deduped].slice(0, CAP),
  };
  try {
    window.localStorage.setItem(key(scope), JSON.stringify(next));
  } catch {
    // Quota exceeded or storage disabled — silent no-op.
  }
}

export function clearRecent(scope: ExplorerScope): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(scope));
  } catch {
    // ignore
  }
}
