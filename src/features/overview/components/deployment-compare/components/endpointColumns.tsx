import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import type { SimpleTableColumn } from "@shared/components/primitives/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { DeltaPill } from "./DeltaPill";

export type EndpointRow = DeploymentCompareResponse["top_endpoints"][number];

function EndpointCell({ row }: { row: EndpointRow }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium text-[var(--text-primary)]">
        {row.endpoint_name || row.operation_name}
      </span>
      <span className="text-[11px] text-[var(--text-muted)]">
        {row.http_method || "—"} • span {row.operation_name}
      </span>
    </div>
  );
}

export const ENDPOINT_COLUMNS: SimpleTableColumn<EndpointRow>[] = [
  {
    title: "Endpoint",
    key: "endpoint",
    width: 320,
    render: (_v, row) => <EndpointCell row={row} />,
  },
  {
    title: "p95 Δ",
    key: "p95_delta_ms",
    align: "right",
    width: 120,
    render: (_v, row) => <DeltaPill delta={row.p95_delta_ms} formatter={formatDuration} />,
  },
  {
    title: "Err Δ",
    key: "error_rate_delta",
    align: "right",
    width: 120,
    render: (_v, row) => <DeltaPill delta={row.error_rate_delta} formatter={formatPercentage} />,
  },
  {
    title: "Requests",
    key: "requests",
    align: "right",
    width: 110,
    render: (_v, row) => formatNumber(row.after_requests),
  },
  {
    title: "Score",
    key: "regression_score",
    align: "right",
    width: 110,
    render: (_v, row) => row.regression_score.toFixed(1),
  },
];
