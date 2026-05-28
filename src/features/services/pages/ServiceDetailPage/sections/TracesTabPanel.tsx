import { TracesListPanel } from "../panels/TracesListPanel";

export function TracesTabPanel({ serviceName }: { serviceName: string }) {
  return <TracesListPanel serviceName={serviceName} maxRows={25} title="Recent traces" />;
}
