import { Card } from "@shared/components/primitives/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber, formatPercentage } from "@shared/utils/formatters";

import { infraGet } from "../api/infrastructureApi";
import type { LoadAverageResult, MetricValue } from "../types";

export function InfraLoadAverageCard() {
  const q = useTimeRangeQuery<LoadAverageResult>("infra-load-avg", async (teamId, start, end) => {
    if (!teamId) return { load_1m: 0, load_5m: 0, load_15m: 0 };
    return infraGet<LoadAverageResult>(
      "/v1/infrastructure/cpu/load-average",
      teamId,
      Number(start),
      Number(end)
    );
  });
  const d = q.data;
  return (
    <Card padding="md" className="border-[var(--border-color)]">
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        Load average
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] text-[var(--text-muted)]">1m</div>
          <div className="font-semibold text-[var(--text-primary)]">
            {formatNumber(d?.load_1m ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-muted)]">5m</div>
          <div className="font-semibold text-[var(--text-primary)]">
            {formatNumber(d?.load_5m ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[var(--text-muted)]">15m</div>
          <div className="font-semibold text-[var(--text-primary)]">
            {formatNumber(d?.load_15m ?? 0)}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ScalarCard({
  label,
  queryKey,
  endpoint,
  format,
}: {
  label: string;
  queryKey: string;
  endpoint: string;
  format: "percent" | "number";
}) {
  const q = useTimeRangeQuery<MetricValue>(queryKey, async (teamId, start, end) => {
    if (!teamId) return { value: 0 };
    return infraGet<MetricValue>(endpoint, teamId, Number(start), Number(end));
  });
  const v = q.data?.value ?? 0;
  return (
    <Card padding="md" className="border-[var(--border-color)]">
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="mt-1 font-semibold text-[22px] text-[var(--text-primary)]">
        {format === "percent" ? formatPercentage(v) : formatNumber(v)}
      </div>
    </Card>
  );
}

export function InfraResourceSummaryStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <ScalarCard
        label="Avg CPU"
        queryKey="infra-avg-cpu"
        endpoint="/v1/infrastructure/resource-utilisation/avg-cpu"
        format="percent"
      />
      <ScalarCard
        label="Avg memory"
        queryKey="infra-avg-mem"
        endpoint="/v1/infrastructure/resource-utilisation/avg-memory"
        format="percent"
      />
      <ScalarCard
        label="Avg network"
        queryKey="infra-avg-net"
        endpoint="/v1/infrastructure/resource-utilisation/avg-network"
        format="percent"
      />
      <ScalarCard
        label="Avg conn pool"
        queryKey="infra-avg-pool"
        endpoint="/v1/infrastructure/resource-utilisation/avg-conn-pool"
        format="percent"
      />
      <InfraLoadAverageCard />
    </div>
  );
}
