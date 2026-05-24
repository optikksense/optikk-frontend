import { HostsGridPanel } from "../panels/HostsGridPanel";

export function InfraTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <HostsGridPanel
      serviceName={serviceName}
      title="Instances"
      subtitle="hosts and pods emitting telemetry for this service"
    />
  );
}
