import type { ServiceTabId } from "../tabs/useActiveServiceTab";
import { DeploysTabPanel } from "./DeploysTabPanel";
import { EndpointsTabPanel } from "./EndpointsTabPanel";
import { ErrorsTabPanel } from "./ErrorsTabPanel";
import { InfraTabPanel } from "./InfraTabPanel";
import { OverviewTabPanel } from "./OverviewTabPanel";
import { PlaceholderTabPanel } from "./PlaceholderTabPanel";
import { TracesTabPanel } from "./TracesTabPanel";

interface ServiceTabContentProps {
  readonly tab: ServiceTabId;
  readonly serviceName: string;
}

export function ServiceTabContent({ tab, serviceName }: ServiceTabContentProps) {
  switch (tab) {
    case "overview":
      return <OverviewTabPanel serviceName={serviceName} />;
    case "endpoints":
      return <EndpointsTabPanel serviceName={serviceName} />;
    case "traces":
      return <TracesTabPanel serviceName={serviceName} />;
    case "errors":
      return <ErrorsTabPanel serviceName={serviceName} />;
    case "infra":
      return <InfraTabPanel serviceName={serviceName} />;
    case "deploys":
      return <DeploysTabPanel serviceName={serviceName} />;
    case "logs":
      return (
        <PlaceholderTabPanel
          title="Correlated logs"
          description="All log lines emitted by this service, time-aligned. Drill into a trace from here to see logs around any span."
        />
      );
    case "code":
      return (
        <PlaceholderTabPanel
          title="Code"
          description="Recent commits, open pull requests, and continuous-profiler flame graph for this service."
        />
      );
    default:
      return null;
  }
}
