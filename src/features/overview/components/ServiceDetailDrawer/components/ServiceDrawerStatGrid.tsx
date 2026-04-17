import { memo } from "react";

import StatCard from "@shared/components/ui/cards/StatCard";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { ServiceSummarySnapshot } from "../types";

type Props = {
  summaryMetrics: ServiceSummarySnapshot | null;
  summaryLoading: boolean;
  requestSparkline: number[];
  errorSparkline: number[];
  latencySparkline: number[];
};

function ServiceDrawerStatGridComponent({
  summaryMetrics,
  summaryLoading,
  requestSparkline,
  errorSparkline,
  latencySparkline,
}: Props) {
  return (
    <div id="service-drawer-overview" className="scroll-mt-24">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          metric={{
            title: "Requests",
            value: summaryMetrics?.requestCount ?? 0,
            formatter: formatNumber,
          }}
          visuals={{ sparklineData: requestSparkline, loading: summaryLoading }}
        />
        <StatCard
          metric={{
            title: "Error Rate",
            value: summaryMetrics?.errorRate ?? 0,
            formatter: (value) => formatPercentage(Number(value)),
          }}
          visuals={{ sparklineData: errorSparkline, loading: summaryLoading }}
        />
        <StatCard
          metric={{
            title: "Avg Latency",
            value: summaryMetrics?.avgLatency ?? 0,
            formatter: formatDuration,
          }}
          visuals={{ sparklineData: latencySparkline, loading: summaryLoading }}
        />
        <StatCard
          metric={{
            title: "P95 Latency",
            value: summaryMetrics?.p95Latency ?? 0,
            formatter: formatDuration,
          }}
          visuals={{ sparklineData: latencySparkline, loading: summaryLoading }}
        />
      </div>
    </div>
  );
}

export const ServiceDrawerStatGrid = memo(ServiceDrawerStatGridComponent);
