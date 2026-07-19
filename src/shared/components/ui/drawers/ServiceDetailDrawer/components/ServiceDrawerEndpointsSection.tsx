import { memo, useMemo } from "react";

import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";

import { CompactTable } from "../CompactTable";
import type { Column, EndpointRow } from "../types";
import { formatEndpointLabel, formatEndpointMeta } from "../utils";

type Props = {
  isError: boolean;
  isLoading: boolean;
  endpointRows: (EndpointRow & { id: string })[];
};

function ServiceDrawerEndpointsSectionComponent({ isError, isLoading, endpointRows }: Props) {
  const columns = useMemo<Column<EndpointRow & { id: string }>[]>(
    () => [
      {
        key: "method",
        label: "Method",
        render: (row) => (
          <span className="font-medium text-foreground-secondary">{row.httpMethod || "—"}</span>
        ),
      },
      {
        key: "operation",
        label: "Endpoint Detail",
        render: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="break-all">{formatEndpointLabel(row)}</span>
            {formatEndpointMeta(row) ? (
              <span className="text-[11px] text-foreground-muted">{formatEndpointMeta(row)}</span>
            ) : null}
          </div>
        ),
      },
      {
        key: "requests",
        label: "Requests",
        align: "right",
        render: (row) => formatNumber(row.requestCount),
      },
      {
        key: "errors",
        label: "Err %",
        align: "right",
        render: (row) =>
          formatPercentage(
            Number(row.requestCount ?? 0) > 0
              ? (Number(row.errorCount ?? 0) * 100) / Number(row.requestCount ?? 0)
              : 0
          ),
      },
      {
        key: "avg",
        label: "Avg",
        align: "right",
        render: (row) => formatDuration(row.avgLatency),
      },
      {
        key: "latency",
        label: "p95",
        align: "right",
        render: (row) => formatDuration(row.p95Latency),
      },
    ],
    []
  );

  return (
    <DrawerSection
      title="Top Endpoints"
      action={<span className="text-[11.5px] text-[var(--fg-3)]">by throughput</span>}
    >
      {isError ? (
        <div className="text-[12px] text-foreground-muted">Endpoint breakdown is unavailable.</div>
      ) : isLoading ? (
        <div className="text-[12px] text-foreground-muted">Loading endpoints…</div>
      ) : (
        <CompactTable<EndpointRow & { id: string }>
          rows={endpointRows}
          emptyText="No endpoint activity for this service."
          columns={columns}
        />
      )}
    </DrawerSection>
  );
}

export const ServiceDrawerEndpointsSection = memo(ServiceDrawerEndpointsSectionComponent);
