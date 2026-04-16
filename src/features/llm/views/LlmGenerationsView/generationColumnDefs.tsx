import { Badge, Button } from "@/components/ui";
import type { SimpleTableColumn } from "@/components/ui";
import { traceDetailHref } from "@shared/observability/deepLinks";
import {
  formatDuration,
  formatNumber,
  formatRelativeTime,
  formatTimestamp,
} from "@shared/utils/formatters";
import type { useNavigate } from "@tanstack/react-router";

import type { LlmGenerationRecord } from "../../types";
import { formatCost } from "../../utils/costCalculator";
import { renderProviderBadge, renderStatus } from "./generationBadges";

export type GenerationNavigate = ReturnType<typeof useNavigate>;

function buildTimeColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Time",
    key: "start_time",
    dataIndex: "start_time",
    width: 160,
    sorter: (a, b) =>
      new Date(String(a.start_time)).getTime() - new Date(String(b.start_time)).getTime(),
    defaultSortOrder: "descend",
    render: (value) => (
      <div className="space-y-1">
        <div className="text-[12px] text-[var(--text-primary)]">
          {formatTimestamp(String(value))}
        </div>
        <div className="text-[11px] text-[var(--text-muted)]">
          {formatRelativeTime(String(value))}
        </div>
      </div>
    ),
  };
}

function buildProviderColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Provider",
    key: "ai_system",
    dataIndex: "ai_system",
    width: 100,
    sorter: (a, b) => a.ai_system.localeCompare(b.ai_system),
    render: (value) => renderProviderBadge(String(value)),
  };
}

function buildModelColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Model",
    key: "ai_request_model",
    dataIndex: "ai_request_model",
    width: 170,
    ellipsis: true,
    sorter: (a, b) => a.ai_request_model.localeCompare(b.ai_request_model),
    render: (value) => (
      <span className="font-mono text-[11px] text-[var(--text-primary)]">
        {String(value || "—")}
      </span>
    ),
  };
}

function buildOperationColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Operation",
    key: "ai_operation",
    dataIndex: "ai_operation",
    width: 110,
    render: (value) =>
      value ? (
        <Badge variant="default" className="text-[10px]">
          {String(value)}
        </Badge>
      ) : (
        <span className="text-[var(--text-muted)]">—</span>
      ),
  };
}

function buildServiceColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Service",
    key: "service_name",
    dataIndex: "service_name",
    width: 140,
    ellipsis: true,
    sorter: (a, b) => a.service_name.localeCompare(b.service_name),
    render: (value) => (
      <span className="font-medium text-[12.5px] text-[var(--text-primary)]">
        {String(value || "Unknown")}
      </span>
    ),
  };
}

function buildStatusColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Status",
    key: "status",
    dataIndex: "status",
    width: 90,
    sorter: (a, b) => a.status.localeCompare(b.status),
    render: (value) => renderStatus(String(value)),
  };
}

function buildTraceColumn(navigate: GenerationNavigate): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Trace",
    key: "trace_open",
    width: 82,
    render: (_, row) => (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 font-medium text-[11px] text-[var(--color-primary)]"
        onClick={(e) => {
          e.stopPropagation();
          void navigate({ to: traceDetailHref(row.trace_id) });
        }}
      >
        Open
      </Button>
    ),
  };
}

function buildLatencyColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Latency",
    key: "duration_ms",
    dataIndex: "duration_ms",
    width: 100,
    sorter: (a, b) => a.duration_ms - b.duration_ms,
    render: (value) => (
      <span className="font-medium text-[var(--text-primary)]">
        {formatDuration(Number(value ?? 0))}
      </span>
    ),
  };
}

function buildTokensInColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Tokens In",
    key: "input_tokens",
    dataIndex: "input_tokens",
    width: 90,
    sorter: (a, b) => a.input_tokens - b.input_tokens,
    render: (value) => (
      <span className="text-[12px] text-[var(--text-secondary)]">
        {Number(value) > 0 ? formatNumber(Number(value)) : "—"}
      </span>
    ),
  };
}

function buildTokensOutColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Tokens Out",
    key: "output_tokens",
    dataIndex: "output_tokens",
    width: 90,
    sorter: (a, b) => a.output_tokens - b.output_tokens,
    render: (value) => (
      <span className="text-[12px] text-[var(--text-secondary)]">
        {Number(value) > 0 ? formatNumber(Number(value)) : "—"}
      </span>
    ),
  };
}

function buildCostColumn(): SimpleTableColumn<LlmGenerationRecord> {
  return {
    title: "Est. Cost",
    key: "estimated_cost",
    dataIndex: "estimated_cost",
    width: 90,
    sorter: (a, b) => a.estimated_cost - b.estimated_cost,
    render: (value) => (
      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
        {Number(value) > 0 ? formatCost(Number(value)) : "—"}
      </span>
    ),
  };
}

export function buildGenerationColumns(
  navigate: GenerationNavigate
): SimpleTableColumn<LlmGenerationRecord>[] {
  return [
    buildTimeColumn(),
    buildProviderColumn(),
    buildModelColumn(),
    buildOperationColumn(),
    buildServiceColumn(),
    buildStatusColumn(),
    buildTraceColumn(navigate),
    buildLatencyColumn(),
    buildTokensInColumn(),
    buildTokensOutColumn(),
    buildCostColumn(),
  ];
}
