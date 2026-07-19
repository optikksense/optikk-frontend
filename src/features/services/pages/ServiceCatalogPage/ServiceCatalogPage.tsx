import { useMemo } from "react";

import { PageShell } from "@shared/components/ui";

import type { CatalogRow } from "./catalog/buildCatalogRows";
import { ServiceCatalogHeader } from "./header/ServiceCatalogHeader";
import { useCatalogAggregate } from "./hooks/useCatalogAggregate";
import { useCatalogList } from "./hooks/useCatalogList";
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
  const { rows, summary, comparison } = useCatalogList();
  const aggregate = useCatalogAggregate(rows, summary, comparison);
  const { tab, setTab } = useServiceHubTab();
  const environment = useMemo(() => pickEnvironment(rows), [rows]);
  const counts = {
    catalog: aggregate.totalServices,
  } as const;
  return (
    <div className="flex flex-col gap-[22px]">
      <ServiceCatalogHeader aggregate={aggregate} environment={environment} />
      <ServiceHubTabs active={tab} counts={counts} onChange={setTab} />
      <ServiceHubTabContent tab={tab} />
    </div>
  );
}

export default function ServiceCatalogPage() {
  return (
    <PageShell className="-m-4 max-md:-m-3 !gap-[22px] p-[22px_30px_40px] max-md:p-3">
      <HubBody />
    </PageShell>
  );
}
