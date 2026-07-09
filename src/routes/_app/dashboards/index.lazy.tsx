import { createLazyFileRoute } from "@tanstack/react-router";

import DashboardsPage from "@/features/dashboards/pages/DashboardsPage/DashboardsPage";

export const Route = createLazyFileRoute("/_app/dashboards/")({
  component: () => <DashboardsPage />,
});
