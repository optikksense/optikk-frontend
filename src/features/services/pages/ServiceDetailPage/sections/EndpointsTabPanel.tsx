import { EndpointsTablePanel } from "../panels/EndpointsTablePanel";

export function EndpointsTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <EndpointsTablePanel
      serviceName={serviceName}
      maxRows={50}
      title="All endpoints"
      subtitle="every resource emitted by this service, sorted by rate"
    />
  );
}
