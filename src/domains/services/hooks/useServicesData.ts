import { APP_COLORS } from '@config/colorLiterals';
import { useMemo } from 'react';

import { servicesPageService } from '@services/servicesPageService';

import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

import {
  normalizeServiceMetric,
  normalizeTimeSeriesPoint,
  normalizeTopologyNode,
  normalizeTopologyEdge,
  getServiceStatus,
  calcRiskScore,
} from '../utils/servicesUtils';

import type {
  DomainRecord,
  ServiceDependencyRow,
  ServiceHealthOption,
  ServiceMetric,
  ServiceTableRow,
  ServiceTimeSeriesPoint,
  ServiceTopologyEdge,
  ServiceTopologyNode,
  ServicesDataParams,
  ServicesDataResult,
} from '../types';

function asRecord(value: unknown): DomainRecord {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  return value as DomainRecord;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function countFromSummary(value: unknown): number {
  const row = asRecord(value);
  return toNumber(row.count);
}

/**
 *
 * @param params
 */
export function useServicesData({
  searchQuery,
  sortField,
  sortOrder,
  healthFilter,
}: ServicesDataParams): ServicesDataResult {
  const { data: totalServicesRaw, isLoading: totalLoading } = useTimeRangeQuery(
    'services-summary-total',
    (teamId, startTime, endTime) => servicesPageService.getTotalServices(teamId, startTime, endTime),
  );

  const { data: healthyServicesRaw, isLoading: healthyLoading } = useTimeRangeQuery(
    'services-summary-healthy',
    (teamId, startTime, endTime) => servicesPageService.getHealthyServices(teamId, startTime, endTime),
  );

  const { data: degradedServicesRaw, isLoading: degradedLoading } = useTimeRangeQuery(
    'services-summary-degraded',
    (teamId, startTime, endTime) => servicesPageService.getDegradedServices(teamId, startTime, endTime),
  );

  const { data: unhealthyServicesRaw, isLoading: unhealthyLoading } = useTimeRangeQuery(
    'services-summary-unhealthy',
    (teamId, startTime, endTime) => servicesPageService.getUnhealthyServices(teamId, startTime, endTime),
  );

  const { data: metricsRaw, isLoading: metricsLoading } = useTimeRangeQuery(
    'services-metrics',
    (teamId, startTime, endTime) => servicesPageService.getServiceMetrics(teamId, startTime, endTime),
  );

  const { data: serviceTimeseriesRaw, isLoading: timeseriesLoading } = useTimeRangeQuery(
    'service-timeseries-svc',
    (teamId, start, end) => servicesPageService.getServiceTimeSeries(teamId, start, end, '5m'),
  );

  const {
    data: topologyDataRaw,
    isLoading: topologyLoading,
    error: topologyError,
  } = useTimeRangeQuery(
    'service-topology',
    (teamId, startTime, endTime) => servicesPageService.getTopology(teamId, startTime, endTime),
  );

  const services = useMemo<ServiceMetric[]>(
    () => asArray(metricsRaw).map(normalizeServiceMetric),
    [metricsRaw],
  );

  const normalizedServiceTimeseries = useMemo<ServiceTimeSeriesPoint[]>(
    () => asArray(serviceTimeseriesRaw).map(normalizeTimeSeriesPoint),
    [serviceTimeseriesRaw],
  );

  const chartDataSources = useMemo<Record<string, unknown[]>>(
    () => ({
      'service-timeseries': normalizedServiceTimeseries,
      'services-metrics': services,
    }),
    [normalizedServiceTimeseries, services],
  );

  const requestTrendsByService = useMemo<Map<string, number[]>>(() => {
    const grouped = new Map<string, ServiceTimeSeriesPoint[]>();

    for (const point of normalizedServiceTimeseries) {
      if (!point.service_name) continue;

      const existing = grouped.get(point.service_name) || [];
      existing.push(point);
      grouped.set(point.service_name, existing);
    }

    const trends = new Map<string, number[]>();
    for (const [serviceName, points] of grouped.entries()) {
      const sorted = [...points].sort(
        (left: ServiceTimeSeriesPoint, right: ServiceTimeSeriesPoint) =>
          new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
      );
      trends.set(
        serviceName,
        sorted.map((point: ServiceTimeSeriesPoint) => toNumber(point.request_count)),
      );
    }

    return trends;
  }, [normalizedServiceTimeseries]);

  const serviceRows = useMemo<ServiceTableRow[]>(() => {
    return services.map((service: ServiceMetric) => {
      const requestCount = toNumber(service.request_count);
      const errorCount = toNumber(service.error_count);
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;

      return {
        serviceName: service.service_name,
        errorRate,
        requestCount,
        errorCount,
        avgLatency: toNumber(service.avg_latency),
        p95Latency: toNumber(service.p95_latency),
        p99Latency: toNumber(service.p99_latency),
        status: getServiceStatus(errorRate),
        requestTrend: requestTrendsByService.get(service.service_name) || null,
      };
    });
  }, [services, requestTrendsByService]);

  const tableData = useMemo<ServiceTableRow[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    const filteredBySearch = query
      ? serviceRows.filter((service: ServiceTableRow) => service.serviceName.toLowerCase().includes(query))
      : serviceRows;

    if (!sortField || !sortOrder) {
      return filteredBySearch;
    }

    return [...filteredBySearch].sort((left: ServiceTableRow, right: ServiceTableRow) => {
      const leftValue = left[sortField];
      const rightValue = right[sortField];

      let comparison = 0;
      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        comparison = leftValue - rightValue;
      } else {
        comparison = String(leftValue ?? '').localeCompare(String(rightValue ?? ''));
      }

      return sortOrder === 'ascend' ? comparison : -comparison;
    });
  }, [serviceRows, searchQuery, sortField, sortOrder]);

  const topologyData = asRecord(topologyDataRaw);

  const allTopologyNodes = useMemo<ServiceTopologyNode[]>(
    () => asArray(topologyData.nodes).map(normalizeTopologyNode),
    [topologyData.nodes],
  );

  const allTopologyEdges = useMemo<ServiceTopologyEdge[]>(
    () => asArray(topologyData.edges).map(normalizeTopologyEdge),
    [topologyData.edges],
  );

  const adjacency = useMemo((): { out: Map<string, number>; inbound: Map<string, number> } => {
    const out = new Map<string, number>();
    const inbound = new Map<string, number>();

    for (const edge of allTopologyEdges) {
      out.set(edge.source, (out.get(edge.source) || 0) + 1);
      inbound.set(edge.target, (inbound.get(edge.target) || 0) + 1);
    }

    return { out, inbound };
  }, [allTopologyEdges]);

  const normalizedTopologyNodes = useMemo<ServiceTopologyNode[]>(() => {
    return allTopologyNodes.map((node: ServiceTopologyNode) => {
      const errorRate = toNumber(node.errorRate);
      const avgLatency = toNumber(node.avgLatency);
      const dependencyCount = (adjacency.out.get(node.name) || 0) + (adjacency.inbound.get(node.name) || 0);

      return {
        ...node,
        name: node.name,
        requestCount: toNumber(node.requestCount),
        errorRate,
        avgLatency,
        status: node.status || getServiceStatus(errorRate),
        dependencyCount,
        riskScore: calcRiskScore({ errorRate, avgLatency, dependencyCount }),
      };
    });
  }, [allTopologyNodes, adjacency]);

  const topologyNodes = useMemo<ServiceTopologyNode[]>(() => {
    let rows = normalizedTopologyNodes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter((row: ServiceTopologyNode) => row.name.toLowerCase().includes(query));
    }

    if (healthFilter !== 'all') {
      rows = rows.filter((row: ServiceTopologyNode) => row.status.toLowerCase() === healthFilter);
    }

    return rows;
  }, [normalizedTopologyNodes, searchQuery, healthFilter]);

  const topologyNodeNames = useMemo(
    () => new Set(topologyNodes.map((node: ServiceTopologyNode) => node.name)),
    [topologyNodes],
  );

  const topologyEdges = useMemo<ServiceTopologyEdge[]>(
    () =>
      allTopologyEdges.filter(
        (edge: ServiceTopologyEdge) =>
          topologyNodeNames.has(edge.source) && topologyNodeNames.has(edge.target),
      ),
    [allTopologyEdges, topologyNodeNames],
  );

  const topologyStats = useMemo(() => {
    const unhealthy = topologyNodes.filter((node: ServiceTopologyNode) => node.status === 'unhealthy').length;
    const degraded = topologyNodes.filter((node: ServiceTopologyNode) => node.status === 'degraded').length;
    const highRiskEdges = topologyEdges.filter((edge: ServiceTopologyEdge) => toNumber(edge.errorRate) > 5).length;

    return {
      graphServices: topologyNodes.length,
      dependencies: topologyEdges.length,
      criticalServices: unhealthy + degraded,
      highRiskEdges,
    };
  }, [topologyNodes, topologyEdges]);

  const criticalServices = useMemo<ServiceTopologyNode[]>(() => {
    return [...topologyNodes]
      .sort(
        (left: ServiceTopologyNode, right: ServiceTopologyNode) =>
          toNumber(right.riskScore) - toNumber(left.riskScore),
      )
      .slice(0, 8);
  }, [topologyNodes]);

  const topologyNodesByName = useMemo(
    () => new Map(normalizedTopologyNodes.map((node: ServiceTopologyNode) => [node.name, node])),
    [normalizedTopologyNodes],
  );

  const dependencyRows = useMemo<ServiceDependencyRow[]>(() => {
    return topologyEdges
      .map((edge: ServiceTopologyEdge, index: number) => {
        const source = topologyNodesByName.get(edge.source);
        const target = topologyNodesByName.get(edge.target);
        const errorRate = toNumber(edge.errorRate);
        const avgLatency = toNumber(edge.avgLatency);
        const callCount = toNumber(edge.callCount);

        return {
          key: `${edge.source}-${edge.target}-${index}`,
          source: edge.source,
          target: edge.target,
          sourceStatus: source?.status || 'unknown',
          targetStatus: target?.status || 'unknown',
          callCount,
          avgLatency,
          errorRate,
          risk: calcRiskScore({
            errorRate,
            avgLatency,
            dependencyCount: toNumber(source?.dependencyCount) + toNumber(target?.dependencyCount),
          }),
        };
      })
      .sort((left: ServiceDependencyRow, right: ServiceDependencyRow) => right.risk - left.risk);
  }, [topologyEdges, topologyNodesByName]);

  const healthOptions = useMemo<ServiceHealthOption[]>(
    () => [
      { key: 'all', label: 'All', count: normalizedTopologyNodes.length },
      {
        key: 'healthy',
        label: 'Healthy',
        count: normalizedTopologyNodes.filter((node: ServiceTopologyNode) => node.status === 'healthy').length,
        color: APP_COLORS.hex_73c991,
      },
      {
        key: 'degraded',
        label: 'Degraded',
        count: normalizedTopologyNodes.filter((node: ServiceTopologyNode) => node.status === 'degraded').length,
        color: APP_COLORS.hex_f79009,
      },
      {
        key: 'unhealthy',
        label: 'Unhealthy',
        count: normalizedTopologyNodes.filter((node: ServiceTopologyNode) => node.status === 'unhealthy').length,
        color: APP_COLORS.hex_f04438,
      },
    ],
    [normalizedTopologyNodes],
  );

  return {
    isLoading:
      metricsLoading ||
      timeseriesLoading ||
      totalLoading ||
      healthyLoading ||
      degradedLoading ||
      unhealthyLoading,
    chartDataSources,
    topologyLoading,
    topologyError: topologyError instanceof Error ? topologyError : null,
    totalServices: countFromSummary(totalServicesRaw),
    healthyServices: countFromSummary(healthyServicesRaw),
    degradedServices: countFromSummary(degradedServicesRaw),
    unhealthyServices: countFromSummary(unhealthyServicesRaw),
    tableData,
    topologyNodes,
    topologyEdges,
    topologyStats,
    criticalServices,
    dependencyRows,
    healthOptions,
  };
}
