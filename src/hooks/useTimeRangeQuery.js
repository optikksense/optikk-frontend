import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAppStore } from '@store/appStore';

/**
 * Custom hook that wraps useQuery with automatic time range and team ID from appStore.
 *
 * Every time the time range picker changes (or manual refresh), appStore.setTimeRange()
 * bumps refreshKey, which changes the query key and forces React Query to discard any
 * cached result and re-fetch from the backend with fresh timestamps.
 *
 * @param {string} key - The base query key (e.g. 'overview', 'logs')
 * @param {Function} queryFn - (teamId, startTime, endTime) => Promise
 * @param {Object} options - Additional react-query options + extraKeys
 * @returns {Object} react-query result
 */
export function useTimeRangeQuery(key, queryFn, options = {}) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const { extraKeys = [], enabled, ...queryOptions } = options;

  return useQuery({
    // refreshKey is bumped on every time-range change and manual refresh → unique key → forced fetch
    queryKey: [key, selectedTeamId, timeRange.value, refreshKey, ...extraKeys],
    queryFn: () => {
      // For custom ranges use the absolute timestamps; otherwise compute relative
      let startTime, endTime;
      if (timeRange.value === 'custom' && timeRange.startTime && timeRange.endTime) {
        startTime = timeRange.startTime;
        endTime = timeRange.endTime;
      } else {
        endTime = Date.now();
        startTime = endTime - timeRange.minutes * 60 * 1000;
      }
      return queryFn(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId && (enabled !== false),
    // Always refetch from the backend, but keep previous data visible during refetch
    staleTime: 0,
    gcTime: 30_000, // keep cache 30s so switching back quickly doesn't flash empty
    refetchOnMount: 'always',
    placeholderData: keepPreviousData, // show old data while new query is in-flight
    ...queryOptions,
  });
}

/**
 * Returns the time range configuration from appStore.
 * Useful when you need to build custom queries with time ranges.
 *
 * IMPORTANT: This hook returns timeRange.value (e.g., '1h', '24h') instead of
 * actual timestamps to prevent unnecessary re-renders. Calculate fresh timestamps
 * inside your queryFn when the query actually runs.
 *
 * @returns {Object} { selectedTeamId, timeRange, refreshKey, getTimeRange }
 */
export function useTimeRange() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  // Helper function to get fresh timestamps when needed
  const getTimeRange = () => {
    if (timeRange.value === 'custom' && timeRange.startTime && timeRange.endTime) {
      return { startTime: timeRange.startTime, endTime: timeRange.endTime };
    }
    const endTime = Date.now();
    const startTime = endTime - timeRange.minutes * 60 * 1000;
    return { startTime, endTime };
  };

  return {
    selectedTeamId,
    timeRange,
    refreshKey,
    getTimeRange,
  };
}
