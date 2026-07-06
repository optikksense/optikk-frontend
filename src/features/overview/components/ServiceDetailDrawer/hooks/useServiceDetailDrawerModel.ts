import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { ROUTES } from "@/shared/constants/routes";

import { buildServiceLogsSearch, buildServiceTracesSearch } from "../../serviceDrawerState";
import type { ServiceSummarySnapshot } from "../types";
import {
  buildDependencyRows,
  buildErrorTrendSeries,
  buildInitialSummary,
  buildLatencyTrendSeries,
  buildRequestTrendSeries,
  normalizeServiceKey,
} from "../utils";
import { useServiceDrawerQueries } from "./useServiceDrawerQueries";

export function useServiceDetailDrawerModel(
  serviceName: string,
  title: string | null | undefined,
  initialData: Record<string, unknown> | null | undefined
) {
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedServiceName = normalizeServiceKey(serviceName);

  const {
    metricsQuery,
    requestTrendQuery,
    errorTrendQuery,
    latencyTrendQuery,
    endpointsQuery,
    dependenciesQuery,
  } = useServiceDrawerQueries(serviceName);

  const initialSummary = useMemo(() => buildInitialSummary(initialData), [initialData]);

  const selectedServiceMetrics = useMemo(
    () =>
      metricsQuery.data?.find(
        (entry) => normalizeServiceKey(entry.service_name) === normalizedServiceName
      ) ?? null,
    [metricsQuery.data, normalizedServiceName]
  );

  const summaryMetrics = useMemo<ServiceSummarySnapshot | null>(() => {
    if (selectedServiceMetrics) {
      return {
        requestCount: selectedServiceMetrics.request_count ?? 0,
        errorCount: selectedServiceMetrics.error_count ?? 0,
        errorRate:
          Number(selectedServiceMetrics.request_count ?? 0) > 0
            ? (Number(selectedServiceMetrics.error_count ?? 0) * 100) /
              Number(selectedServiceMetrics.request_count ?? 0)
            : 0,
        avgLatency: selectedServiceMetrics.avg_latency ?? 0,
        p95Latency: selectedServiceMetrics.p95_latency ?? 0,
        p99Latency: selectedServiceMetrics.p99_latency ?? 0,
      };
    }

    return initialSummary;
  }, [initialSummary, selectedServiceMetrics]);

  const requestTrendSeries = useMemo(
    () => buildRequestTrendSeries(requestTrendQuery.data ?? []),
    [requestTrendQuery.data]
  );

  const errorTrendSeries = useMemo(
    () => buildErrorTrendSeries(errorTrendQuery.data ?? []),
    [errorTrendQuery.data]
  );

  const latencyTrendSeries = useMemo(
    () => buildLatencyTrendSeries(latencyTrendQuery.data ?? []),
    [latencyTrendQuery.data]
  );

  const endpointRows = useMemo(() => {
    const results = endpointsQuery.data?.data?.results ?? [];
    return [...results]
      .sort((left, right) => Number(right.total_count ?? 0) - Number(left.total_count ?? 0))
      .slice(0, 6)
      .map((row, index) => {
        const method = row.http_route ? (row.operation_name.split(" ")[0] ?? "HTTP") : "RPC";
        return {
          id: `${method}:${row.operation_name}:${index}`,
          service_name: row.service_name,
          operation_name: row.operation_name,
          endpoint_name: row.http_route,
          http_method: method,
          request_count: row.total_count,
          error_count: row.error_count,
          avg_latency: row.p50_ms,
          p95_latency: row.p95_ms,
        };
      });
  }, [endpointsQuery.data]);

  const upstreamRows = useMemo(
    () => buildDependencyRows(dependenciesQuery.data?.edges ?? [], serviceName, "upstream"),
    [dependenciesQuery.data?.edges, serviceName]
  );

  const downstreamRows = useMemo(
    () => buildDependencyRows(dependenciesQuery.data?.edges ?? [], serviceName, "downstream"),
    [dependenciesQuery.data?.edges, serviceName]
  );

  const openTraces = useCallback((): void => {
    navigate({
      to: ROUTES.traces as never,
      search: buildServiceTracesSearch(location.search, serviceName) as never,
    });
  }, [location.search, navigate, serviceName]);

  const openLogs = useCallback((): void => {
    navigate({
      to: ROUTES.logs as never,
      search: buildServiceLogsSearch(location.search, serviceName) as never,
    });
  }, [location.search, navigate, serviceName]);

  const openFullView = useCallback((): void => {
    const path = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(serviceName));
    navigate({ to: path as string & {} });
  }, [navigate, serviceName]);

  const serviceLabel = title?.trim() || serviceName;
  const endpointsLoading = endpointsQuery.isLoading && endpointRows.length === 0;
  const dependenciesLoading =
    dependenciesQuery.isLoading && upstreamRows.length === 0 && downstreamRows.length === 0;

  return {
    metricsQuery,
    requestTrendQuery,
    errorTrendQuery,
    latencyTrendQuery,
    endpointsQuery,
    dependenciesQuery,
    summaryMetrics,
    requestTrendSeries,
    errorTrendSeries,
    latencyTrendSeries,
    endpointRows,
    upstreamRows,
    downstreamRows,
    openTraces,
    openLogs,
    openFullView,
    serviceLabel,
    endpointsLoading,
    dependenciesLoading,
  };
}
