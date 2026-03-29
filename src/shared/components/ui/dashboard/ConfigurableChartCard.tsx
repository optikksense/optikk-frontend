import { Surface, Tooltip } from '@/components/ui';
import { Info } from 'lucide-react';

import type { ComponentType, ReactNode } from 'react';

import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';
import ChartErrorOverlay from '@shared/components/ui/feedback/ChartErrorOverlay';
import ChartNoDataOverlay from '@shared/components/ui/feedback/ChartNoDataOverlay';

import { useMemo, useState } from 'react';

import type {
  DashboardPanelSpec,
  DashboardDataSources,
  DashboardExtraContext,
  DashboardRecord,
} from '@/types/dashboardConfig';
import QueueMetricsList from '@shared/components/ui/data-display/QueueMetricsList';
import type { QueueMetricsListType } from '@shared/components/ui/data-display/QueueMetricsList';
import TopEndpointsList from '@shared/components/ui/data-display/TopEndpointsList';
import type { TopEndpointsListType } from '@shared/components/ui/data-display/TopEndpointsList';

import DashboardCardErrorBoundary from './DashboardCardErrorBoundary';
import {
  type BaseChartComponentProps,
  type SpecializedDashboardRenderer,
  useDashboardPanelRegistration,
} from './dashboardPanelRegistry';
import { getDashboardIcon } from './utils/dashboardUtils';
import { cn } from '@/lib/utils';

import {
  resolveComponentData,
  normalizeDashboardRows,
  firstValue,
  strValue,
  numValue,
  resolveComponentKey,
  buildEndpointKey,
  groupTimeseries,
  buildQueueEndpoints,
  buildEndpointList,
  buildServiceListFromMetrics,
  defaultListTypeForChart,
  defaultListTitleForChart,
  buildGroupedListFromTimeseries,
} from './utils/dashboardAggregators';
import { getDashboardRecordArrayField } from './utils/runtimeValue';

interface ConfigurableChartCardProps {
  componentConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
  error?: ApiErrorShape | null;
  isLoading?: boolean;
  extraContext: DashboardExtraContext;
}

interface ConfigurableChartCardContentProps extends ConfigurableChartCardProps {
  titleContent: ReactNode;
}

function asQueueMetricsListType(value: string | undefined): QueueMetricsListType {
  switch (value) {
    case 'consumerLag':
    case 'productionRate':
    case 'consumptionRate':
      return value;
    default:
      return 'depth';
  }
}

function chartConfigDataKey(chartConfig: DashboardPanelSpec): string | undefined {
  return chartConfig.dataKey;
}

/**
 *
 * @param root0
 * @param root0.componentConfig
 * @param root0.dataSources
 * @param root0.extraContext
 */
function ConfigurableChartCardContent({
  componentConfig,
  dataSources,
  error,
  isLoading = false,
  extraContext,
  titleContent,
}: ConfigurableChartCardContentProps) {
  const chartConfig = componentConfig;
  const panelType = resolveComponentKey(chartConfig);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);

  const toggleEndpoint = (key: string) => {
    setSelectedEndpoints((prev) =>
      prev.includes(key) ? prev.filter((currentKey) => currentKey !== key) : [...prev, key]
    );
  };

  const panelRegistration = useDashboardPanelRegistration(panelType);
  const titleClassName = cn('chart-card__title');
  const componentRenderer = panelRegistration?.component;
  const rawData = resolveComponentData(chartConfig, dataSources);
  const hasRenderer = Boolean(panelRegistration && componentRenderer);
  const hasNoData = useMemo(() => {
    if (rawData === undefined || rawData === null) return true;
    if (Array.isArray(rawData)) {
      if (rawData.length === 0) return true;

      // Check for zero-data: Only consider keys the panel is trying to display
      const primaryKey = chartConfig.valueKey || chartConfig.valueField || 'value';
      const fallbacks = ['span_count', 'request_count', 'error_count'];
      const metricsToCheck = [primaryKey, ...fallbacks].filter(Boolean) as string[];

      if (metricsToCheck.length > 0) {
        const hasPositiveMetric = rawData.some((row) =>
          metricsToCheck.some((key) => {
            const val = Number(row[key]);
            // Non-NaN and greater than 0 is actual data we want to plot
            return !Number.isNaN(val) && val > 0;
          })
        );
        if (!hasPositiveMetric) return true;
      }
    }
    return false;
  }, [rawData, chartConfig.valueKey, chartConfig.valueField]);
  const timeseriesData = normalizeDashboardRows(rawData, chartConfigDataKey(chartConfig));

  const serviceTimeseriesMap = useMemo(() => {
    if (chartConfig.groupByKey) {
      return groupTimeseries(timeseriesData, chartConfig.groupByKey);
    }
    const endpointDataSourceId = chartConfig.endpointDataSource;
    if (endpointDataSourceId && dataSources?.[endpointDataSourceId]) {
      const endpointData = normalizeDashboardRows(dataSources[endpointDataSourceId]);
      return groupTimeseries(endpointData, 'endpoint');
    }
    return {};
  }, [timeseriesData, dataSources, chartConfig]);

  const endpoints = useMemo(() => {
    if (chartConfig.groupByKey === 'queue') {
      const topQueues = getDashboardRecordArrayField(rawData, 'topQueues');
      return buildQueueEndpoints(
        topQueues,
        chartConfig.listSortField || chartConfig.valueKey || 'value',
        chartConfig.listType || 'default'
      );
    }

    const metricsSourceId = chartConfig.endpointMetricsSource;
    if (metricsSourceId && dataSources?.[metricsSourceId]) {
      const metricsData = normalizeDashboardRows(dataSources[metricsSourceId]);
      const listType = defaultListTypeForChart(chartConfig);
      const metricEndpoints =
        chartConfig.groupByKey === 'service'
          ? buildServiceListFromMetrics(metricsData, listType)
          : buildEndpointList(metricsData, listType);
      if (metricEndpoints.length > 0) {
        return metricEndpoints;
      }
    }

    if (chartConfig.groupByKey) {
      return buildGroupedListFromTimeseries(serviceTimeseriesMap, chartConfig);
    }

    return [];
  }, [rawData, dataSources, serviceTimeseriesMap, chartConfig]);

  if (error) {
    return (
      <Surface elevation={1} padding="md" className="chart-card" style={{ height: '100%' }}>
        <div className={titleClassName}>{chartConfig.title as string}</div>
        <ChartErrorOverlay code={error.code} message={error.message} />
      </Surface>
    );
  }

  if (!hasRenderer) {
    console.warn(`Unknown dashboard panel type received from backend: ${panelType || '<empty>'}`);
    return (
      <Surface elevation={1} padding="md" className="chart-card" style={{ height: '100%' }}>
        <div className={titleClassName}>{chartConfig.title as string}</div>
        <div className="p-md text-muted">
          Unknown dashboard panel type: {panelType || '<empty>'}
        </div>
      </Surface>
    );
  }

  if (!isLoading && hasNoData) {
    return (
      <Surface elevation={1} padding="md" className="chart-card" style={{ height: '100%' }}>
        <div className={titleClassName}>{chartConfig.title as string}</div>
        <ChartNoDataOverlay />
      </Surface>
    );
  }

  if (panelRegistration?.kind === 'self-contained') {
    const SelfContainedRenderer = componentRenderer as SpecializedDashboardRenderer;

    return (
      <SelfContainedRenderer
        chartConfig={chartConfig}
        dataSources={dataSources}
        extraContext={extraContext}
      />
    );
  }

  if (panelRegistration?.kind === 'specialized') {
    const SpecializedRenderer = componentRenderer as SpecializedDashboardRenderer;
    return (
      <Surface
        elevation={1}
        padding="xs"
        className="chart-card flex flex-col"
        style={{ height: '100%', overflow: 'hidden' }}
      >
        <div className={titleClassName}>{titleContent}</div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <SpecializedRenderer
            chartConfig={chartConfig}
            dataSources={dataSources}
            extraContext={extraContext}
          />
        </div>
      </Surface>
    );
  }
  const ChartComponent = componentRenderer as ComponentType<BaseChartComponentProps>;

  const chartProps: BaseChartComponentProps = {
    serviceTimeseriesMap,
    endpoints,
    selectedEndpoints,
    fillHeight: true,
  };

  if (chartConfig.valueKey) chartProps.valueKey = chartConfig.valueKey;
  if (chartConfig.datasetLabel) chartProps.datasetLabel = chartConfig.datasetLabel;
  if (chartConfig.color) chartProps.color = chartConfig.color;
  if (chartConfig.targetThreshold != null)
    chartProps.targetThreshold = Number(chartConfig.targetThreshold);

  if (!chartConfig.groupByKey && !chartConfig.endpointDataSource) {
    chartProps.data = timeseriesData.map((d: DashboardRecord) => ({
      timestamp: strValue(d, ['timestamp', 'time_bucket', 'timeBucket'], ''),
      value: (() => {
        const explicit = firstValue(
          d,
          [chartConfig.valueField || chartConfig.valueKey || 'value', 'value'],
          null
        );
        if (explicit !== null && explicit !== undefined && explicit !== '') {
          const parsed = Number(explicit);
          return Number.isFinite(parsed) ? parsed : 0;
        }

        if (panelType === 'request') {
          return numValue(d, ['request_count', 'requestCount', 'req_count', 'value', 'val'], 0);
        }
        if (panelType === 'error-rate') {
          const total = numValue(d, ['request_count', 'requestCount', 'req_count'], 0);
          const errors = numValue(d, ['error_count', 'errorCount'], 0);
          if (total > 0) return (errors * 100.0) / total;
          return numValue(d, ['error_rate', 'errorRate'], 0);
        }
        if (panelType === 'latency') {
          return numValue(
            d,
            [
              'avg_latency',
              'avgLatency',
              'avg_latency_ms',
              'avgLatencyMs',
              'p50_latency',
              'p50Latency',
              'p50',
            ],
            0
          );
        }
        return 0;
      })(),
      ...(panelType === 'latency'
        ? {
            p50: numValue(
              d,
              ['p50_latency', 'p50Latency', 'p50', 'avg_latency_ms', 'avgLatencyMs'],
              0
            ),
            p95: numValue(d, ['p95_latency', 'p95Latency', 'p95', 'p95_latency_ms'], 0),
            p99: numValue(d, ['p99_latency', 'p99Latency', 'p99'], 0),
          }
        : {}),
    }));
  }

  const isQueueChart = chartConfig.groupByKey === 'queue';
  const endpointListType: TopEndpointsListType | null = !isQueueChart
    ? defaultListTypeForChart(chartConfig)
    : null;
  const showEndpointList = !isQueueChart && endpoints.length > 0 && !!endpointListType;
  const showQueueList = isQueueChart && endpoints.length > 0;

  return (
    <Surface
      elevation={1}
      padding="xs"
      className="chart-card flex flex-col"
      style={{ height: '100%', overflow: 'hidden' }}
    >
      <div className={titleClassName}>{titleContent}</div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 240, width: '100%', position: 'relative' }}>
          <ChartComponent {...chartProps} />
        </div>
        {showEndpointList && (
          <TopEndpointsList
            title={String(defaultListTitleForChart(chartConfig))}
            type={endpointListType}
            endpoints={endpoints}
            selectedEndpoints={selectedEndpoints}
            onToggle={toggleEndpoint}
            drilldownRouteTemplate={chartConfig.drilldownRoute}
          />
        )}
        {showQueueList && (
          <QueueMetricsList
            type={asQueueMetricsListType(chartConfig.listType)}
            title={String(chartConfig.listTitle || chartConfig.listType || '')}
            queues={endpoints}
            selectedQueues={selectedEndpoints}
            onToggle={toggleEndpoint}
            drilldownRouteTemplate={chartConfig.drilldownRoute}
          />
        )}
      </div>
    </Surface>
  );
}

export default function ConfigurableChartCard(props: ConfigurableChartCardProps) {
  const { description } = props.componentConfig;

  const infoIcon = description ? (
    <Tooltip content={description}>
      <span className="chart-card__info-icon">
        <Info size={14} />
      </span>
    </Tooltip>
  ) : null;

  const titleContent = props.componentConfig.titleIcon ? (
    <span className="chart-card__title-content">
      <span className="chart-card__title-icon">
        {getDashboardIcon(props.componentConfig.titleIcon, 16)}
      </span>
      <span className="chart-card__title-text">
        {props.componentConfig.title ?? props.componentConfig.id}
      </span>
      {infoIcon}
    </span>
  ) : (
    <span className="chart-card__title-content">
      <span className="chart-card__title-text">
        {props.componentConfig.title ?? props.componentConfig.id}
      </span>
      {infoIcon}
    </span>
  );

  return (
    <DashboardCardErrorBoundary
      componentId={props.componentConfig.id}
      componentKey={resolveComponentKey(props.componentConfig)}
      title={titleContent}
      showDetails={import.meta.env.DEV}
    >
      <ConfigurableChartCardContent {...props} titleContent={titleContent} />
    </DashboardCardErrorBoundary>
  );
}
