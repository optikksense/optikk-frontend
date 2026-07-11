import { createLazyFileRoute } from "@tanstack/react-router";

import MonitorsPage from "@/features/monitors/pages/MonitorsPage";

export const Route = createLazyFileRoute("/_app/monitors/")({
  component: () => <MonitorsPage />,
});
