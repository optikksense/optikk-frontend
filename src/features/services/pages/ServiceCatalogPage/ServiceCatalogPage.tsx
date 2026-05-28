import { PageShell } from "@shared/components/ui";

import { ServiceCatalogHeader } from "./header/ServiceCatalogHeader";
import { useCatalogAggregate } from "./hooks/useCatalogAggregate";
import { ServiceCatalogKpiStrip } from "./kpi/ServiceCatalogKpiStrip";
import { ServiceHubTabContent } from "./tabs/ServiceHubTabContent";
import { ServiceHubTabs } from "./tabs/ServiceHubTabs";
import { useServiceHubTab } from "./useServiceHubTab";

function HubBody() {
  const { aggregate } = useCatalogAggregate();
  const { tab, setTab } = useServiceHubTab();
  const counts = {
    catalog: aggregate.totalServices,
    slos: aggregate.slosAtRisk,
    deploys: aggregate.deploys24h,
  } as const;
  return (
    <div className="flex flex-col gap-4">
      <ServiceCatalogHeader aggregate={aggregate} />
      <ServiceCatalogKpiStrip aggregate={aggregate} />
      <ServiceHubTabs active={tab} counts={counts} onChange={setTab} />
      <ServiceHubTabContent tab={tab} />
    </div>
  );
}

export default function ServiceCatalogPage() {
  return (
    <PageShell>
      <HubBody />
    </PageShell>
  );
}
