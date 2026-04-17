import { memo } from "react";

import { PageSurface } from "@shared/components/ui";

import { LogsBody } from "./logs/LogsBody";
import { LogsHeader } from "./logs/LogsHeader";

interface Props {
  traceLogs: Array<Record<string, unknown> & { timestamp?: string | number; service_name?: string }>;
  traceLogsIsSpeculative: boolean;
  logsLoading: boolean;
}

function TraceDetailLogsComponent({ traceLogs, traceLogsIsSpeculative, logsLoading }: Props) {
  return (
    <PageSurface className="space-y-4">
      <LogsHeader count={traceLogs.length} isSpeculative={traceLogsIsSpeculative} />
      {traceLogsIsSpeculative ? (
        <p className="text-[var(--text-secondary)] text-sm">
          These logs were matched from surrounding service and time context because an exact
          trace-linked set was not available.
        </p>
      ) : null}
      <LogsBody logs={traceLogs} loading={logsLoading} />
    </PageSurface>
  );
}

export const TraceDetailLogs = memo(TraceDetailLogsComponent);
