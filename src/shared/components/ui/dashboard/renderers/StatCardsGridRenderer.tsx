import { Activity, AlertCircle, Clock, Zap } from "lucide-react";
import { useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import { StatCardsGrid } from "@shared/components/ui";
import { formatDuration, formatNumber } from "@shared/utils/formatters";

import { useDashboardData } from "../hooks/useDashboardData";

import type { DashboardPanelRendererProps } from "../dashboardPanelRegistry";

export function StatCardsGridRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: services, rawData } = useDashboardData(chartConfig, dataSources);

  const summary = useMemo(() => {
    // If backend returns a single summary object it's often in rawData (not data array)
    if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
      const s = rawData as Record<string, unknown>;
      const totalRequests = Number(s.total_requests ?? 0);
      const errorCount = Number(s.error_count ?? 0);
      return {
        totalRequests,
        errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
        avgLatency: Number(s.avg_latency ?? 0),
        p95Latency: Number(s.p95_latency ?? 0),
      };
    }

    if (!services || services.length === 0) {
      return { totalRequests: 0, errorRate: 0, avgLatency: 0, p95Latency: 0 };
    }

    // Legacy: Aggregation logic (deprecated)
    let totalRequests = 0;
    let totalErrors = 0;
    let latencySum = 0;
    let p95Max = 0;

    for (const s of services) {
      const { request_count, error_count, avg_latency, p95_latency } = s as Record<string, unknown>;
      const req = Number(request_count ?? 0);
      totalRequests += req;
      totalErrors += Number(error_count ?? 0);
      latencySum += Number(avg_latency ?? 0) * req;
      p95Max = Math.max(p95Max, Number(p95_latency ?? 0));
    }

    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const avgLatency = totalRequests > 0 ? latencySum / totalRequests : 0;

    return { totalRequests, errorRate, avgLatency, p95Latency: p95Max };
  }, [services, rawData]);

  return (
    <div className="h-full min-h-0 overflow-y-auto p-2">
      <StatCardsGrid
        stats={[
          {
            metric: {
              title: "Total Requests",
              value: summary.totalRequests,
              formatter: formatNumber,
            },
            visuals: { icon: <Activity size={20} />, iconColor: APP_COLORS.hex_5e60ce },
          },
          {
            metric: {
              title: "Error Rate",
              value: Number(Math.max(0, summary.errorRate).toFixed(2)),
              suffix: "%",
            },
            visuals: { icon: <AlertCircle size={20} />, iconColor: APP_COLORS.hex_f04438 },
          },
          {
            metric: { title: "Avg Latency", value: summary.avgLatency, formatter: formatDuration },
            visuals: { icon: <Clock size={20} />, iconColor: APP_COLORS.hex_f79009 },
          },
          {
            metric: { title: "P95 Latency", value: summary.p95Latency, formatter: formatDuration },
            visuals: { icon: <Zap size={20} />, iconColor: APP_COLORS.hex_06aed5 },
          },
        ]}
      />
    </div>
  );
}
