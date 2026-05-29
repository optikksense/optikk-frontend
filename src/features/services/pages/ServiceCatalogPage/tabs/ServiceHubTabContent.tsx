import type { ServiceHubTab } from "../useServiceHubTab";
import { CatalogTab } from "./CatalogTab";
import { DeploysTab } from "./DeploysTab";
import { MapTab } from "./MapTab";

export function ServiceHubTabContent({ tab }: { tab: ServiceHubTab }) {
  switch (tab) {
    case "catalog":
      return <CatalogTab />;
    case "map":
      return <MapTab />;
    case "deploys":
      return <DeploysTab />;
    default:
      return null;
  }
}
