import { useMemo } from "react";

import { PageShell } from "@shared/components/ui";

import type { CatalogRow } from "./catalog/buildCatalogRows";
import { CatalogAlertBanner } from "./header/CatalogAlertBanner";
import { ServiceCatalogHeader } from "./header/ServiceCatalogHeader";
import { useCatalogAggregate } from "./hooks/useCatalogAggregate";
import { useCatalogList } from "./hooks/useCatalogList";
import { ServiceCatalogKpiStrip } from "./kpi/ServiceCatalogKpiStrip";
import { ServiceHubTabContent } from "./tabs/ServiceHubTabContent";
import { ServiceHubTabs } from "./tabs/ServiceHubTabs";
import { useServiceHubTab } from "./useServiceHubTab";

function pickEnvironment(rows: ReadonlyArray<CatalogRow>): string | null {
  for (const row of rows) {
    if (row.environment && row.environment !== "—") return row.environment;
  }
  return null;
}

function HubBody() {
  const { rows } = useCatalogList();
  const aggregate = useCatalogAggregate(rows);
  const { tab, setTab } = useServiceHubTab();
  const environment = useMemo(() => pickEnvironment(rows), [rows]);
  const counts = {
    catalog: aggregate.totalServices,
    slos: aggregate.slosAtRisk,
    deploys: aggregate.deploys24h,
  } as const;
  return (
    <div className="flex flex-col gap-4">
      <ServiceCatalogHeader aggregate={aggregate} environment={environment} />
      <CatalogAlertBanner rows={rows} />
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
