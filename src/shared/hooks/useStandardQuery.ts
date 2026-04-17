import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";

/**
 * Standard query wrapper with project-wide defaults.
 *
 * Applies:
 * - `placeholderData: keepPreviousData` (prevents loading flash on refetch)
 * - `staleTime: 5_000` (avoids redundant fetches within 5 s)
 * - `retry: 2` (resilient to transient failures)
 *
 * Callers can override any default by passing the option explicitly.
 */
export function useStandardQuery<T>(
  options: Omit<UseQueryOptions<T, Error, T>, "queryKey" | "queryFn"> & {
    queryKey: readonly unknown[];
    queryFn: () => Promise<T>;
  },
) {
  return useQuery<T, Error, T>({
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    retry: 2,
    ...options,
  } as UseQueryOptions<T, Error, T>);
}
