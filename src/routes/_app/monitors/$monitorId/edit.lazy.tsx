import { createLazyFileRoute } from "@tanstack/react-router";

import NewMonitorPage from "@/features/monitors/pages/NewMonitorPage";

export const Route = createLazyFileRoute("/_app/monitors/$monitorId/edit")({
  component: () => <NewMonitorPage />,
});
