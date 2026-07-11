import { createLazyFileRoute } from "@tanstack/react-router";

import MonitorDetailPage from "@/features/monitors/pages/MonitorDetailPage";

export const Route = createLazyFileRoute("/_app/monitors/$monitorId")({
  component: () => <MonitorDetailPage />,
});
