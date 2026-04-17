import { memo, useMemo } from "react";

import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { CompactTable } from "../CompactTable";
import { DrawerSection } from "../DrawerSection";
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
          <span className="font-medium text-[var(--text-secondary)]">{row.http_method || "—"}</span>
        ),
      },
      {
        key: "operation",
        label: "Endpoint Detail",
        render: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="break-all">{formatEndpointLabel(row)}</span>
            {formatEndpointMeta(row) ? (
              <span className="text-[11px] text-[var(--text-muted)]">
                {formatEndpointMeta(row)}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "requests",
        label: "Requests",
        align: "right",
        render: (row) => formatNumber(row.request_count),
      },
      {
        key: "errors",
        label: "Err %",
        align: "right",
        render: (row) =>
          formatPercentage(
            Number(row.request_count ?? 0) > 0
              ? (Number(row.error_count ?? 0) * 100) / Number(row.request_count ?? 0)
              : 0
          ),
      },
      {
        key: "avg",
        label: "Avg",
        align: "right",
        render: (row) => formatDuration(row.avg_latency),
      },
      {
        key: "latency",
        label: "p95",
        align: "right",
        render: (row) => formatDuration(row.p95_latency),
      },
    ],
    []
  );

  return (
    <div id="service-drawer-endpoints" className="scroll-mt-24">
      <DrawerSection
        title="Top Endpoints"
        subtitle="Most active endpoints for this service in the current window."
      >
        {isError ? (
          <div className="text-[12px] text-[var(--text-muted)]">
            Endpoint breakdown is unavailable.
          </div>
        ) : isLoading ? (
          <div className="text-[12px] text-[var(--text-muted)]">Loading endpoints…</div>
        ) : (
          <CompactTable<EndpointRow & { id: string }>
            rows={endpointRows}
            emptyText="No endpoint activity for this service."
            columns={columns}
          />
        )}
      </DrawerSection>
    </div>
  );
}

export const ServiceDrawerEndpointsSection = memo(ServiceDrawerEndpointsSectionComponent);
