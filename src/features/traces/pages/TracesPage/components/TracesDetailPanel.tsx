import { memo } from "react";

import { Button } from "@/components/ui";
import { resolveTimeRangeBounds } from "@/types";
import { useTimeRange } from "@app/store/appStore";
import { type DetailPanelField, ObservabilityDetailPanel } from "@shared/components/ui";
import { buildLogsHubHref, traceIdEqualsFilter } from "@shared/observability/deepLinks";
import { formatDuration, formatRelativeTime, formatTimestamp } from "@shared/utils/formatters";
import { useNavigate } from "@tanstack/react-router";

import type { TraceRecord } from "../../../types";
import { renderTraceStatus } from "../traceStatusBadge";

type Props = {
  trace: TraceRecord;
  detailFields: DetailPanelField[];
  onClose: () => void;
};

function TracesDetailPanelComponent({ trace, detailFields, onClose }: Props) {
  const navigate = useNavigate();
  const timeRange = useTimeRange();

  return (
    <ObservabilityDetailPanel
      title="Trace Detail"
      titleBadge={renderTraceStatus(trace.status)}
      metaLine={formatTimestamp(trace.start_time)}
      metaRight={formatRelativeTime(trace.start_time)}
      summaryNode={
        <div className="space-y-1">
          <div className="font-semibold text-[var(--text-primary)] text-sm">
            {trace.operation_name}
          </div>
          <div className="text-[var(--text-secondary)] text-xs">
            {trace.service_name} • {formatDuration(trace.duration_ms)}
          </div>
        </div>
      }
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate({ to: `/traces/${trace.trace_id}` })}
          >
            View full trace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
              navigate({
                to: buildLogsHubHref({
                  filters: [traceIdEqualsFilter(trace.trace_id)],
                  fromMs: startTime,
                  toMs: endTime,
                }) as never,
              });
            }}
          >
            Related logs
          </Button>
        </>
      }
      fields={detailFields}
      rawData={trace}
      onClose={onClose}
    />
  );
}

export const TracesDetailPanel = memo(TracesDetailPanelComponent);
