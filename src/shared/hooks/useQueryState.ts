import { useCallback, useMemo } from 'react';
import { useSearchParamsCompat as useSearchParams } from '@shared/hooks/useSearchParamsCompat';

/**
 *
 */
export function useQueryState<T extends string>(
  key: string,
  defaultValue: T
): readonly [T, (nextValue: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => {
    const nextValue = searchParams.get(key);
    return (nextValue as T) || defaultValue;
  }, [defaultValue, key, searchParams]);

  const setValue = useCallback(
    (nextValue: T) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      if (!nextValue || nextValue === defaultValue) {
        nextSearchParams.delete(key);
      } else {
        nextSearchParams.set(key, nextValue);
      }
      setSearchParams(nextSearchParams, { replace: true });
    },
    [defaultValue, key, searchParams, setSearchParams]
  );

  return [value, setValue] as const;
}
