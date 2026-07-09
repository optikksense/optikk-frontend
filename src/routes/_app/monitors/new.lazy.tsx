import { createLazyFileRoute } from "@tanstack/react-router";

import NewMonitorPage from "@/features/monitors/pages/NewMonitorPage/NewMonitorPage";

export const Route = createLazyFileRoute("/_app/monitors/new")({
  component: () => <NewMonitorPage />,
});
