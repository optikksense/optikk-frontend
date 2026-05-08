import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions, dynamicTo } from "@/shared/utils/navigation";

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

  const endpointRows = useMemo(
    () =>
      [...(endpointsQuery.data ?? [])]
        .sort((left, right) => Number(right.request_count ?? 0) - Number(left.request_count ?? 0))
        .slice(0, 6)
        .map((row, index) => ({
          ...row,
          id: `${row.http_method}:${row.operation_name}:${index}`,
        })),
    [endpointsQuery.data]
  );

  const upstreamRows = useMemo(
    () => buildDependencyRows(dependenciesQuery.data?.edges ?? [], serviceName, "upstream"),
    [dependenciesQuery.data?.edges, serviceName]
  );

  const downstreamRows = useMemo(
    () => buildDependencyRows(dependenciesQuery.data?.edges ?? [], serviceName, "downstream"),
    [dependenciesQuery.data?.edges, serviceName]
  );

  const requestSparkline = useMemo(
    () => requestTrendSeries.map((point) => Number(point.request_count ?? 0)),
    [requestTrendSeries]
  );

  const errorSparkline = useMemo(
    () =>
      errorTrendSeries.map((point) => {
        const requests = Number(point.request_count ?? 0);
        const errors = Number(point.error_count ?? 0);
        return requests > 0 ? (errors * 100) / requests : 0;
      }),
    [errorTrendSeries]
  );

  const latencySparkline = useMemo(
    () => latencyTrendSeries.map((point) => Number(point.p95 ?? 0)),
    [latencyTrendSeries]
  );

  const openTraces = useCallback((): void => {
    navigate(
      dynamicNavigateOptions(ROUTES.traces, buildServiceTracesSearch(location.search, serviceName))
    );
  }, [location.search, navigate, serviceName]);

  const openLogs = useCallback((): void => {
    navigate(
      dynamicNavigateOptions(ROUTES.logs, buildServiceLogsSearch(location.search, serviceName))
    );
  }, [location.search, navigate, serviceName]);

  const openFullView = useCallback((): void => {
    const path = ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(serviceName));
    navigate({ to: dynamicTo(path) });
  }, [navigate, serviceName]);

  const serviceLabel = title?.trim() || serviceName;
  const hasSummary = Boolean(summaryMetrics);
  const summaryLoading = metricsQuery.isLoading && !summaryMetrics;
  const requestTrendLoading = requestTrendQuery.isLoading && requestTrendSeries.length === 0;
  const errorTrendLoading = errorTrendQuery.isLoading && errorTrendSeries.length === 0;
  const latencyTrendLoading = latencyTrendQuery.isLoading && latencyTrendSeries.length === 0;
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
    requestSparkline,
    errorSparkline,
    latencySparkline,
    openTraces,
    openLogs,
    openFullView,
    serviceLabel,
    hasSummary,
    summaryLoading,
    requestTrendLoading,
    errorTrendLoading,
    latencyTrendLoading,
    endpointsLoading,
    dependenciesLoading,
  };
}
