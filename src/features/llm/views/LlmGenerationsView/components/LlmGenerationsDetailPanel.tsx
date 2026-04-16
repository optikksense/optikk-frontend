import { memo } from "react";

import { Button } from "@/components/ui";
import { type DetailPanelField, ObservabilityDetailPanel } from "@shared/components/ui";
import { ROUTES } from "@shared/constants/routes";
import { buildLogsHubHref, traceIdEqualsFilter } from "@shared/observability/deepLinks";
import {
  formatDuration,
  formatNumber,
  formatRelativeTime,
  formatTimestamp,
} from "@shared/utils/formatters";
import { useNavigate } from "@tanstack/react-router";

import type { LlmGenerationRecord } from "../../../types";
import { formatCost } from "../../../utils/costCalculator";
import { renderProviderBadge, renderStatus } from "../generationBadges";

type Props = {
  generation: LlmGenerationRecord;
  detailFields: DetailPanelField[];
  startTime: number;
  endTime: number;
  onClose: () => void;
};

function LlmGenerationsDetailPanelComponent({
  generation,
  detailFields,
  startTime,
  endTime,
  onClose,
}: Props) {
  const navigate = useNavigate();

  return (
    <ObservabilityDetailPanel
      title="Generation detail"
      titleBadge={renderStatus(generation.status)}
      metaLine={formatTimestamp(generation.start_time)}
      metaRight={formatRelativeTime(generation.start_time)}
      summaryNode={
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {renderProviderBadge(generation.ai_system)}
            <span className="font-mono font-semibold text-[var(--text-primary)] text-sm">
              {generation.ai_request_model || "Unknown model"}
            </span>
          </div>
          <div className="text-[var(--text-secondary)] text-xs">
            {generation.service_name} &middot; {formatDuration(generation.duration_ms)}
            {generation.total_tokens > 0
              ? ` \u00b7 ${formatNumber(generation.total_tokens)} tokens`
              : ""}
            {generation.estimated_cost > 0
              ? ` \u00b7 ${formatCost(generation.estimated_cost)}`
              : ""}
          </div>
        </div>
      }
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void navigate({
                to: ROUTES.traceDetail.replace("$traceId", generation.trace_id) as never,
              });
            }}
          >
            View full trace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void navigate({
                to: buildLogsHubHref({
                  filters: [traceIdEqualsFilter(generation.trace_id)],
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
      rawData={generation}
      onClose={onClose}
    />
  );
}

export const LlmGenerationsDetailPanel = memo(LlmGenerationsDetailPanelComponent);
