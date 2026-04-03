import { useState, useMemo, useCallback } from 'react';

import { inferServiceType } from '../utils/topologyClusterDetection';

export type StatusFilter = 'all' | 'healthy' | 'degraded' | 'critical';
export type TypeFilter = 'all' | 'application' | 'database' | 'cache' | 'queue' | 'grpc' | 'external';

interface TopologyNode {
  name: string;
  status: string;
}

export function useTopologyFilters(nodes: TopologyNode[]) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const matchingNames = useMemo(() => {
    const q = search.toLowerCase();
    return new Set(
      nodes
        .filter((n) => {
          if (q && !n.name.toLowerCase().includes(q)) return false;
          if (statusFilter !== 'all') {
            const s = n.status.toLowerCase();
            if (statusFilter === 'healthy' && s !== 'healthy') return false;
            if (statusFilter === 'degraded' && s !== 'degraded') return false;
            if (statusFilter === 'critical' && (s !== 'unhealthy' && s !== 'critical')) return false;
          }
          if (typeFilter !== 'all') {
            const t = inferServiceType(n.name);
            if (t !== typeFilter) return false;
          }
          return true;
        })
        .map((n) => n.name)
    );
  }, [nodes, search, statusFilter, typeFilter]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
  }, []);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    matchingNames,
    resetFilters,
    hasActiveFilters: search !== '' || statusFilter !== 'all' || typeFilter !== 'all',
  };
}
