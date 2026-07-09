import { createLazyFileRoute } from "@tanstack/react-router";

import InfrastructureHubPage from "@/features/infrastructure/pages/InfrastructureHubPage";

export const Route = createLazyFileRoute("/_app/infrastructure/")({
  component: () => <InfrastructureHubPage />,
});
