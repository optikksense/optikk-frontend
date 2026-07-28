import { createLazyFileRoute } from "@tanstack/react-router";

import OverviewHubPage from "@/features/overview/pages/OverviewHubPage/OverviewHubPage";

export const Route = createLazyFileRoute("/_app/overview")({
  component: () => <OverviewHubPage />,
});
