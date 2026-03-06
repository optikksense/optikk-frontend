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

/**
 *
 * @param root0
 * @param root0.searchQuery
 * @param root0.sortField
 * @param root0.sortOrder
 * @param root0.healthFilter
 */
export function useServicesData({ searchQuery, sortField, sortOrder, healthFilter }: any) {
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

    const services = useMemo(
        () => (Array.isArray(metricsRaw) ? metricsRaw : []).map(normalizeServiceMetric),
        [metricsRaw],
    );

    const normalizedServiceTimeseries = useMemo(
        () => (Array.isArray(serviceTimeseriesRaw) ? serviceTimeseriesRaw : []).map(normalizeTimeSeriesPoint),
        [serviceTimeseriesRaw],
    );

    const chartDataSources = useMemo(() => ({
        'service-timeseries': normalizedServiceTimeseries,
        'services-metrics': services,
    }), [normalizedServiceTimeseries, services]);

    const requestTrendsByService = useMemo(() => {
        const trends = new Map();

        normalizedServiceTimeseries.forEach((point) => {
            const serviceName = point.service_name;
            if (!serviceName) return;

            if (!trends.has(serviceName)) trends.set(serviceName, []);
            trends.get(serviceName).push(point);
        });

        for (const [serviceName, points] of (trends.entries() as any)) {
            points.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            trends.set(serviceName, points.map((point: any) => Number(point.request_count || 0)));
        }

        return trends;
    }, [normalizedServiceTimeseries]);

    const serviceRows = useMemo(() => {
        return services.map((service) => {
            const requestCount = Number(service.request_count) || 0;
            const errorCount = Number(service.error_count) || 0;
            const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;

            return {
                serviceName: service.service_name,
                errorRate,
                requestCount,
                errorCount,
                avgLatency: Number(service.avg_latency) || 0,
                p95Latency: Number(service.p95_latency) || 0,
                p99Latency: Number(service.p99_latency) || 0,
                status: getServiceStatus(errorRate),
                requestTrend: requestTrendsByService.get(service.service_name) || null,
            };
        });
    }, [services, requestTrendsByService]);

    const tableData = useMemo(() => {
        const filteredBySearch = searchQuery
            ? serviceRows.filter((s) => s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
            : serviceRows;

        return sortField && sortOrder
            ? [...filteredBySearch].sort((a, b) => {
                const aVal = a[sortField];
                const bVal = b[sortField];
                const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                return sortOrder === 'ascend' ? comparison : -comparison;
            })
            : filteredBySearch;
    }, [serviceRows, searchQuery, sortField, sortOrder]);

    const allTopologyNodes = useMemo(
        () => (Array.isArray((topologyDataRaw as any)?.nodes) ? (topologyDataRaw as any).nodes : []).map(normalizeTopologyNode),
        [topologyDataRaw],
    );

    const allTopologyEdges = useMemo(
        () => (Array.isArray((topologyDataRaw as any)?.edges) ? (topologyDataRaw as any).edges : []).map(normalizeTopologyEdge),
        [topologyDataRaw],
    );

    const adjacency = useMemo(() => {
        const out = new Map();
        const inbound = new Map();

        allTopologyEdges.forEach((edge) => {
            out.set(edge.source, (out.get(edge.source) || 0) + 1);
            inbound.set(edge.target, (inbound.get(edge.target) || 0) + 1);
        });

        return { out, inbound };
    }, [allTopologyEdges]);

    const normalizedTopologyNodes = useMemo(() => {
        return allTopologyNodes.map((node) => {
            const errorRate = Number(node.errorRate ?? 0);
            const avgLatency = Number(node.avgLatency ?? 0);
            const dependencyCount = (adjacency.out.get(node.name) || 0) + (adjacency.inbound.get(node.name) || 0);

            return {
                ...node,
                name: node.name,
                requestCount: Number(node.requestCount ?? 0),
                errorRate,
                avgLatency,
                status: node.status || getServiceStatus(errorRate),
                dependencyCount,
                riskScore: calcRiskScore({ errorRate, avgLatency, dependencyCount }),
            };
        });
    }, [allTopologyNodes, adjacency]);

    const topologyNodes = useMemo(() => {
        let rows = normalizedTopologyNodes;

        if (searchQuery) {
            rows = rows.filter((row) => row.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (healthFilter !== 'all') {
            rows = rows.filter((row) => row.status?.toLowerCase() === healthFilter);
        }

        return rows;
    }, [normalizedTopologyNodes, searchQuery, healthFilter]);

    const topologyNodeNames = useMemo(() => new Set(topologyNodes.map((node) => node.name)), [topologyNodes]);

    const topologyEdges = useMemo(
        () => allTopologyEdges.filter((edge) => topologyNodeNames.has(edge.source) && topologyNodeNames.has(edge.target)),
        [allTopologyEdges, topologyNodeNames],
    );

    const topologyStats = useMemo(() => {
        const unhealthy = topologyNodes.filter((node) => node.status === 'unhealthy').length;
        const degraded = topologyNodes.filter((node) => node.status === 'degraded').length;
        const highRiskEdges = topologyEdges.filter((edge) => Number(edge.errorRate) > 5).length;

        return {
            graphServices: topologyNodes.length,
            dependencies: topologyEdges.length,
            criticalServices: unhealthy + degraded,
            highRiskEdges,
        };
    }, [topologyNodes, topologyEdges]);

    const criticalServices = useMemo(() => {
        return [...topologyNodes]
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 8);
    }, [topologyNodes]);

    const topologyNodesByName = useMemo(
        () => new Map(normalizedTopologyNodes.map((node) => [node.name, node])),
        [normalizedTopologyNodes],
    );

    const dependencyRows = useMemo(() => {
        return topologyEdges.map((edge, index) => {
            const source: any = topologyNodesByName.get(edge.source);
            const target: any = topologyNodesByName.get(edge.target);
            const errorRate = Number(edge.errorRate) || 0;
            const avgLatency = Number(edge.avgLatency) || 0;
            const callCount = Number(edge.callCount) || 0;

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
                    dependencyCount: Number(source?.dependencyCount || 0) + Number(target?.dependencyCount || 0),
                }),
            };
        }).sort((a, b) => b.risk - a.risk);
    }, [topologyEdges, topologyNodesByName]);

    const healthOptions = [
        { key: 'all', label: 'All', count: normalizedTopologyNodes.length },
        {
            key: 'healthy',
            label: 'Healthy',
            count: normalizedTopologyNodes.filter((node) => node.status === 'healthy').length,
            color: '#73C991',
        },
        {
            key: 'degraded',
            label: 'Degraded',
            count: normalizedTopologyNodes.filter((node) => node.status === 'degraded').length,
            color: '#F79009',
        },
        {
            key: 'unhealthy',
            label: 'Unhealthy',
            count: normalizedTopologyNodes.filter((node) => node.status === 'unhealthy').length,
            color: '#F04438',
        },
    ];

    return {
        isLoading: metricsLoading || timeseriesLoading || totalLoading || healthyLoading || degradedLoading || unhealthyLoading,
        chartDataSources,
        topologyLoading,
        topologyError,
        totalServices: Number((totalServicesRaw as any)?.count ?? 0),
        healthyServices: Number((healthyServicesRaw as any)?.count ?? 0),
        degradedServices: Number((degradedServicesRaw as any)?.count ?? 0),
        unhealthyServices: Number((unhealthyServicesRaw as any)?.count ?? 0),
        tableData,
        topologyNodes,
        topologyEdges,
        topologyStats,
        criticalServices,
        dependencyRows,
        healthOptions,
    };
}
