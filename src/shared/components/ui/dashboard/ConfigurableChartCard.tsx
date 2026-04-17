import { Surface, Tooltip } from "@/components/ui";
import { Info } from "lucide-react";

import type { ComponentType, ReactNode } from "react";

import type { ApiErrorShape } from "@shared/api/api/interceptors/errorInterceptor";
import ChartErrorOverlay from "@shared/components/ui/feedback/ChartErrorOverlay";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";

import { useLocation } from "@tanstack/react-router";
import { memo, useState } from "react";

import type {
  DashboardDataSources,
  DashboardExtraContext,
  DashboardPanelSpec,
} from "@/types/dashboardConfig";
import QueueMetricsList from "@shared/components/ui/data-display/QueueMetricsList";
import type { QueueMetricsListType } from "@shared/components/ui/data-display/QueueMetricsList";
import TopEndpointsList from "@shared/components/ui/data-display/TopEndpointsList";
import type { TopEndpointsListType } from "@shared/components/ui/data-display/TopEndpointsList";

import { cn } from "@/lib/utils";
import DashboardCardErrorBoundary from "./DashboardCardErrorBoundary";
import {
  type BaseChartComponentProps,
  type SpecializedDashboardRenderer,
  useDashboardPanelRegistration,
} from "./dashboardPanelRegistry";
import { useChartCardData } from "./hooks/useChartCardData";
import { resolveComponentKey } from "./utils/dashboardFormatters";
import { defaultListTitleForChart, defaultListTypeForChart } from "./utils/dashboardListBuilders";
import { getDashboardIcon } from "./utils/dashboardUtils";

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

interface DashboardCardFrameProps {
  readonly titleContent: ReactNode;
  readonly children: ReactNode;
  readonly bodyClassName?: string;
}

function DashboardCardFrame({
  titleContent,
  children,
  bodyClassName,
}: DashboardCardFrameProps): JSX.Element {
  return (
    <Surface
      elevation={1}
      padding="xs"
      className="chart-card flex h-full min-h-0 flex-col overflow-hidden"
    >
      <div className={cn("chart-card__title")}>{titleContent}</div>
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", bodyClassName)}>
        {children}
      </div>
    </Surface>
  );
}

function asQueueMetricsListType(value: string | undefined): QueueMetricsListType {
  switch (value) {
    case "consumerLag":
    case "productionRate":
    case "consumptionRate":
      return value;
    default:
      return "depth";
  }
}

function ConfigurableChartCardContent({
  componentConfig,
  dataSources,
  error,
  isLoading = false,
  extraContext,
  titleContent,
}: ConfigurableChartCardContentProps) {
  const chartConfig = componentConfig;
  const location = useLocation();
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);

  const toggleEndpoint = (key: string) => {
    setSelectedEndpoints((prev) =>
      prev.includes(key) ? prev.filter((currentKey) => currentKey !== key) : [...prev, key]
    );
  };

  const { panelType, hasNoData, endpoints, chartProps } = useChartCardData(
    chartConfig,
    dataSources,
    selectedEndpoints
  );

  const panelRegistration = useDashboardPanelRegistration(panelType);
  const componentRenderer = panelRegistration?.component;
  const hasRenderer = Boolean(panelRegistration && componentRenderer);

  if (error) {
    return (
      <DashboardCardFrame titleContent={titleContent}>
        <ChartErrorOverlay code={error.code} message={error.message} />
      </DashboardCardFrame>
    );
  }

  if (!hasRenderer) {
    console.warn(`Unknown dashboard panel type received from backend: ${panelType || "<empty>"}`);
    return (
      <DashboardCardFrame titleContent={titleContent}>
        <div className="p-md text-muted">
          Unknown dashboard panel type: {panelType || "<empty>"}
        </div>
      </DashboardCardFrame>
    );
  }

  if (!isLoading && hasNoData) {
    return (
      <DashboardCardFrame titleContent={titleContent}>
        <ChartNoDataOverlay />
      </DashboardCardFrame>
    );
  }

  if (panelRegistration?.kind === "self-contained") {
    const SelfContainedRenderer = componentRenderer as SpecializedDashboardRenderer;

    return (
      <SelfContainedRenderer
        chartConfig={chartConfig}
        dataSources={dataSources}
        extraContext={extraContext}
        titleContent={titleContent}
        fillHeight
      />
    );
  }

  if (panelRegistration?.kind === "specialized") {
    const SpecializedRenderer = componentRenderer as SpecializedDashboardRenderer;
    return (
      <DashboardCardFrame titleContent={titleContent}>
        <div className="min-h-0 flex-1 overflow-hidden">
          <SpecializedRenderer
            chartConfig={chartConfig}
            dataSources={dataSources}
            extraContext={extraContext}
            titleContent={titleContent}
            fillHeight
          />
        </div>
      </DashboardCardFrame>
    );
  }
  const ChartComponent = componentRenderer as ComponentType<BaseChartComponentProps>;

  const isQueueChart = chartConfig.groupByKey === "queue";
  const endpointListType: TopEndpointsListType | null = !isQueueChart
    ? defaultListTypeForChart(chartConfig)
    : null;
  const showEndpointList = !isQueueChart && endpoints.length > 0 && !!endpointListType;
  const showQueueList = isQueueChart && endpoints.length > 0;

  return (
    <DashboardCardFrame titleContent={titleContent}>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Prefer chart plot area: ~60%+ of card body; list capped so rows do not dominate */}
        <div className="relative flex min-h-[58%] min-w-0 flex-1 flex-col">
          <ChartComponent {...chartProps} />
        </div>
        {(showEndpointList || showQueueList) && (
          <div className="max-h-[34%] min-h-0 shrink-0 overflow-y-auto border-[var(--glass-border)]/60 border-t pt-2">
            {showEndpointList && (
              <TopEndpointsList
                title={String(defaultListTitleForChart(chartConfig))}
                type={endpointListType}
                endpoints={endpoints}
                selectedEndpoints={selectedEndpoints}
                onToggle={toggleEndpoint}
                drawerAction={chartConfig.drawerAction}
                currentPathname={location.pathname}
                currentSearch={location.search}
              />
            )}
            {showQueueList && (
              <QueueMetricsList
                type={asQueueMetricsListType(chartConfig.listType)}
                title={String(chartConfig.listTitle || chartConfig.listType || "")}
                queues={endpoints}
                selectedQueues={selectedEndpoints}
                onToggle={toggleEndpoint}
                drawerAction={chartConfig.drawerAction}
                currentPathname={location.pathname}
                currentSearch={location.search}
              />
            )}
          </div>
        )}
      </div>
    </DashboardCardFrame>
  );
}

function ConfigurableChartCard(props: ConfigurableChartCardProps) {
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

export default memo(ConfigurableChartCard);
