import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParamsCompat as useSearchParams } from '@shared/hooks/useSearchParamsCompat';

import type { Dispatch, SetStateAction } from 'react';

/** A structured filter chip from ObservabilityQueryBar. */
export interface StructuredFilter {
  readonly field: string;
  readonly operator: string;
  readonly value: string;
}

/**
 *
 */
export type URLFilterType = 'string' | 'string[]' | 'number' | 'boolean';

/**
 *
 */
export type URLFilterValue = string | string[] | number | boolean;

type URLFilterValues = Record<string, URLFilterValue>;

type URLFilterSetter = (next: URLFilterValue | ((prev: URLFilterValue) => URLFilterValue)) => void;

type URLFilterSetters = Record<string, URLFilterSetter>;

/** Configuration for a single URL-synced filter parameter. */
export interface URLFilterParam {
  readonly key: string;
  readonly type: URLFilterType;
  readonly defaultValue?: URLFilterValue;
}

/** Configuration for syncing filter values with the URL query string. */
export interface URLFilterConfig {
  readonly params: URLFilterParam[];
  readonly syncStructuredFilters?: boolean;
  readonly stripParams?: string[];
}

function getTypeDefault(type: URLFilterType): URLFilterValue {
  switch (type) {
    case 'string':
      return '';
    case 'string[]':
      return [];
    case 'number':
      return 0;
    case 'boolean':
      return false;
  }
}

function parseParamValue(
  raw: string | null,
  type: URLFilterType,
  defaultValue: URLFilterValue
): URLFilterValue {
  if (raw === null || raw === undefined) {
    return defaultValue;
  }

  switch (type) {
    case 'string':
      return raw;
    case 'string[]':
      return raw ? raw.split(',').filter(Boolean) : defaultValue;
    case 'number': {
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : defaultValue;
    }
    case 'boolean':
      return raw === 'true' || raw === '1';
  }
}

function serialiseParamValue(value: URLFilterValue, type: URLFilterType): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case 'string':
      return value ? String(value) : null;
    case 'string[]':
      return Array.isArray(value) && value.length > 0 ? value.join(',') : null;
    case 'number':
      return value !== 0 ? String(value) : null;
    case 'boolean':
      return value ? 'true' : null;
  }
}

function encodeStructuredFilters(filters: StructuredFilter[]): string | null {
  if (filters.length === 0) {
    return null;
  }
  return filters
    .map((filter) => `${filter.field}:${filter.operator}:${encodeURIComponent(filter.value)}`)
    .join(';');
}

function decodeStructuredFilters(raw: string | null): StructuredFilter[] {
  if (!raw) {
    return [];
  }

  const filters: StructuredFilter[] = [];
  for (const chunk of raw.split(';')) {
    const [field, operator, ...rest] = chunk.split(':');
    if (!field || !operator) {
      continue;
    }
    filters.push({ field, operator, value: decodeURIComponent(rest.join(':')) });
  }
  return filters;
}

/**
 * useURLFilters — syncs filter state to/from URL search params.
 * @param config
 */
export function useURLFilters(config: URLFilterConfig): {
  values: URLFilterValues;
  setters: URLFilterSetters;
  structuredFilters: StructuredFilter[];
  setStructuredFilters: Dispatch<SetStateAction<StructuredFilter[]>>;
  clearAll: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialValues = useMemo((): URLFilterValues => {
    const values: URLFilterValues = {};
    for (const param of config.params) {
      const fallback = param.defaultValue ?? getTypeDefault(param.type);
      values[param.key] = parseParamValue(searchParams.get(param.key), param.type, fallback);
    }
    return values;
    // Initial parse should run once; subsequent URL changes are managed via state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [values, setValues] = useState<URLFilterValues>(initialValues);

  const initialStructuredFilters = useMemo((): StructuredFilter[] => {
    if (!config.syncStructuredFilters) {
      return [];
    }
    return decodeStructuredFilters(searchParams.get('filters'));
    // Initial parse should run once; subsequent URL changes are managed via state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [structuredFilters, setStructuredFilters] =
    useState<StructuredFilter[]>(initialStructuredFilters);

  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRenderRef = useRef(true);

  const flushToURL = useCallback(
    (nextValues: URLFilterValues, nextFilters: StructuredFilter[]): void => {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }

      pendingTimerRef.current = setTimeout(() => {
        setSearchParams(
          (prevParams) => {
            const nextSearchParams = new URLSearchParams(prevParams);

            // Clear only parameters managed by this hook, preserving others (e.g. from/to)
            for (const param of config.params) {
              nextSearchParams.delete(param.key);
            }
            nextSearchParams.delete('filters');
            if (config.stripParams) {
              for (const key of config.stripParams) {
                nextSearchParams.delete(key);
              }
            }

            // Apply new filter values
            for (const param of config.params) {
              const serialised = serialiseParamValue(nextValues[param.key], param.type);
              if (serialised !== null) {
                nextSearchParams.set(param.key, serialised);
              }
            }

            if (config.syncStructuredFilters) {
              const encodedFilters = encodeStructuredFilters(nextFilters);
              if (encodedFilters) {
                nextSearchParams.set('filters', encodedFilters);
              }
            }

            return nextSearchParams;
          },
          { replace: true }
        );
      }, 300);
    },
    // config.params and dependencies are intentionally captured to ensure the callback is stable where possible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.params, config.stripParams, config.syncStructuredFilters, setSearchParams]
  );

  useEffect(() => {
    if (!config.stripParams || config.stripParams.length === 0) {
      return;
    }

    setSearchParams(
      (prevParams) => {
        const nextSearchParams = new URLSearchParams(prevParams);
        let hasChanges = false;

        for (const key of config.stripParams!) {
          if (nextSearchParams.has(key)) {
            nextSearchParams.delete(key);
            hasChanges = true;
          }
        }

        return hasChanges ? nextSearchParams : prevParams;
      },
      { replace: true }
    );
    // searchParams dependency removed as it's now handled by functional update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.stripParams, setSearchParams]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    flushToURL(values, structuredFilters);
  }, [values, structuredFilters, flushToURL]);

  useEffect(() => {
    return (): void => {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
    };
  }, []);

  const setters = useMemo((): URLFilterSetters => {
    const generatedSetters: URLFilterSetters = {};
    for (const param of config.params) {
      generatedSetters[param.key] = (next): void => {
        setValues((previousValues) => {
          const previousValue = previousValues[param.key];
          const resolvedValue = typeof next === 'function' ? next(previousValue) : next;
          return { ...previousValues, [param.key]: resolvedValue };
        });
      };
    }
    return generatedSetters;
  }, [config.params]);

  const clearAll = useCallback((): void => {
    const defaults: URLFilterValues = {};
    for (const param of config.params) {
      defaults[param.key] = param.defaultValue ?? getTypeDefault(param.type);
    }
    setValues(defaults);
    setStructuredFilters([]);
  }, [config.params]);

  return {
    values,
    setters,
    structuredFilters,
    setStructuredFilters,
    clearAll,
  };
}
