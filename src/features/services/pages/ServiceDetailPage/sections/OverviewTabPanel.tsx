import { OverviewDbQueries } from "../panels/overview/OverviewDbQueries";
import { OverviewEndpointsAndResources } from "../panels/overview/OverviewEndpointsAndResources";
import { OverviewGoldenSignals } from "../panels/overview/OverviewGoldenSignals";
import { OverviewPodFleet } from "../panels/overview/OverviewPodFleet";

export function OverviewTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex flex-col gap-6">
      <OverviewGoldenSignals serviceName={serviceName} />
      <OverviewEndpointsAndResources serviceName={serviceName} />
      <OverviewDbQueries serviceName={serviceName} />
      <OverviewPodFleet serviceName={serviceName} />
    </div>
  );
}
