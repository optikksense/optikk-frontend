import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";

/**
 * Like `useStandardQuery` but tuned for data that never changes once fetched
 * (e.g. a specific trace's spans/logs/critical-path in the detail drawer).
 * `staleTime: Infinity` + a long `gcTime` mean re-navigating to the same
 * trace inside a user's session is a pure cache hit — no re-fetch, no spinner.
 *
 * Not an application cache: this is React Query's in-memory dedupe of the
 * current session only. A page reload clears it.
 */
const HOUR_MS = 60 * 60 * 1000;

export function useImmutableQuery<T>(
  options: Omit<UseQueryOptions<T, Error, T>, "queryKey" | "queryFn"> & {
    queryKey: readonly unknown[];
    queryFn: () => Promise<T>;
  },
) {
  return useQuery<T, Error, T>({
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    gcTime: HOUR_MS,
    retry: 2,
    ...options,
  } as UseQueryOptions<T, Error, T>);
}
