import { useMemo, useState } from 'react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { v1Service } from '@services/v1Service';
import { serviceMapService } from '@services/serviceMapService';
import {
    normalizeServiceMetric,
    normalizeTimeSeriesPoint,
    normalizeTopologyNode,
    normalizeTopologyEdge,
    getServiceStatus,
    calcRiskScore,
} from '../utils/servicesUtils';

export function useServicesData({ searchQuery, sortField, sortOrder, healthFilter }) {
    const { data, isLoading } = useTimeRangeQuery(
        'services-metrics',
        (teamId, startTime, endTime) => v1Service.getServiceMetrics(teamId, startTime, endTime)
    );

    const { data: serviceTimeseriesRaw } = useTimeRangeQuery(
        'service-timeseries-svc',
        (teamId, start, end) => v1Service.getServiceTimeSeries(teamId, start, end, '5m')
    );

    const chartDataSources = useMemo(() => ({
        'service-timeseries': (Array.isArray(serviceTimeseriesRaw) ? serviceTimeseriesRaw : []).map(normalizeTimeSeriesPoint),
        'services-metrics': (Array.isArray(data) ? data : []).map(normalizeServiceMetric),
    }), [serviceTimeseriesRaw, data]);

    const {
        data: topologyDataRaw,
        isLoading: topologyLoading,
        error: topologyError,
    } = useTimeRangeQuery(
        'service-topology',
        (teamId, startTime, endTime) => serviceMapService.getTopology(teamId, startTime, endTime)
    );

    const services = useMemo(
        () => (Array.isArray(data) ? data : []).map(normalizeServiceMetric),
        [data]
    );
    const allTopologyNodes = useMemo(
        () => (Array.isArray(topologyDataRaw?.nodes) ? topologyDataRaw.nodes : []).map(normalizeTopologyNode),
        [topologyDataRaw?.nodes]
    );
    const allTopologyEdges = useMemo(
        () => (Array.isArray(topologyDataRaw?.edges) ? topologyDataRaw.edges : []).map(normalizeTopologyEdge),
        [topologyDataRaw?.edges]
    );

    const serviceRows = useMemo(() => {
        return services.map((service) => {
            const requestCount = Number(service.request_count) || 0;
            const errorCount = Number(service.error_count) || 0;
            const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
            const avgLatency = Number(service.avg_latency) || 0;

            return {
                serviceName: service.service_name,
                errorRate,
                requestCount,
                errorCount,
                avgLatency,
                p95Latency: Number(service.p95_latency) || 0,
                p99Latency: Number(service.p99_latency) || 0,
                status: getServiceStatus(errorRate),
                requestTrend: Array.from({ length: 20 }, () => Math.random() * requestCount * 0.2 + requestCount * 0.8),
            };
        });
    }, [services]);

    const servicesByName = useMemo(
        () => new Map(serviceRows.map((row) => [row.serviceName, row])),
        [serviceRows]
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
        const nodeMap = new Map();

        allTopologyNodes.forEach((node) => {
            const serviceMetrics = servicesByName.get(node.name);
            const errorRate = Number(node.errorRate ?? serviceMetrics?.errorRate ?? 0);
            const avgLatency = Number(node.avgLatency ?? serviceMetrics?.avgLatency ?? 0);
            const requestCount = Number(node.requestCount ?? serviceMetrics?.requestCount ?? 0);
            const status = node.status || serviceMetrics?.status || getServiceStatus(errorRate);
            const dependencyCount = (adjacency.out.get(node.name) || 0) + (adjacency.inbound.get(node.name) || 0);

            nodeMap.set(node.name, {
                ...node,
                name: node.name,
                requestCount,
                errorRate,
                avgLatency,
                status,
                dependencyCount,
                riskScore: calcRiskScore({ errorRate, avgLatency, dependencyCount }),
            });
        });

        serviceRows.forEach((row) => {
            if (nodeMap.has(row.serviceName)) return;
            const dependencyCount = (adjacency.out.get(row.serviceName) || 0) + (adjacency.inbound.get(row.serviceName) || 0);

            nodeMap.set(row.serviceName, {
                name: row.serviceName,
                requestCount: row.requestCount,
                errorRate: row.errorRate,
                avgLatency: row.avgLatency,
                status: row.status,
                dependencyCount,
                riskScore: calcRiskScore({
                    errorRate: row.errorRate,
                    avgLatency: row.avgLatency,
                    dependencyCount,
                }),
            });
        });

        return Array.from(nodeMap.values());
    }, [allTopologyNodes, servicesByName, serviceRows, adjacency]);

    const {
        totalServices,
        healthyServices,
        degradedServices,
        unhealthyServices,
        avgErrorRate,
        avgLatency,
        tableData,
    } = useMemo(() => {
        const total = serviceRows.length;
        const healthy = serviceRows.filter((s) => s.status === 'healthy').length;
        const degraded = serviceRows.filter((s) => s.status === 'degraded').length;
        const unhealthy = serviceRows.filter((s) => s.status === 'unhealthy').length;

        const errSum = serviceRows.reduce((acc, row) => acc + row.errorRate, 0);
        const latSum = serviceRows.reduce((acc, row) => acc + row.avgLatency, 0);

        const filteredBySearch = searchQuery
            ? serviceRows.filter((s) => s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
            : serviceRows;

        const sorted = sortField && sortOrder
            ? [...filteredBySearch].sort((a, b) => {
                const aVal = a[sortField];
                const bVal = b[sortField];
                const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                return sortOrder === 'ascend' ? comparison : -comparison;
            })
            : filteredBySearch;

        return {
            totalServices: total,
            healthyServices: healthy,
            degradedServices: degraded,
            unhealthyServices: unhealthy,
            avgErrorRate: total > 0 ? errSum / total : 0,
            avgLatency: total > 0 ? latSum / total : 0,
            tableData: sorted,
        };
    }, [serviceRows, searchQuery, sortField, sortOrder]);

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

    const topologyNodeNames = useMemo(() => new Set(topologyNodes.map((n) => n.name)), [topologyNodes]);

    const topologyEdges = useMemo(
        () => allTopologyEdges.filter((edge) => topologyNodeNames.has(edge.source) && topologyNodeNames.has(edge.target)),
        [allTopologyEdges, topologyNodeNames]
    );

    const topologyStats = useMemo(() => {
        const unhealthy = topologyNodes.filter((n) => n.status === 'unhealthy').length;
        const degraded = topologyNodes.filter((n) => n.status === 'degraded').length;
        const highRiskEdges = topologyEdges.filter((e) => Number(e.errorRate) > 5).length;
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

    const dependencyRows = useMemo(() => {
        return topologyEdges.map((edge, index) => {
            const source = normalizedTopologyNodes.find((n) => n.name === edge.source);
            const target = normalizedTopologyNodes.find((n) => n.name === edge.target);
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
    }, [topologyEdges, normalizedTopologyNodes]);

    const healthOptions = [
        { key: 'all', label: 'All', count: normalizedTopologyNodes.length },
        {
            key: 'healthy',
            label: 'Healthy',
            count: normalizedTopologyNodes.filter((n) => n.status === 'healthy').length,
            color: '#73C991',
        },
        {
            key: 'degraded',
            label: 'Degraded',
            count: normalizedTopologyNodes.filter((n) => n.status === 'degraded').length,
            color: '#F79009',
        },
        {
            key: 'unhealthy',
            label: 'Unhealthy',
            count: normalizedTopologyNodes.filter((n) => n.status === 'unhealthy').length,
            color: '#F04438',
        },
    ];

    return {
        isLoading,
        chartDataSources,
        topologyLoading,
        topologyError,
        totalServices,
        healthyServices,
        degradedServices,
        unhealthyServices,
        avgErrorRate,
        avgLatency,
        tableData,
        topologyNodes,
        topologyEdges,
        topologyStats,
        criticalServices,
        dependencyRows,
        healthOptions,
    };
}
