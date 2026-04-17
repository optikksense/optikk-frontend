import { memo } from "react";

import ErrorRateChart from "@shared/components/ui/charts/time-series/ErrorRateChart";
import LatencyChart from "@shared/components/ui/charts/time-series/LatencyChart";
import RequestChart from "@shared/components/ui/charts/time-series/RequestChart";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { TrendPanel } from "../TrendPanel";
import type { ServiceSummarySnapshot } from "../types";

type RequestPoint = { timestamp: string; request_count: number };
type ErrorPoint = {
  timestamp: string;
  request_count: number;
  error_count: number;
  error_rate: number;
};
type LatencyPoint = { timestamp: string; p95: number };

type Props = {
  summaryMetrics: ServiceSummarySnapshot | null;
  requestTrendSeries: RequestPoint[];
  errorTrendSeries: ErrorPoint[];
  latencyTrendSeries: LatencyPoint[];
  requestTrendLoading: boolean;
  errorTrendLoading: boolean;
  latencyTrendLoading: boolean;
  requestTrendError: boolean;
  errorTrendError: boolean;
  latencyTrendError: boolean;
};

function ServiceDrawerTrendChartsComponent({
  summaryMetrics,
  requestTrendSeries,
  errorTrendSeries,
  latencyTrendSeries,
  requestTrendLoading,
  errorTrendLoading,
  latencyTrendLoading,
  requestTrendError,
  errorTrendError,
  latencyTrendError,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <TrendPanel
        title="Request Trend"
        subtitle="Request volume over the active time range, with enough room to spot ramps, plateaus, and drops at a glance."
        headline={formatNumber(summaryMetrics?.requestCount ?? 0)}
        tone="requests"
      >
        {requestTrendError ? (
          <div className="text-[12px] text-[var(--text-muted)]">Request trend is unavailable.</div>
        ) : requestTrendLoading ? (
          <div className="text-[12px] text-[var(--text-muted)]">Loading request trend…</div>
        ) : requestTrendSeries.length > 0 ? (
          <RequestChart data={requestTrendSeries} valueKey="request_count" height={260} />
        ) : (
          <div className="text-[12px] text-[var(--text-muted)]">No request trend data.</div>
        )}
      </TrendPanel>

      <TrendPanel
        title="Error Trend"
        subtitle="Error rate over time for this service, sized for reading spikes and recovery windows instead of just confirming the chart exists."
        headline={formatPercentage(summaryMetrics?.errorRate ?? 0)}
        tone="errors"
      >
        {errorTrendError ? (
          <div className="text-[12px] text-[var(--text-muted)]">Error trend is unavailable.</div>
        ) : errorTrendLoading ? (
          <div className="text-[12px] text-[var(--text-muted)]">Loading error trend…</div>
        ) : errorTrendSeries.length > 0 ? (
          <ErrorRateChart data={errorTrendSeries} height={260} />
        ) : (
          <div className="text-[12px] text-[var(--text-muted)]">No error trend data.</div>
        )}
      </TrendPanel>

      <TrendPanel
        title="Latency Trend"
        subtitle="P95 latency over the active time range, with a taller chart so tail-latency bursts are easier to read."
        headline={formatDuration(summaryMetrics?.p95Latency ?? 0)}
        tone="latency"
      >
        {latencyTrendError ? (
          <div className="text-[12px] text-[var(--text-muted)]">Latency trend is unavailable.</div>
        ) : latencyTrendLoading ? (
          <div className="text-[12px] text-[var(--text-muted)]">Loading latency trend…</div>
        ) : latencyTrendSeries.length > 0 ? (
          <LatencyChart data={latencyTrendSeries} valueKey="p95" height={260} />
        ) : (
          <div className="text-[12px] text-[var(--text-muted)]">No latency trend data.</div>
        )}
      </TrendPanel>
    </div>
  );
}

export const ServiceDrawerTrendCharts = memo(ServiceDrawerTrendChartsComponent);
