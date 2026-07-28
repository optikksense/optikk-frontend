import { createLazyFileRoute } from "@tanstack/react-router";

import DashboardDetailPage from "@/features/dashboards/pages/DashboardDetailPage/DashboardDetailPage";

export const Route = createLazyFileRoute("/_app/dashboards/$pageId")({
  component: () => <DashboardDetailPage />,
});
