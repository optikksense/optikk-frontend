import {
  type QueryFunction,
  type UseQueryOptions,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

   
                                                                             
                                                                           
                                                                         
                                                                               
  
                                                                          
                                                 
   
const HOUR_MS = 60 * 60 * 1000;

export function useImmutableQuery<T>(
  options: Omit<UseQueryOptions<T, Error, T>, "queryKey" | "queryFn"> & {
    queryKey: readonly unknown[];
    queryFn: QueryFunction<T, readonly unknown[]>;
  }
) {
  return useQuery<T, Error, T>({
    placeholderData: keepPreviousData,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: HOUR_MS,
    ...options,
  } as UseQueryOptions<T, Error, T>);
}
