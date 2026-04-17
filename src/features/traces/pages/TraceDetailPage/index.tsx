import { GitBranch } from "lucide-react";

import { PageShell } from "@shared/components/ui";
import PageHeader from "@shared/components/ui/layout/PageHeader";

import "./TraceDetailPage.css";

import { TraceDetailBody } from "./components/TraceDetailBody";
import {
  TraceDetailEmptySpans,
  TraceDetailError,
  TraceDetailLoading,
} from "./components/TraceDetailEmptyStates";
import { TraceDetailHeaderActions } from "./components/TraceDetailHeaderActions";
import { TraceDetailLogs } from "./components/TraceDetailLogs";
import { useTraceDetailPage } from "./hooks/useTraceDetailPage";

export default function TraceDetailPage() {
  const { state, actions, bodyProps } = useTraceDetailPage();
  const { traceIdParam, data } = state;
  const { isPending: isLoading, isError, error } = data;

  return (
    <PageShell className="trace-page-fade-in min-h-[calc(100vh-64px)]">
      <PageHeader
        title={`Trace: ${traceIdParam}`}
        icon={<GitBranch size={24} />}
        breadcrumbs={[{ label: "Traces", path: "/traces" }, { label: traceIdParam }]}
        actions={
          <TraceDetailHeaderActions
            onOpenInLogs={actions.openInLogExplorer}
            onBack={actions.goBack}
          />
        }
      />

      {isLoading ? (
        <TraceDetailLoading />
      ) : isError ? (
        <TraceDetailError message={error?.message} />
      ) : (
        <>
          {data.spans.length === 0 ? (
            <TraceDetailEmptySpans hasLogs={data.traceLogs.length > 0} />
          ) : (
            <TraceDetailBody {...bodyProps} />
          )}
          <TraceDetailLogs
            traceLogs={data.traceLogs}
            traceLogsIsSpeculative={data.traceLogsIsSpeculative}
            logsLoading={data.logsLoading}
          />
        </>
      )}
    </PageShell>
  );
}
