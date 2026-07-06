import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ServiceCatalogPage = lazy(
  () => import("@/features/services/pages/ServiceCatalogPage/ServiceCatalogPage")
);

export const Route = createFileRoute("/_app/services/")({
  component: () => <ServiceCatalogPage />,
});
