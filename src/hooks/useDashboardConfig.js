import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import yaml from 'js-yaml';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';

/**
 * Fetches and parses the YAML dashboard config for a page.
 * Returns { config, isLoading, error }.
 */
export function useDashboardConfig(pageId) {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-config', selectedTeamId, pageId],
    queryFn: () => v1Service.getDashboardConfig(selectedTeamId, pageId),
    enabled: !!selectedTeamId && !!pageId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  let config = null;
  if (data?.configYaml) {
    try {
      config = yaml.load(data.configYaml);
    } catch (e) {
      console.error('Failed to parse dashboard YAML config:', e);
    }
  }

  return { config, isLoading, error };
}

/**
 * Mutation hook for saving dashboard config YAML.
 * Automatically invalidates the config cache on success.
 */
export function useSaveDashboardConfig(pageId) {
  const { selectedTeamId } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configYaml) => v1Service.saveDashboardConfig(selectedTeamId, pageId, configYaml),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-config', selectedTeamId, pageId] });
    },
  });
}

/**
 * Reads share-related URL parameters for time range and template variable overrides.
 * Returns { sharedTimeRange, sharedVariables } or nulls if not present.
 */
export function useSharedParams() {
  const [searchParams] = useSearchParams();

  const tStart = searchParams.get('t_start');
  const tEnd = searchParams.get('t_end');
  const sharedTimeRange = tStart && tEnd ? { start: tStart, end: tEnd } : null;

  const sharedVariables = {};
  let hasVars = false;
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('var_')) {
      sharedVariables[key.slice(4)] = value;
      hasVars = true;
    }
  }

  return { sharedTimeRange, sharedVariables: hasVars ? sharedVariables : null };
}
