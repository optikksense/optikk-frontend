import type { TimeRange } from "@/types";

/** Browsers and gateways differ; stay under typical limits and fall back to JSON export. */
export const MAX_SHAREABLE_URL_CHARS = 2000;

export const SHAREABLE_VIEW_VERSION = 1 as const;

export type ShareableViewKind = "logs" | "infrastructure";

export interface ShareableViewSnapshot {
  readonly v: typeof SHAREABLE_VIEW_VERSION;
  readonly kind: ShareableViewKind;
  /** Path without origin, e.g. `/logs` or `/infrastructure`. */
  readonly path: string;
  /** Raw query string without leading `?`. */
  readonly query: string;
  /** Global time range from the app store (restorable via `setTimeRange`). */
  readonly timeRange: TimeRange;
}

export function buildShareableSnapshot(
  kind: ShareableViewKind,
  path: string,
  search: string,
  timeRange: TimeRange
): ShareableViewSnapshot {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return {
    v: SHAREABLE_VIEW_VERSION,
    kind,
    path: path.startsWith("/") ? path : `/${path}`,
    query,
    timeRange,
  };
}

export function snapshotToJson(snapshot: ShareableViewSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Copies `href` when short enough; otherwise copies a JSON snapshot and returns `false`.
 */
export async function copyUrlOrSnapshotJson(
  href: string,
  snapshot: ShareableViewSnapshot
): Promise<{ mode: "url" | "json" }> {
  if (href.length <= MAX_SHAREABLE_URL_CHARS) {
    await navigator.clipboard.writeText(href);
    return { mode: "url" };
  }
  await navigator.clipboard.writeText(snapshotToJson(snapshot));
  return { mode: "json" };
}
