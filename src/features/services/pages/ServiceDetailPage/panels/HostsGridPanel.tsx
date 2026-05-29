import { useMemo } from "react";

import { useServiceHosts } from "../hooks/useServiceHosts";
import { HostCard } from "./HostCard";
import { PanelCard } from "./PanelCard";
import { outlierHostIds } from "./hostOutliers";

interface HostsGridPanelProps {
  readonly serviceName: string;
  readonly limit?: number;
  readonly title?: string;
  readonly subtitle?: string;
}

export function HostsGridPanel({
  serviceName,
  limit,
  title = "Hosts",
  subtitle,
}: HostsGridPanelProps) {
  const { data, isPending } = useServiceHosts(serviceName);
  const all = data ?? [];
  const rows = limit ? all.slice(0, limit) : all;
  const outliers = useMemo(() => outlierHostIds(all), [all]);
  const computedSubtitle =
    subtitle ?? (data ? `${all.length} instances` : isPending ? "Loading…" : undefined);
  return (
    <PanelCard title={title} subtitle={computedSubtitle}>
      {rows.length === 0 ? (
        <div className="grid h-[120px] place-items-center text-[12px] text-[var(--text-muted)]">
          {isPending ? "Loading…" : "No hosts emitting telemetry for this service."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((host) => (
            <HostCard key={host.host} host={host} isOutlier={outliers.has(host.host)} />
          ))}
        </div>
      )}
    </PanelCard>
  );
}
