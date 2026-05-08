import { Card } from "@shared/components/primitives/ui";

import InfraMultiSeriesChart from "@features/infrastructure/components/InfraMultiSeriesChart";

import SectionShell from "./SectionShell";
import TopEndpointsTable from "./TopEndpointsTable";

interface ResourcesSectionProps {
  readonly serviceName: string;
}

interface PivotConfig {
  readonly key: string;
  readonly endpoint: string;
  readonly title: string;
  readonly format: "bytes" | "percentage" | "duration" | "number";
}

const PIVOTS: readonly PivotConfig[] = [
  {
    key: "svc-cpu",
    endpoint: "/v1/infrastructure/cpu/by-service",
    title: "CPU by service",
    format: "percentage",
  },
  {
    key: "svc-mem",
    endpoint: "/v1/infrastructure/memory/by-service",
    title: "Memory by service",
    format: "bytes",
  },
  {
    key: "svc-disk",
    endpoint: "/v1/infrastructure/disk/by-service",
    title: "Disk by service",
    format: "bytes",
  },
  {
    key: "svc-net",
    endpoint: "/v1/infrastructure/network/by-service",
    title: "Network by service",
    format: "bytes",
  },
  {
    key: "svc-pool",
    endpoint: "/v1/infrastructure/connpool/by-service",
    title: "Connection pool by service",
    format: "percentage",
  },
];

export default function ResourcesSection({ serviceName }: ResourcesSectionProps) {
  return (
    <SectionShell
      id="resources"
      title="Resources"
      description="Top endpoints by request volume, plus per-host resource consumption for this service."
    >
      <TopEndpointsTable serviceName={serviceName} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {PIVOTS.map((p) => (
          <Card key={p.key} padding="md" className="min-h-[300px] border-[var(--border-color)]">
            <InfraMultiSeriesChart
              queryKey={`${p.key}-${serviceName}`}
              endpoint={p.endpoint}
              title={p.title}
              groupByField="service"
              valueField="value"
              formatType={p.format}
              extraParams={{ service: serviceName }}
            />
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}
