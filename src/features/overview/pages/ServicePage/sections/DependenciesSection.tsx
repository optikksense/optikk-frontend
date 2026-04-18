import DependencyTable from "./DependencyTable";
import SectionShell from "./SectionShell";
import ServiceTopologyMap from "./ServiceTopologyMap";
import { useServiceDependencies } from "./useServiceDependencies";

interface DependenciesSectionProps {
  readonly serviceName: string;
}

function SubHeader({ label }: { label: string }) {
  return (
    <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
      {label}
    </div>
  );
}

export default function DependenciesSection({ serviceName }: DependenciesSectionProps) {
  const { topology, upstream, downstream, loading } = useServiceDependencies(serviceName);

  return (
    <SectionShell
      id="dependencies"
      title="Dependencies"
      description="One-hop topology around this service, plus upstream callers and downstream dependencies. Double-click a node or click a row to jump."
    >
      <div className="flex flex-col gap-4">
        <ServiceTopologyMap topology={topology} loading={loading} />
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <SubHeader label="Upstream callers" />
            <DependencyTable
              rows={upstream}
              emptyMessage="No upstream callers observed."
              loading={loading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <SubHeader label="Downstream dependencies" />
            <DependencyTable
              rows={downstream}
              emptyMessage="No downstream calls observed."
              loading={loading}
            />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
