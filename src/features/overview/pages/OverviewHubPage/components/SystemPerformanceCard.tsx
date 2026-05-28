import { Suspense, lazy } from "react";

import { Skeleton, Surface } from "@/components/ui";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";

import type { PerformanceSeries } from "../hooks/useOverviewModel";

const RequestChart = lazy(() => import("@shared/components/ui/charts/time-series/RequestChart"));
const ErrorRateChart = lazy(
  () => import("@shared/components/ui/charts/time-series/ErrorRateChart")
);

interface Props {
  readonly series: PerformanceSeries;
  readonly loading: boolean;
}

function chartFallback() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <Skeleton active className="h-32 w-full" />
    </div>
  );
}

export default function SystemPerformanceCard({ series, loading }: Props) {
  const showEmpty = !loading && !series.hasRequests && !series.hasErrors;

  return (
    <Surface elevation={1} padding="md" className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-semibold text-[13px] text-[var(--text-primary)]">
            System performance
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Requests and errors over the selected time range
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-[var(--chart-1)]" />
            requests
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-[var(--color-error)]" />
            errors
          </span>
        </div>
      </div>

      {showEmpty ? (
        <div className="h-[200px]">
          <ChartNoDataOverlay />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Suspense fallback={chartFallback()}>
            <RequestChart
              serviceTimeseriesMap={series.requestSeries}
              endpoints={[]}
              selectedEndpoints={[]}
              height={200}
              datasetLabel="Requests"
              valueKey="request_count"
            />
          </Suspense>
          <Suspense fallback={chartFallback()}>
            <ErrorRateChart
              serviceTimeseriesMap={series.errorSeries}
              endpoints={[]}
              selectedEndpoints={[]}
              height={200}
            />
          </Suspense>
        </div>
      )}
    </Surface>
  );
}
