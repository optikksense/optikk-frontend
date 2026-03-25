import { useQuery, useMutation } from '@tanstack/react-query';
import { tracesService } from '@shared/api/tracesService';
import { AnalyticsDimension, AnalyticsQuery } from '../types';

export function useTraceAnalytics() {
  const { data: dimensions, isLoading: dimensionsLoading } = useQuery<AnalyticsDimension[]>({
    queryKey: ['trace-analytics-dimensions'],
    queryFn: () => tracesService.getDimensions(),
  });

  const runQuery = useMutation({
    mutationFn: (query: AnalyticsQuery) => tracesService.postAnalytics(query),
  });

  return {
    dimensions,
    dimensionsLoading,
    runQuery,
  };
}
