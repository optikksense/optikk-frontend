import { useMemo } from "react";

import { PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";

import { ServiceHeroHeader } from "./hero/ServiceHeroHeader";
import { useServiceErrors } from "./hooks/useServiceErrors";
import { useServiceHeroData } from "./hooks/useServiceHeroData";
import { useServiceHosts } from "./hooks/useServiceHosts";
import { ServiceKpiStrip } from "./kpi/ServiceKpiStrip";
import { ServiceTabContent } from "./sections/ServiceTabContent";
import { ServiceDetailTabs } from "./tabs/ServiceDetailTabs";
import { type ServiceTabId, useActiveServiceTab } from "./tabs/useActiveServiceTab";
import { useServiceDetailIdentity } from "./useServiceDetailIdentity";

function InvalidIdentity() {
  return (
    <PageShell>
      <PageSurface padding="lg">
        <div className="text-[13px] text-foreground-muted">
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
  const errorsQ = useServiceErrors(serviceName);
  return useMemo(() => {
    const counts: Partial<Record<ServiceTabId, number>> = {};
    if (errorsQ.data?.results) counts.errors = errorsQ.data.results.length;
    return { counts, instanceCount: hostsQ.data?.length ?? null };
  }, [hostsQ.data, errorsQ.data]);
}

function ServiceDetailBody({ serviceName }: { serviceName: string }) {
  const { timeRange, getTimeRange } = useTimeRange();
  const { startTime, endTime } = getTimeRange();
  const windowMs = Math.max(1, Number(endTime) - Number(startTime));
  const hero = useServiceHeroData(serviceName, windowMs);
  const { tab, setTab } = useActiveServiceTab();
  const { counts, instanceCount } = useTabCounts(serviceName);
  void timeRange;
  return (
    <div className="flex flex-col gap-4">
      <ServiceHeroHeader serviceName={serviceName} hero={hero} instanceCount={instanceCount} />
      <ServiceKpiStrip serviceName={serviceName} summary={hero.summary} />
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
