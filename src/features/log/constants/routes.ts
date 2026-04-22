/**
 * Canonical routes for the logs explorer. The legacy `/logs` redirect is
 * owned by the wiring agent in `src/app/routes/router.tsx`; this file only
 * declares the path constants so feature code imports them by name.
 */
export const LOGS_ROUTES = {
  logsExplorer: "/logs/explorer",
} as const;

export type LogsRoutePath = (typeof LOGS_ROUTES)[keyof typeof LOGS_ROUTES];
