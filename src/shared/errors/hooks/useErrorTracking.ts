import { useEffect, useMemo, useState } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type { PaginatedResponse } from "@/shared/api/service-types";
import {
  type ErrorGroup,
  type ErrorTimeSeriesPoint,
  getErrorVolume,
  listErrorGroups,
} from "@shared/api/errors";

import type { ErrorsKpis } from "../components/ErrorsKpiStrip";
import type { ServiceFacet } from "../components/ServiceFacetRail";

const PAGE_SIZE = 25;
                                                                                           
const AGGREGATE_LIMIT = 200;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface UseErrorTrackingArgs {
                                                                                     
  readonly lockedService?: string;
}

   
                                                                     
                                                                                 
                                                                                 
                                                  
   
export function useErrorTracking(args: UseErrorTrackingArgs = {}) {
  const { lockedService } = args;
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const serviceFilter = lockedService ?? selectedService;
  const cursor = page > 0 ? cursors[page - 1] : undefined;

                                                                                                 
  useEffect(() => {
    setPage(0);
    setCursors({});
  }, [serviceFilter]);

  const groupsQ = useTimeRangeQuery<PaginatedResponse<ErrorGroup[]>>(
    "errors-groups",
    (_t, s, e) =>
      listErrorGroups(s, e, {
        limit: PAGE_SIZE,
        cursor,
        serviceName: serviceFilter ?? undefined,
      }),
    { extraKeys: [page, cursor, serviceFilter ?? ""] }
  );

  const aggregateQ = useTimeRangeQuery<PaginatedResponse<ErrorGroup[]>>(
    "errors-groups-aggregate",
    (_t, s, e) =>
      listErrorGroups(s, e, {
        limit: AGGREGATE_LIMIT,
        serviceName: lockedService ?? undefined,
      }),
    { extraKeys: [lockedService ?? ""] }
  );

  const volumeQ = useTimeRangeQuery<ErrorTimeSeriesPoint[]>(
    "errors-volume",
    (_t, s, e) => getErrorVolume(s, e, { serviceName: lockedService ?? undefined }),
    { extraKeys: [lockedService ?? ""] }
  );

  const nextCursor = groupsQ.data?.pageInfo?.nextCursor;
  const hasMore = groupsQ.data?.pageInfo?.hasMore ?? false;
  useEffect(() => {
    if (nextCursor) {
      setCursors((prev) => ({ ...prev, [page]: nextCursor }));
    }
  }, [nextCursor, page]);

  const allGroups = useMemo(() => aggregateQ.data?.results ?? [], [aggregateQ.data]);
  const volumeSeries = useMemo(() => volumeQ.data ?? [], [volumeQ.data]);

  const kpis = useMemo<ErrorsKpis>(() => {
    const totalErrorsSeries = volumeSeries.map((p) => p.errorCount);
    const cutoff = Date.now() - ONE_DAY_MS;
    let newIssues = 0;
    const services = new Set<string>();
    for (const g of allGroups) {
      services.add(g.serviceName);
      const first = new Date(g.firstOccurrence).getTime();
      if (!Number.isNaN(first) && first >= cutoff) newIssues += 1;
    }
    return {
      totalErrors: totalErrorsSeries.reduce((sum, v) => sum + v, 0),
      totalErrorsSeries,
      activeIssues: allGroups.length,
      newIssues,
      servicesAffected: services.size,
    };
  }, [allGroups, volumeSeries]);

  const facets = useMemo<ServiceFacet[]>(() => {
    const counts = new Map<string, number>();
    for (const g of allGroups) {
      counts.set(g.serviceName, (counts.get(g.serviceName) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }, [allGroups]);

  const pageRows = useMemo(() => {
    const rows = groupsQ.data?.results ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.operationName} ${r.statusMessage} ${r.serviceName}`.toLowerCase().includes(q)
    );
  }, [groupsQ.data, query]);

  return {
    page,
    setPage,
    hasMore,
    query,
    setQuery,
    serviceFilter: lockedService ? null : selectedService,
    setServiceFilter: setSelectedService,
    error: groupsQ.error as Error | null,
    kpis,
    facets,
    pageRows,
    totalGroups: allGroups.length,
  };
}
