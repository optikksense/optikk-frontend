import { ErrorTrackingContent } from "@shared/errors/ErrorTrackingContent";

/**
 * Service-scoped Errors tab: the same Error Tracking body (KPI strip + issues
 * table + pager) as the standalone page, locked to this service.
 */
export function ErrorsTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ErrorTrackingContent lockedService={serviceName} />
    </div>
  );
}
