import { DeployImpactTablePanel } from "../panels/DeployImpactTablePanel";
import { DeploysListPanel } from "../panels/DeploysListPanel";
import { VersionTrafficPanel } from "../panels/VersionTrafficPanel";

export function DeploysTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex flex-col gap-4">
      <VersionTrafficPanel serviceName={serviceName} />
      <DeployImpactTablePanel serviceName={serviceName} />
      <DeploysListPanel serviceName={serviceName} maxRows={25} title="Deploy history" />
    </div>
  );
}
