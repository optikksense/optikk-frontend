import { OverviewServiceMap } from "../panels/overview/OverviewServiceMap";

export function DependenciesTabPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex flex-col gap-6">
      <OverviewServiceMap serviceName={serviceName} />
    </div>
  );
}
