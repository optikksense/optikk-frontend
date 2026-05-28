import type { ServiceHubTab } from "../useServiceHubTab";
import { CatalogTab } from "./CatalogTab";
import { DeploysTab } from "./DeploysTab";
import { MapTab } from "./MapTab";
import { SlosTab } from "./SlosTab";

export function ServiceHubTabContent({ tab }: { tab: ServiceHubTab }) {
  switch (tab) {
    case "catalog":
      return <CatalogTab />;
    case "map":
      return <MapTab />;
    case "slos":
      return <SlosTab />;
    case "deploys":
      return <DeploysTab />;
    default:
      return null;
  }
}
