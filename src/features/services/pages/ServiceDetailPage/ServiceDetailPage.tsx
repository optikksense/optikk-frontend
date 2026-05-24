import { useMemo } from "react";

import { PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";

import { ServiceHeroHeader } from "./hero/ServiceHeroHeader";
import { useServiceHeroData } from "./hooks/useServiceHeroData";
import { useServiceHosts } from "./hooks/useServiceHosts";
import { useServiceTopology } from "./hooks/useServiceTopology";
import { useSloStats } from "./hooks/useSloStats";
import { ServiceKpiStrip } from "./kpi/ServiceKpiStrip";
import { ServiceTabContent } from "./sections/ServiceTabContent";
import { ServiceDetailTabs } from "./tabs/ServiceDetailTabs";
import { type ServiceTabId, useActiveServiceTab } from "./tabs/useActiveServiceTab";
import { useServiceDetailIdentity } from "./useServiceDetailIdentity";

function InvalidIdentity() {
  return (
    <PageShell>
      <PageSurface padding="lg">
        <div className="text-[13px] text-[var(--text-muted)]">
          This URL does not contain a service name.
        </div>
      </PageSurface>
    </PageShell>
  );
}

function useTabCounts(serviceName: string): {
  counts: Partial<Record<ServiceTabId, number>>;
  instanceCount: number | null;
} {
  const hostsQ = useServiceHosts(serviceName);
  const { dependencies } = useServiceTopology(serviceName);
  return useMemo(() => {
    const counts: Partial<Record<ServiceTabId, number>> = {};
    if (hostsQ.data) counts.infra = hostsQ.data.length;
    const deps = dependencies.upstream.length + dependencies.downstream.length;
    if (deps > 0) counts.overview = deps;
    return { counts, instanceCount: hostsQ.data?.length ?? null };
  }, [hostsQ.data, dependencies]);
}

function ServiceDetailBody({ serviceName }: { serviceName: string }) {
  const { timeRange, getTimeRange } = useTimeRange();
  const { startTime, endTime } = getTimeRange();
  const windowMs = Math.max(1, Number(endTime) - Number(startTime));
  const hero = useServiceHeroData(serviceName, windowMs);
  const slo = useSloStats(serviceName);
  const { tab, setTab } = useActiveServiceTab();
  const { counts, instanceCount } = useTabCounts(serviceName);
  void timeRange;
  return (
    <div className="flex flex-col gap-4">
      <ServiceHeroHeader serviceName={serviceName} hero={hero} instanceCount={instanceCount} />
      <ServiceKpiStrip summary={hero.summary} slo={slo.data} />
      <ServiceDetailTabs active={tab} counts={counts} onChange={setTab} />
      <ServiceTabContent tab={tab} serviceName={serviceName} />
    </div>
  );
}

export default function ServiceDetailPage() {
  const identity = useServiceDetailIdentity();
  if (!identity.isValid) return <InvalidIdentity />;
  return (
    <PageShell>
      <ServiceDetailBody serviceName={identity.serviceName} />
    </PageShell>
  );
}
