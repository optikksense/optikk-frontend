/**
 * Canonical routes for the traces explorer. The legacy `/traces` redirect
 * and `/traces/$traceId` (TraceDetailPage) route are registered by the
 * wiring agent in `src/app/routes/router.tsx`.
 */
export const TRACES_ROUTES = {
  tracesExplorer: "/traces/explorer",
  traceDetail: "/traces/$traceId",
} as const;

export type TracesRoutePath = (typeof TRACES_ROUTES)[keyof typeof TRACES_ROUTES];

export function traceDetailPath(traceId: string): string {
  return `/traces/${encodeURIComponent(traceId)}`;
}
