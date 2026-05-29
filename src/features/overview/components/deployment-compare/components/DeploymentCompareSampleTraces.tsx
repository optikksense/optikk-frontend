import { useNavigate } from "@tanstack/react-router";
import { memo } from "react";

import type { DeploymentCompareResponse } from "@shared/api/deployments/deploymentsApi";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import type { TraceRecord } from "@entities/trace/model";
import { Badge, Card } from "@shared/components/primitives/ui";
import { formatDuration, formatRelativeTime } from "@shared/utils/formatters";

import { useSampleErrorTraces } from "../hooks/useSampleErrorTraces";

interface Props {
  readonly compare: DeploymentCompareResponse;
}

function TraceRow({ trace, onOpen }: { trace: TraceRecord; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 text-left transition-colors hover:border-[var(--color-primary-subtle-45)] hover:bg-[var(--bg-hover)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="error">{trace.http_status_code || trace.status_message || "ERROR"}</Badge>
          <span className="truncate font-medium text-[12px] text-[var(--text-primary)]">
            {trace.operation_name}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-[var(--text-muted)]">
          {trace.trace_id.slice(0, 12)} · {formatRelativeTime(trace.start_time)}
        </div>
      </div>
      <span className="shrink-0 text-[11px] text-[var(--text-secondary)]">
        {formatDuration(trace.duration_ms)}
      </span>
    </button>
  );
}

function DeploymentCompareSampleTracesComponent({ compare }: Props) {
  const navigate = useNavigate();
  const serviceName = compare.deployment.service_name;
  const { traces, loading } = useSampleErrorTraces(
    serviceName,
    compare.after_window.start_ms,
    compare.after_window.end_ms
  );

  if (loading && traces.length === 0) return null;
  if (traces.length === 0) return null;

  const open = (traceId: string) =>
    navigate(dynamicNavigateOptions(ROUTES.traceDetail.replace("$traceId", traceId)));

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="mb-3">
        <h3 className="m-0 font-semibold text-[var(--text-primary)]">Sample error traces</h3>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Error traces captured in the post-deploy window for {serviceName}.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {traces.map((trace) => (
          <TraceRow key={trace.span_id} trace={trace} onOpen={() => open(trace.trace_id)} />
        ))}
      </div>
    </Card>
  );
}

export const DeploymentCompareSampleTraces = memo(DeploymentCompareSampleTracesComponent);
