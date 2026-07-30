import { createLazyFileRoute } from "@tanstack/react-router";

import DeploymentComparePage from "@/features/deployments/pages/DeploymentComparePage/DeploymentComparePage";

export const Route = createLazyFileRoute("/_app/deployments/$service/$version")({
  component: () => <DeploymentComparePage />,
});
