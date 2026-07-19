import {
  type QueryFunction,
  type UseQueryOptions,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

/**
 * Standard query wrapper with project-wide defaults.
 *
 * Applies:
 * - `placeholderData: keepPreviousData` (prevents loading flash on refetch)
 * - `staleTime: 5_000` (avoids redundant fetches within 5 s)
 *
 * Callers can override any default by passing the option explicitly.
 */
export function useStandardQuery<T>(
  options: Omit<UseQueryOptions<T, Error, T>, "queryKey" | "queryFn"> & {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<T, readonly unknown[]>;
  }
) {
  return useQuery<T, Error, T>({
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    ...options,
  } as UseQueryOptions<T, Error, T>);
}
