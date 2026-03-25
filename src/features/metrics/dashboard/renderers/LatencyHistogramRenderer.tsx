import { useMemo } from 'react';

import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import LatencyHistogram from '@shared/components/ui/charts/distributions/LatencyHistogram';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';

/**
 *
 */
export function LatencyHistogramRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const traces = useMemo(() => {
    const arr = Array.isArray(rawData) ? rawData : [];
    if (arr.length > 0 && arr[0].duration_ms != null) return arr;
    const bucketMidpoint = (bucket: string): number =>
      (
        ({
          '0_10ms': 5,
          '10_25ms': 17,
          '25_50ms': 37,
          '50_100ms': 75,
          '100_250ms': 175,
          '250_500ms': 375,
          '500ms_1s': 750,
          '1s_2500ms': 1750,
          '2500ms_5s': 3750,
          gt_5s: 7000,
        }) as Record<string, number>
      )[bucket] ?? 0;
    return arr.flatMap((bucket) => {
      const count = Number(bucket.span_count) || 0;
      return Array(count).fill({ duration_ms: bucketMidpoint(bucket.bucket) });
    });
  }, [rawData]);
  return <LatencyHistogram traces={traces} height={240} />;
}
