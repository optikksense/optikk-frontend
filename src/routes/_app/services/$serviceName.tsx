import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ServiceDetailPage = lazy(() => import("@/features/services/pages/ServiceDetailPage/ServiceDetailPage"));

export const Route = createFileRoute("/_app/services/$serviceName")({
  component: () => (
        <ServiceDetailPage />

  ),
});
