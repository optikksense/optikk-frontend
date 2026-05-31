import type { ServiceTabId } from "../tabs/useActiveServiceTab";
import { DependenciesTabPanel } from "./DependenciesTabPanel";
import { ErrorsTabPanel } from "./ErrorsTabPanel";
import { LogsTabPanel } from "./LogsTabPanel";
import { OverviewTabPanel } from "./OverviewTabPanel";
import { TracesTabPanel } from "./TracesTabPanel";

interface ServiceTabContentProps {
  readonly tab: ServiceTabId;
  readonly serviceName: string;
}

export function ServiceTabContent({ tab, serviceName }: ServiceTabContentProps) {
  switch (tab) {
    case "overview":
      return <OverviewTabPanel serviceName={serviceName} />;
    case "errors":
      return <ErrorsTabPanel serviceName={serviceName} />;
    case "traces":
      return <TracesTabPanel serviceName={serviceName} />;
    case "logs":
      return <LogsTabPanel serviceName={serviceName} />;
    case "dependencies":
      return <DependenciesTabPanel serviceName={serviceName} />;
    default:
      return null;
  }
}
