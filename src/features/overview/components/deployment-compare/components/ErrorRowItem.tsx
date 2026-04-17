import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Badge } from "@shared/components/primitives/ui";
import { formatNumber } from "@shared/utils/formatters";

import { DeltaPill } from "./DeltaPill";

type ErrorRow = DeploymentCompareResponse["top_errors"][number];

function severityVariant(severity: string): "error" | "warning" | "default" {
  if (severity === "critical") return "error";
  if (severity === "warning") return "warning";
  return "default";
}

function ErrorRowItemComponent({ row }: { row: ErrorRow }) {
  return (
    <div className="rounded-[var(--card-radius)] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={severityVariant(row.severity)}>{row.http_status_code || "error"}</Badge>
        <DeltaPill delta={row.delta_count} formatter={formatNumber} />
      </div>
      <div className="mt-2 font-medium text-[var(--text-primary)]">
        {row.status_message || row.operation_name || "Unhandled error"}
      </div>
      <div className="mt-1 text-[12px] text-[var(--text-secondary)]">
        {row.operation_name} • before {formatNumber(row.before_count)} • after{" "}
        {formatNumber(row.after_count)}
      </div>
      {row.sample_trace_id ? (
        <div className="mt-1 text-[11px] text-[var(--text-muted)]">
          sample trace {row.sample_trace_id.slice(0, 12)}
        </div>
      ) : null}
    </div>
  );
}

export const ErrorRowItem = memo(ErrorRowItemComponent);
