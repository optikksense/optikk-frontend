import { Surface } from '@/components/ui';
import RequestChart from '@shared/components/ui/charts/time-series/RequestChart';
import ErrorRateChart from '@shared/components/ui/charts/time-series/ErrorRateChart';
import LatencyChart from '@shared/components/ui/charts/time-series/LatencyChart';

import type { ServiceTimeSeriesPoint } from '../../types';
import { useServiceDetailContext } from '../../context/ServiceDetailContext';

interface ServiceChartsGridProps {
  timeSeries: ServiceTimeSeriesPoint[];
  loading: boolean;
}

function buildServiceTimeseriesMap(
  serviceName: string,
  timeSeries: ServiceTimeSeriesPoint[]
): Record<string, Record<string, unknown>[]> {
  return {
    [serviceName]: timeSeries.map((p) => ({
      timestamp: p.timestamp,
      request_count: p.requestCount,
      error_count: p.errorCount,
      avg_latency: p.avgLatencyMs,
      p50_latency: p.p50Ms,
      p95_latency: p.p95Ms,
      p99_latency: p.p99Ms,
      error_rate: p.requestCount > 0 ? (p.errorCount / p.requestCount) * 100 : 0,
    })),
  };
}

export default function ServiceChartsGrid({ timeSeries, loading }: ServiceChartsGridProps) {
  const { serviceName } = useServiceDetailContext();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Surface key={i} elevation={1} padding="sm" className="h-[300px] animate-pulse" />
        ))}
      </div>
    );
  }

  const serviceTimeseriesMap = buildServiceTimeseriesMap(serviceName, timeSeries);
  const endpoints = [{ key: serviceName, service_name: serviceName }];

  return (
    <div className="grid grid-cols-2 gap-4">
      <Surface elevation={1} padding="sm">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--text-secondary)]">
          Request Rate
        </div>
        <div className="h-[260px]">
          <RequestChart
            endpoints={endpoints}
            serviceTimeseriesMap={serviceTimeseriesMap}
            fillHeight
            datasetLabel="Requests/min"
          />
        </div>
      </Surface>

      <Surface elevation={1} padding="sm">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--text-secondary)]">
          Error Rate
        </div>
        <div className="h-[260px]">
          <ErrorRateChart
            endpoints={endpoints}
            serviceTimeseriesMap={serviceTimeseriesMap}
            fillHeight
          />
        </div>
      </Surface>

      <Surface elevation={1} padding="sm">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--text-secondary)]">
          Latency Percentiles
        </div>
        <div className="h-[260px]">
          <LatencyChart
            endpoints={endpoints}
            serviceTimeseriesMap={serviceTimeseriesMap}
            fillHeight
          />
        </div>
      </Surface>

      <Surface elevation={1} padding="sm">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--text-secondary)]">
          Throughput
        </div>
        <div className="h-[260px]">
          <RequestChart
            endpoints={endpoints}
            serviceTimeseriesMap={serviceTimeseriesMap}
            fillHeight
            datasetLabel="Throughput"
            valueKey="request_count"
          />
        </div>
      </Surface>
    </div>
  );
}
