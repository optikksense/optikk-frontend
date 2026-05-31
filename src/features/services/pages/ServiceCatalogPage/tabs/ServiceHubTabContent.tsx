import type { ServiceHubTab } from "../useServiceHubTab";
import { CatalogTab } from "./CatalogTab";
import { MapTab } from "./MapTab";

export function ServiceHubTabContent({ tab }: { tab: ServiceHubTab }) {
  switch (tab) {
    case "catalog":
      return <CatalogTab />;
    case "map":
      return <MapTab />;
    default:
      return null;
  }
}
