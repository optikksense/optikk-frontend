import { EndpointsTablePanel } from "../panels/EndpointsTablePanel";
import { ErrorRatePanel } from "../panels/ErrorRatePanel";
import { ErrorsListPanel } from "../panels/ErrorsListPanel";
import { LatencyPanel } from "../panels/LatencyPanel";
import { RpsStatusPanel } from "../panels/RpsStatusPanel";

export function OverviewTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RpsStatusPanel serviceName={serviceName} />
        <LatencyPanel serviceName={serviceName} />
        <ErrorRatePanel serviceName={serviceName} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EndpointsTablePanel serviceName={serviceName} maxRows={6} />
        </div>
        <ErrorsListPanel serviceName={serviceName} maxRows={6} />
      </div>
    </div>
  );
}
