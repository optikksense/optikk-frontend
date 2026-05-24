import { DeploysListPanel } from "../panels/DeploysListPanel";

export function DeploysTabPanel({ serviceName }: { serviceName: string }) {
  return <DeploysListPanel serviceName={serviceName} maxRows={25} title="Deploy history" />;
}
