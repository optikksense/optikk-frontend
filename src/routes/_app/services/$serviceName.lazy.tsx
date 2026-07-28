import { createLazyFileRoute } from "@tanstack/react-router";

import ServiceDetailPage from "@/features/services/pages/ServiceDetailPage/ServiceDetailPage";

export const Route = createLazyFileRoute("/_app/services/$serviceName")({
  component: () => <ServiceDetailPage />,
});
