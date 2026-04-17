import { memo } from "react";

import { Button } from "@/components/ui";
import { type DetailPanelField, ObservabilityDetailPanel } from "@shared/components/ui";
import { traceDetailHref } from "@shared/observability/deepLinks";
import { formatRelativeTime } from "@shared/utils/formatters";
import { tsLabel } from "@shared/utils/time";
import { useNavigate } from "@tanstack/react-router";

import { LevelBadge } from "../../../components/log/LogRow";
import type { LogRecord } from "../../../types";
import { toDisplayText } from "../../../utils/logUtils";

type Props = {
  log: LogRecord;
  detailFields: DetailPanelField[];
  onClose: () => void;
};

function LogsHubLogDetailPanelComponent({ log, detailFields, onClose }: Props) {
  const navigate = useNavigate();

  return (
    <ObservabilityDetailPanel
      title="Log Detail"
      titleBadge={<LevelBadge level={String(log.level ?? log.severity_text)} />}
      metaLine={tsLabel(log.timestamp)}
      metaRight={formatRelativeTime(log.timestamp)}
      summaryNode={
        <div className="text-[12px] text-[var(--text-primary)] leading-6">
          {toDisplayText(log.body ?? log.message)}
        </div>
      }
      actions={
        log.trace_id || log.traceId ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const id = log.trace_id || log.traceId || "";
              navigate({ to: traceDetailHref(id) as never });
            }}
          >
            Open Trace
          </Button>
        ) : null
      }
      fields={detailFields}
      rawData={log}
      onClose={onClose}
    />
  );
}

export const LogsHubLogDetailPanel = memo(LogsHubLogDetailPanelComponent);
