import { createLazyFileRoute } from "@tanstack/react-router";

import ServiceCatalogPage from "@/features/services/pages/ServiceCatalogPage";

export const Route = createLazyFileRoute("/_app/services/")({
  component: () => <ServiceCatalogPage />,
});
