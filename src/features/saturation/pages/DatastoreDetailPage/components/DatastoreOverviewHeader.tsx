import { memo } from "react";

import { formatPercentage } from "@shared/utils/formatters";

import type { DatastoreOverview } from "../../../api/saturationApi";

function DatastoreOverviewHeaderComponent({ overview }: { overview?: DatastoreOverview }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="text-[11px] text-foreground-muted uppercase tracking-[0.08em]">
          Overview
        </div>
        <h2 className="mt-2 font-semibold text-[20px] text-foreground">
          Top collections and primary endpoint
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] text-foreground-secondary leading-6">
          Use this system page to follow the highest-latency collections, the dominant server
          endpoint, and the most likely contention sources.
        </p>
      </div>
      <div className="rounded-[var(--card-radius)] border border-border bg-[var(--bg-2)] px-4 py-3 text-[12px] text-foreground-secondary">
        <div className="font-medium text-foreground">Primary endpoint</div>
        <div className="mt-1">{overview?.top_server || "No server address detected"}</div>
        <div className="mt-2">
          Cache hit rate{" "}
          {overview?.cache_hit_rate != null ? formatPercentage(overview.cache_hit_rate) : "n/a"}
        </div>
      </div>
    </div>
  );
}

export const DatastoreOverviewHeader = memo(DatastoreOverviewHeaderComponent);
