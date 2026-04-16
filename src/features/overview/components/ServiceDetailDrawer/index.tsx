import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { ServiceDrawerCockpitCard } from "./components/ServiceDrawerCockpitCard";
import { ServiceDrawerDependenciesSection } from "./components/ServiceDrawerDependenciesSection";
import { ServiceDrawerEndpointsSection } from "./components/ServiceDrawerEndpointsSection";
import { ServiceDrawerHeader } from "./components/ServiceDrawerHeader";
import { ServiceDrawerMetricBanners } from "./components/ServiceDrawerMetricBanners";
import { ServiceDrawerStatGrid } from "./components/ServiceDrawerStatGrid";
import { ServiceDrawerTrendCharts } from "./components/ServiceDrawerTrendCharts";
import { useServiceDetailDrawerModel } from "./hooks/useServiceDetailDrawerModel";
import type { ServiceDetailDrawerProps } from "./types";

export default function ServiceDetailDrawer({
  open,
  onClose,
  serviceName,
  title,
  initialData,
}: ServiceDetailDrawerProps) {
  const model = useServiceDetailDrawerModel(serviceName, title, initialData);

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      direction="right"
    >
      <DrawerContent
        className="top-[var(--space-header-h,56px)] right-0 bottom-0 left-auto z-[1100] h-auto select-text overflow-y-auto border-[var(--border-color)] border-l"
        style={{
          width: "min(980px, calc(100vw - 24px))",
          userSelect: "text",
          WebkitUserSelect: "text",
        }}
      >
        <ServiceDrawerHeader
          serviceLabel={model.serviceLabel}
          summaryMetrics={model.summaryMetrics}
          onOpenTraces={model.openTraces}
          onOpenLogs={model.openLogs}
        />

        <div className="flex flex-col gap-4 px-6 py-4">
          <ServiceDrawerCockpitCard
            serviceLabel={model.serviceLabel}
            summaryMetrics={model.summaryMetrics}
          />

          <ServiceDrawerStatGrid
            summaryMetrics={model.summaryMetrics}
            summaryLoading={model.summaryLoading}
            requestSparkline={model.requestSparkline}
            errorSparkline={model.errorSparkline}
            latencySparkline={model.latencySparkline}
          />

          <ServiceDrawerMetricBanners
            metricsError={model.metricsQuery.isError}
            hasSummary={model.hasSummary}
            summaryLoading={model.summaryLoading}
          />

          <ServiceDrawerTrendCharts
            summaryMetrics={model.summaryMetrics}
            requestTrendSeries={model.requestTrendSeries}
            errorTrendSeries={model.errorTrendSeries}
            latencyTrendSeries={model.latencyTrendSeries}
            requestTrendLoading={model.requestTrendLoading}
            errorTrendLoading={model.errorTrendLoading}
            latencyTrendLoading={model.latencyTrendLoading}
            requestTrendError={model.requestTrendQuery.isError}
            errorTrendError={model.errorTrendQuery.isError}
            latencyTrendError={model.latencyTrendQuery.isError}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <ServiceDrawerEndpointsSection
              isError={model.endpointsQuery.isError}
              isLoading={model.endpointsLoading}
              endpointRows={model.endpointRows}
            />
            <ServiceDrawerDependenciesSection
              isError={model.dependenciesQuery.isError}
              isLoading={model.dependenciesLoading}
              upstreamRows={model.upstreamRows}
              downstreamRows={model.downstreamRows}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
