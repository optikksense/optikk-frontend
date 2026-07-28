import {
  type QueryFunction,
  type UseQueryOptions,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

   
                                                     
  
           
                                                                            
                                                             
  
                                                                     
   
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
