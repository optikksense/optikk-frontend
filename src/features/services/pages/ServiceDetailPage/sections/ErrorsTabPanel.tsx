import { ErrorRatePanel } from "../panels/ErrorRatePanel";
import { ErrorsListPanel } from "../panels/ErrorsListPanel";

export function ErrorsTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex flex-col gap-4">
      <ErrorRatePanel serviceName={serviceName} />
      <ErrorsListPanel serviceName={serviceName} title="Error catalog" />
    </div>
  );
}
