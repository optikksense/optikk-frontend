import { memo } from "react";

import { formatDuration, formatNumber } from "@shared/utils/formatters";

import { CompactTable } from "../CompactTable";
import { DrawerSection } from "../DrawerSection";
import type { Column, DependencyRow } from "../types";

const DEPENDENCY_COLUMNS: Column<DependencyRow>[] = [
  {
    key: "service",
    label: "Service",
    render: (row) => row.serviceName || "Unknown",
  },
  {
    key: "calls",
    label: "Calls",
    align: "right",
    render: (row) => formatNumber(row.callCount),
  },
  {
    key: "latency",
    label: "p95",
    align: "right",
    render: (row) => formatDuration(row.p95LatencyMs),
  },
];

type Props = {
  isError: boolean;
  isLoading: boolean;
  upstreamRows: DependencyRow[];
  downstreamRows: DependencyRow[];
};

function ServiceDrawerDependenciesSectionComponent({
  isError,
  isLoading,
  upstreamRows,
  downstreamRows,
}: Props) {
  return (
    <div id="service-drawer-dependencies" className="scroll-mt-24">
      <DrawerSection
        title="Dependencies"
        subtitle="Top upstream and downstream relationships for this service."
      >
        {isError ? (
          <div className="text-[12px] text-[var(--text-muted)]">Dependency map is unavailable.</div>
        ) : isLoading ? (
          <div className="text-[12px] text-[var(--text-muted)]">Loading dependencies…</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 font-medium text-[12px] text-[var(--text-secondary)]">
                Upstream
              </div>
              <CompactTable
                rows={upstreamRows}
                emptyText="No upstream callers in range."
                columns={DEPENDENCY_COLUMNS}
              />
            </div>
            <div>
              <div className="mb-2 font-medium text-[12px] text-[var(--text-secondary)]">
                Downstream
              </div>
              <CompactTable
                rows={downstreamRows}
                emptyText="No downstream dependencies in range."
                columns={DEPENDENCY_COLUMNS}
              />
            </div>
          </div>
        )}
      </DrawerSection>
    </div>
  );
}

export const ServiceDrawerDependenciesSection = memo(ServiceDrawerDependenciesSectionComponent);
