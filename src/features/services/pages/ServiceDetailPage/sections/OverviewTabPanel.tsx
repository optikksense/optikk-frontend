import { OverviewEndpointsAndResources } from "../panels/overview/OverviewEndpointsAndResources";
import { OverviewErrors } from "../panels/overview/OverviewErrors";
import { OverviewGoldenSignals } from "../panels/overview/OverviewGoldenSignals";
import { OverviewPodFleet } from "../panels/overview/OverviewPodFleet";
import { OverviewRecentTraces } from "../panels/overview/OverviewRecentTraces";

export function OverviewTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex flex-col gap-6">
      <OverviewGoldenSignals serviceName={serviceName} />
      <OverviewEndpointsAndResources serviceName={serviceName} />
      <OverviewPodFleet serviceName={serviceName} />
      <OverviewErrors serviceName={serviceName} />
      <OverviewRecentTraces serviceName={serviceName} />
    </div>
  );
}
