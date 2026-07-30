import { createLazyFileRoute } from "@tanstack/react-router";

import DeploymentsPage from "@/features/deployments/pages/DeploymentsPage/DeploymentsPage";

export const Route = createLazyFileRoute("/_app/deployments/")({
  component: () => <DeploymentsPage />,
});
