import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@store/appStore';
import { v1Service } from '@services/v1Service';
import { dashboardService } from '@services/dashboardService';

export function useMetricsQueries({ selectedService, showErrorsOnly, activeTab }) {
    const { selectedTeamId, timeRange, refreshKey } = useAppStore();

    const getTimeRange = () => {
        const endTime = Date.now();
        const startTime = endTime - timeRange.minutes * 60 * 1000;
        return { startTime, endTime };
    };

    const { data: servicesData } = useQuery({
        queryKey: ['services', selectedTeamId, timeRange.value, refreshKey],
        queryFn: () => {
            const { startTime, endTime } = getTimeRange();
            return dashboardService.getServices(selectedTeamId, startTime, endTime);
        },
        enabled: !!selectedTeamId,
    });

    const { data: summaryData, isLoading: summaryLoading } = useQuery({
        queryKey: ['metrics-summary', selectedTeamId, timeRange.value, refreshKey],
        queryFn: () => {
            const { startTime, endTime } = getTimeRange();
            return v1Service.getMetricsSummary(selectedTeamId, startTime, endTime);
        },
        enabled: !!selectedTeamId,
    });

    const { data: metricsData, isLoading: metricsLoading } = useQuery({
        queryKey: ['metrics-timeseries', selectedTeamId, timeRange.value, selectedService, showErrorsOnly, refreshKey],
        queryFn: () => {
            const { startTime, endTime } = getTimeRange();
            return v1Service.getMetricsTimeSeries(selectedTeamId, startTime, endTime, selectedService, '5m');
        },
        enabled: !!selectedTeamId,
    });

    const { data: serviceMetricsData } = useQuery({
        queryKey: ['service-metrics', selectedTeamId, timeRange.value, refreshKey],
        queryFn: () => {
            const { startTime, endTime } = getTimeRange();
            return v1Service.getServiceMetrics(selectedTeamId, startTime, endTime);
        },
        enabled: !!selectedTeamId && activeTab === 'services',
    });

    const { data: endpointMetricsData } = useQuery({
        queryKey: ['endpoints-metrics', selectedTeamId, timeRange.value, selectedService, refreshKey],
        queryFn: () => {
            const { startTime, endTime } = getTimeRange();
            return v1Service.getEndpointMetrics(selectedTeamId, startTime, endTime, selectedService);
        },
        enabled: !!selectedTeamId,
    });

    const { data: endpointTimeSeriesData } = useQuery({
        queryKey: ['endpoints-timeseries', selectedTeamId, timeRange.value, selectedService, refreshKey],
        queryFn: () => {
            const { startTime, endTime } = getTimeRange();
            return v1Service.getEndpointTimeSeries(selectedTeamId, startTime, endTime, selectedService);
        },
        enabled: !!selectedTeamId && activeTab === 'overview',
    });

    return {
        servicesData,
        summaryData,
        summaryLoading,
        metricsData,
        metricsLoading,
        serviceMetricsData,
        endpointMetricsData,
        endpointTimeSeriesData
    };
}
