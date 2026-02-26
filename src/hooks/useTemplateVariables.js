import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@services/api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1.SERVICES_METRICS;

/**
 * Hook that manages template variable state for a dashboard.
 *
 * @param {Array} variableDefs - Array of variable definitions from config.variables
 * @param {Object} sharedVariables - Optional URL-provided variable overrides
 * @returns {{ values, setVariable, resolveParams, variablesWithOptions }}
 */
export function useTemplateVariables(variableDefs = [], sharedVariables = null) {
  // Initialize values from defaults (or shared params)
  const [values, setValues] = useState(() => {
    const initial = {};
    for (const v of variableDefs) {
      initial[v.name] = sharedVariables?.[v.name] ?? v.defaultValue ?? '*';
    }
    return initial;
  });

  // Re-initialize when variable defs change
  useEffect(() => {
    setValues((prev) => {
      const updated = {};
      for (const v of variableDefs) {
        updated[v.name] = prev[v.name] ?? sharedVariables?.[v.name] ?? v.defaultValue ?? '*';
      }
      return updated;
    });
  }, [variableDefs, sharedVariables]);

  const setVariable = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Replace $variableName tokens in a params object with current values.
   * Returns a new params object with resolved values.
   */
  const resolveParams = useCallback((params) => {
    if (!params) return params;
    const resolved = {};
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === 'string' && val.startsWith('$')) {
        const varName = val.slice(1);
        const resolvedVal = values[varName];
        // Skip parameter if value is "*" (all) — don't send filter
        if (resolvedVal && resolvedVal !== '*') {
          resolved[key] = resolvedVal;
        }
      } else {
        resolved[key] = val;
      }
    }
    return resolved;
  }, [values]);

  // Build variable options for each "query" type variable
  const variablesWithOptions = useMemo(() => {
    return variableDefs.map((v) => ({
      ...v,
      currentValue: values[v.name] ?? v.defaultValue ?? '*',
    }));
  }, [variableDefs, values]);

  return { values, setVariable, resolveParams, variablesWithOptions };
}

/**
 * Hook to fetch options for a single query-type template variable.
 */
export function useVariableOptions(variableDef, teamId, startTime, endTime) {
  const isQuery = variableDef?.type === 'query' && variableDef?.query?.endpoint;

  const { data } = useQuery({
    queryKey: ['template-var-options', variableDef?.name, teamId, startTime, endTime],
    queryFn: async () => {
      const endpoint = variableDef.query.endpoint;
      const url = endpoint.startsWith('/v1/') ? `${BASE}${endpoint.slice(3)}` : `${BASE}${endpoint}`;
      const resp = await api.get(url, { params: { startTime, endTime } });
      return resp;
    },
    enabled: !!isQuery && !!teamId,
    staleTime: 2 * 60 * 1000,
  });

  const options = useMemo(() => {
    if (!isQuery || !data) return [];
    const arr = Array.isArray(data) ? data : [];
    const valueField = variableDef.query.valueField || 'value';
    const labelField = variableDef.query.labelField || valueField;

    const seen = new Set();
    return arr
      .map((item) => {
        const val = item[valueField];
        if (!val || seen.has(val)) return null;
        seen.add(val);
        return { value: val, label: item[labelField] || val };
      })
      .filter(Boolean);
  }, [data, isQuery, variableDef]);

  return options;
}
