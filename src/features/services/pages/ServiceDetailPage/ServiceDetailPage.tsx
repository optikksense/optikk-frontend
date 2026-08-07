import { PageShell, PageSurface } from "@shared/components/ui/layout/PageShell";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";

import { ServiceHeroHeader } from "./hero/ServiceHeroHeader";
import { useServiceHeroData } from "./hooks/useServiceHeroData";
import { ServiceKpiStrip } from "./kpi/ServiceKpiStrip";
import { ServiceTabContent } from "./sections/ServiceTabContent";
import { ServiceDetailTabs } from "./tabs/ServiceDetailTabs";
import { useActiveServiceTab } from "./tabs/useActiveServiceTab";
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

function ServiceDetailBody({ serviceName }: { serviceName: string }) {
  const { timeRange, getTimeRange } = useTimeRange();
  const { startTime, endTime } = getTimeRange();
  const windowMs = Math.max(1, Number(endTime) - Number(startTime));
  const hero = useServiceHeroData(serviceName, windowMs);
  const { tab, setTab } = useActiveServiceTab();
  void timeRange;
  return (
    <div className="flex flex-col gap-4">
      <ServiceHeroHeader serviceName={serviceName} hero={hero} />
      <ServiceKpiStrip serviceName={serviceName} summary={hero.summary} />
      <ServiceDetailTabs active={tab} onChange={setTab} />
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
