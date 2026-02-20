import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@store/appStore';

/**
 * Custom hook that wraps useQuery with automatic time range and team ID from appStore.
 * Eliminates the repeated boilerplate of extracting selectedTeamId, timeRange,
 * calculating startTime/endTime, and building queryKey.
 *
 * IMPORTANT: This hook uses timeRange.value (e.g., '1h', '24h') in the query key
 * instead of actual timestamps to prevent unnecessary refetches on every render.
 * The actual timestamps are calculated fresh when the query function runs.
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
    // Use timeRange.value instead of actual timestamps to prevent constant refetching
    queryKey: [key, selectedTeamId, timeRange.value, refreshKey, ...extraKeys],
    queryFn: () => {
      // Calculate fresh timestamps when the query actually runs
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return queryFn(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId && (enabled !== false),
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
